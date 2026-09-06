const express = require("express");
const { XMLParser } = require("fast-xml-parser");

const app = express();
const PORT = process.env.PORT || 3000;

/*
========================================================
SIH 26002
AI-Based Smart Logistics & Accessibility Intelligence
Platform for North Eastern Region

Government disaster data source:
SACHET / NDMA India CAP Feed
========================================================
*/


/*
========================================================
SACHET / NDMA
========================================================
*/

const SACHET_RSS_URL =
  "https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml";

const SACHET_CAP_XML_URL =
  "https://sachet.ndma.gov.in/cap_public_website/FetchXMLFile?identifier=";


/*
========================================================
CACHE CONFIGURATION
========================================================
*/

const RSS_CACHE_MS = 60 * 1000;          // 1 minute
const REQUEST_TIMEOUT_MS = 20000;        // RSS timeout
const CAP_XML_TIMEOUT_MS = 12000;        // CAP XML timeout
const CAP_CACHE_MS = 6 * 60 * 60 * 1000; // 6 hours

const CAP_CONCURRENCY = 5;


/*
========================================================
MEMORY CACHE
========================================================
*/

let cachedAlerts = null;
let cachedETag = null;
let cachedAt = 0;

/*
Individual CAP XML cache.

identifier -> {
    data,
    cachedAt
}
*/

const capCache = new Map();


/*
========================================================
EXPRESS
========================================================
*/

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.use(
    express.static(__dirname, {
        extensions: ["html"],
    })
);


/*
========================================================
UTILITY FUNCTIONS
========================================================
*/


function text(value) {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value).trim();
  }

  if (typeof value === "object") {
    if (value.__cdata !== undefined) {
      return String(value.__cdata).trim();
    }

    if (value["#text"] !== undefined) {
      return String(value["#text"]).trim();
    }

    if (value.value !== undefined) {
      return String(value.value).trim();
    }
  }

  return "";
}


function arr(value) {
  if (value === undefined || value === null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}


function first(value) {
  return arr(value)[0] || null;
}


function firstNonEmpty(...values) {
  for (const value of values) {
    const result = text(value);

    if (result) {
      return result;
    }
  }

  return "";
}


function cleanHTML(value) {
  return text(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}


function safeDate(value) {
  const raw = text(value);

  if (!raw) {
    return null;
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toISOString();
}


function normalizeSeverity(value) {
  const severity = text(value).toUpperCase();

  if (severity === "EXTREME") return "Extreme";
  if (severity === "SEVERE") return "Severe";
  if (severity === "MODERATE") return "Moderate";
  if (severity === "MINOR") return "Minor";

  /*
  CAP may contain "UNKNOWN".
  */
  if (severity === "UNKNOWN") {
    return "Unknown";
  }

  return severity
    ? severity.charAt(0) +
        severity.slice(1).toLowerCase()
    : "Unknown";
}


function severityColor(severity) {
  switch (
    normalizeSeverity(severity).toUpperCase()
  ) {
    case "EXTREME":
      return "red";

    case "SEVERE":
      return "orange";

    case "MODERATE":
      return "yellow";

    case "MINOR":
      return "yellow";

    default:
      return "gray";
  }
}


/*
========================================================
CAP POLYGON PARSER
========================================================

CAP polygon:

latitude,longitude latitude,longitude ...

Example:

25.123,91.123 25.456,91.456
========================================================
*/

function parsePolygon(value) {
  const raw = text(value);

  if (!raw) {
    return null;
  }

  const points = [];

  /*
  Some feeds may use newline instead of spaces.
  */
  const tokens = raw
    .replace(/\n/g, " ")
    .replace(/\r/g, " ")
    .split(/\s+/);

  for (const token of tokens) {
    const parts = token.split(",");

    if (parts.length < 2) {
      continue;
    }

    const lat = Number(parts[0]);
    const lon = Number(parts[1]);

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lon) &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    ) {
      points.push({
        lat,
        lon,
      });
    }
  }

  /*
  A polygon needs at least 3 points.
  */
  return points.length >= 3
    ? points
    : null;
}


/*
========================================================
POLYGON CENTROID
========================================================
*/

function polygonCentroid(polygon) {
  if (
    !Array.isArray(polygon) ||
    polygon.length === 0
  ) {
    return null;
  }

  let lat = 0;
  let lon = 0;

  for (const point of polygon) {
    lat += point.lat;
    lon += point.lon;
  }

  return {
    lat: lat / polygon.length,
    lon: lon / polygon.length,
  };
}


/*
========================================================
CAP CIRCLE PARSER
========================================================

CAP circle:

latitude,longitude radius

Radius is METERS.

Example:

26.1445,91.7362 50000
========================================================
*/

function parseCircle(value) {
  const raw = text(value);

  if (!raw) {
    return null;
  }

  const parts = raw
    .replace(/\n/g, " ")
    .replace(/\r/g, " ")
    .trim()
    .split(/\s+/);

  if (!parts[0]) {
    return null;
  }

  const coordinates = parts[0].split(",");

  if (coordinates.length < 2) {
    return null;
  }

  const lat = Number(coordinates[0]);
  const lon = Number(coordinates[1]);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return null;
  }

  let radiusM = null;

  if (parts[1]) {
    const parsedRadius = Number(parts[1]);

    if (
      Number.isFinite(parsedRadius) &&
      parsedRadius >= 0
    ) {
      radiusM = parsedRadius;
    }
  }

  return {
    lat,
    lon,
    radiusM,
    radiusKm:
      radiusM !== null
        ? radiusM / 1000
        : null,
  };
}


/*
========================================================
GET CAP AREA
========================================================
*/

function getAreas(info) {
  const areas = [];

  for (const currentInfo of arr(info)) {
    areas.push(
      ...arr(
        currentInfo?.area ||
          currentInfo?.Area ||
          currentInfo?.["cap:area"]
      )
    );
  }

  return areas;
}


/*
========================================================
EXTRACT GEOMETRY
========================================================
*/

function extractGeometryFromInfo(info) {
  let polygon = null;
  let circle = null;

  const areas = getAreas(info);

  for (const area of areas) {
    if (!polygon) {
      polygon = parsePolygon(
        firstNonEmpty(
          area?.polygon,
          area?.Polygon,
          area?.["cap:polygon"]
        )
      );
    }

    if (!circle) {
      circle = parseCircle(
        firstNonEmpty(
          area?.circle,
          area?.Circle,
          area?.["cap:circle"]
        )
      );
    }

    if (polygon || circle) {
      break;
    }
  }

  return {
    polygon,
    circle,
  };
}


/*
========================================================
EXTRACT RSS GEOMETRY
========================================================
*/

function extractGeometryFromRSSItem(item) {
  let polygon = null;
  let circle = null;

  /*
  Geometry directly inside RSS item.
  */

  polygon = parsePolygon(
    firstNonEmpty(
      item?.polygon,
      item?.Polygon,
      item?.["cap:polygon"]
    )
  );

  circle = parseCircle(
    firstNonEmpty(
      item?.circle,
      item?.Circle,
      item?.["cap:circle"]
    )
  );

  /*
  Geometry inside info/area.
  */

  if (!polygon || !circle) {
    const geometry =
      extractGeometryFromInfo(
        item?.info ||
          item?.Info ||
          item?.["cap:info"]
      );

    polygon = polygon || geometry.polygon;
    circle = circle || geometry.circle;
  }

  return {
    polygon,
    circle,
  };
}


/*
========================================================
IDENTIFIER EXTRACTION
========================================================
*/

function extractIdentifier(item) {
  const candidates = [
    item?.identifier,
    item?.Identifier,
    item?.["cap:identifier"],

    item?.guid,
    item?.GUID,

    item?.id,
    item?.ID,

    item?.["cap:id"],
  ];

  for (const candidate of candidates) {
    const value = text(candidate);

    if (value) {
      return value;
    }
  }

  return null;
}


/*
========================================================
RSS LINK
========================================================
*/

function extractLink(item) {
  const link = item?.link;

  if (typeof link === "string") {
    return link.trim();
  }

  if (link && typeof link === "object") {
    return (
      text(link.href) ||
      text(link["@_href"]) ||
      text(link["#text"]) ||
      ""
    );
  }

  return "";
}


/*
========================================================
GEO CODE EXTRACTION
========================================================
*/

function extractGeocodes(info) {
  const result = [];

  for (const currentInfo of arr(info)) {
    for (const area of arr(
      currentInfo?.area ||
        currentInfo?.Area ||
        currentInfo?.["cap:area"]
    )) {
      for (const geocode of arr(
        area?.geocode ||
          area?.GeoCode ||
          area?.["cap:geocode"]
      )) {
        const valueName = firstNonEmpty(
          geocode?.valueName,
          geocode?.ValueName,
          geocode?.["cap:valueName"]
        );

        const value = firstNonEmpty(
          geocode?.value,
          geocode?.Value,
          geocode?.["cap:value"]
        );

        if (valueName || value) {
          result.push({
            valueName,
            value,
          });
        }
      }
    }
  }

  return result;
}


/*
========================================================
EXTRACT CAP METADATA
========================================================
*/

function extractCAPMetadata(capAlert) {
  const info = first(
    capAlert?.info ||
      capAlert?.Info ||
      capAlert?.["cap:info"]
  );

  const areas = getAreas(info);

  const areaDescriptions = [];

  for (const area of areas) {
    const description = cleanHTML(
      firstNonEmpty(
        area?.areaDesc,
        area?.AreaDesc,
        area?.["cap:areaDesc"]
      )
    );

    if (description) {
      areaDescriptions.push(
        description
      );
    }
  }

  const geometry =
    extractGeometryFromInfo(info);

  const polygon = geometry.polygon;
  const circle = geometry.circle;

  const centroid =
    polygonCentroid(polygon) ||
    (circle
      ? {
          lat: circle.lat,
          lon: circle.lon,
        }
      : null);

  const category = firstNonEmpty(
    info?.category,
    info?.Category,
    info?.["cap:category"]
  );

  const event = cleanHTML(
    firstNonEmpty(
      info?.event,
      info?.Event,
      info?.["cap:event"]
    )
  );

  const headline = cleanHTML(
    firstNonEmpty(
      info?.headline,
      info?.Headline,
      info?.["cap:headline"]
    )
  );

  const description = cleanHTML(
    firstNonEmpty(
      info?.description,
      info?.Description,
      info?.["cap:description"]
    )
  );

  const instruction = cleanHTML(
    firstNonEmpty(
      info?.instruction,
      info?.Instruction,
      info?.["cap:instruction"]
    )
  );

  const severity = normalizeSeverity(
    firstNonEmpty(
      info?.severity,
      info?.Severity,
      info?.["cap:severity"]
    )
  );

  const urgency = firstNonEmpty(
    info?.urgency,
    info?.Urgency,
    info?.["cap:urgency"]
  );

  const certainty = firstNonEmpty(
    info?.certainty,
    info?.Certainty,
    info?.["cap:certainty"]
  );

  const effective = safeDate(
    firstNonEmpty(
      info?.effective,
      info?.Effective,
      info?.["cap:effective"]
    )
  );

  const expires = safeDate(
    firstNonEmpty(
      info?.expires,
      info?.Expires,
      info?.["cap:expires"]
    )
  );

  return {
    identifier: firstNonEmpty(
      capAlert?.identifier,
      capAlert?.Identifier,
      capAlert?.["cap:identifier"]
    ) || null,

    sender: firstNonEmpty(
      capAlert?.sender,
      capAlert?.Sender
    ) || null,

    sent: safeDate(
      firstNonEmpty(
        capAlert?.sent,
        capAlert?.Sent
      )
    ),

    status: firstNonEmpty(
      capAlert?.status,
      capAlert?.Status
    ) || null,

    msgType: firstNonEmpty(
      capAlert?.msgType,
      capAlert?.MsgType
    ) || null,

    scope: firstNonEmpty(
      capAlert?.scope,
      capAlert?.Scope
    ) || null,

    senderName: firstNonEmpty(
      info?.senderName,
      info?.SenderName
    ) || null,

    category,
    event,
    headline,
    description,
    instruction,

    severity,
    severityColor:
      severityColor(severity),

    urgency,
    certainty,

    effective,
    expires,

    areaDesc:
      areaDescriptions.join(", "),

    geocodes:
      extractGeocodes(info),

    polygon,
    circle,
    centroid,

    geometrySource:
      polygon
        ? "SACHET CAP XML polygon"
        : circle
          ? "SACHET CAP XML circle"
          : null,

    geometryAvailable:
      Boolean(polygon || circle),
  };
}


/*
========================================================
NORMALIZE RSS ALERT
========================================================
*/

function normalizeAlert(item) {
  const info = first(
    item?.info ||
      item?.Info ||
      item?.["cap:info"]
  );

  const geometry =
    extractGeometryFromRSSItem(item);

  const polygon = geometry.polygon;
  const circle = geometry.circle;

  const centroid =
    polygonCentroid(polygon) ||
    (circle
      ? {
          lat: circle.lat,
          lon: circle.lon,
        }
      : null);

  const identifier =
    extractIdentifier(item);

  const areas = getAreas(info);

  /*
  Some RSS implementations put area
  directly inside item.
  */

  const directAreas =
    areas.length > 0
      ? areas
      : arr(
          item?.area ||
            item?.Area ||
            item?.["cap:area"]
        );

  const areaDescriptions = [];

  for (const area of directAreas) {
    const description = cleanHTML(
      firstNonEmpty(
        area?.areaDesc,
        area?.AreaDesc,
        area?.["cap:areaDesc"]
      )
    );

    if (description) {
      areaDescriptions.push(
        description
      );
    }
  }

  const headline = cleanHTML(
    firstNonEmpty(
      info?.headline,
      info?.Headline,
      info?.["cap:headline"],

      item?.headline,
      item?.Headline,

      item?.title,
      item?.Title
    )
  );

  const event = cleanHTML(
    firstNonEmpty(
      info?.event,
      info?.Event,
      info?.["cap:event"],

      item?.event,
      item?.Event
    )
  );

  const description = cleanHTML(
    firstNonEmpty(
      info?.description,
      info?.Description,
      info?.["cap:description"],

      item?.description,
      item?.Description
    )
  );

  const instruction = cleanHTML(
    firstNonEmpty(
      info?.instruction,
      info?.Instruction,
      info?.["cap:instruction"]
    )
  );

  const category = firstNonEmpty(
    info?.category,
    info?.Category,
    info?.["cap:category"],

    item?.category,
    item?.Category
  );

  const severity = normalizeSeverity(
    firstNonEmpty(
      info?.severity,
      info?.Severity,
      info?.["cap:severity"],

      item?.severity,
      item?.Severity
    )
  );

  const urgency = firstNonEmpty(
    info?.urgency,
    info?.Urgency,
    info?.["cap:urgency"],

    item?.urgency,
    item?.Urgency
  );

  const certainty = firstNonEmpty(
    info?.certainty,
    info?.Certainty,
    info?.["cap:certainty"],

    item?.certainty,
    item?.Certainty
  );

  const effective = safeDate(
    firstNonEmpty(
      info?.effective,
      info?.Effective,
      info?.["cap:effective"],

      item?.effective,
      item?.Effective,

      item?.pubDate,
      item?.PubDate
    )
  );

  const expires = safeDate(
    firstNonEmpty(
      info?.expires,
      info?.Expires,
      info?.["cap:expires"],

      item?.expires,
      item?.Expires
    )
  );

  const areaDesc =
    areaDescriptions.join(", ");

  return {
    identifier,

    headline,
    event,
    description,
    instruction,

    category,

    severity,
    severityColor:
      severityColor(severity),

    urgency,
    certainty,

    effective,
    expires,

    areaDesc,

    /*
    Aliases are intentionally provided so
    frontend versions using different names
    continue working.
    */

    area_description: areaDesc,
    areaDescription: areaDesc,

    geocodes:
      extractGeocodes(
        info || item
      ),

    polygon,
    circle,
    centroid,

    link:
      extractLink(item),

    source:
      "SACHET / NDMA",

    sourceType:
      "Government CAP Alert",

    geometrySource:
      polygon
        ? "SACHET CAP polygon"
        : circle
          ? "SACHET CAP circle"
          : null,

    geometryAvailable:
      Boolean(polygon || circle),

    status:
      firstNonEmpty(
        item?.status,
        item?.Status
      ) || null,

    msgType:
      firstNonEmpty(
        item?.msgType,
        item?.MsgType
      ) || null,

    sender:
      firstNonEmpty(
        item?.sender,
        item?.Sender
      ) || null,

    sent:
      safeDate(
        firstNonEmpty(
          item?.sent,
          item?.Sent
        )
      ),

    rawTitle:
      cleanHTML(
        firstNonEmpty(
          item?.title,
          item?.Title
        )
      ),
  };
}


/*
========================================================
XML PARSER
========================================================
*/

const xmlParser =
  new XMLParser({
    ignoreAttributes: false,

    attributeNamePrefix: "@_",

    removeNSPrefix: true,

    cdataPropName:
      "__cdata",

    trimValues: true,

    /*
    Important:
    CAP XML/RSS may have repeated
    elements or single elements.
    */

    isArray: (name) => {
      return [
        "item",
        "info",
        "area",
        "geocode",
      ].includes(name);
    },
  });


/*
========================================================
FETCH WITH TIMEOUT
========================================================
*/

async function fetchWithTimeout(
  url,
  options = {},
  timeout = REQUEST_TIMEOUT_MS
) {
  const controller =
    new AbortController();

  const timer =
    setTimeout(() => {
      controller.abort();
    }, timeout);

  try {
    return await fetch(url, {
      ...options,
      signal:
        controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}


/*
========================================================
PARSE RSS
========================================================
*/

async function parseRSS(xml) {
  if (!xml || !xml.trim()) {
    throw new Error(
      "SACHET returned an empty RSS response."
    );
  }

  const parsed =
    xmlParser.parse(xml);

  const channel =
    parsed?.rss?.channel ||
    parsed?.channel ||
    parsed?.feed ||
    {};

  const items =
    arr(channel?.item);

  /*
  Some feeds may expose entries
  instead of item.
  */

  const entries =
    items.length > 0
      ? items
      : arr(channel?.entry);

  if (
    entries.length === 0
  ) {
    console.warn(
      "SACHET RSS parsed successfully but no items were found."
    );
  }

  return entries.map(
    normalizeAlert
  );
}


/*
========================================================
FETCH INDIVIDUAL CAP XML
========================================================

This is the important correction.

Previously the backend fetched CAP XML mainly
for geometry.

Now it extracts:

- headline
- event
- description
- instruction
- severity
- urgency
- certainty
- effective
- expires
- areaDesc
- geocodes
- polygon
- circle
- sender
- status
- msgType
- scope
========================================================
*/

async function fetchCAPXML(
  identifier
) {
  if (!identifier) {
    return null;
  }

  /*
  Check CAP cache.
  */

  const existing =
    capCache.get(identifier);

  if (
    existing &&
    Date.now() -
      existing.cachedAt <
      CAP_CACHE_MS
  ) {
    return existing.data;
  }

  const url =
    SACHET_CAP_XML_URL +
    encodeURIComponent(
      identifier
    );

  try {
    const response =
      await fetchWithTimeout(
        url,
        {
          headers: {
            Accept:
              "application/xml,text/xml,*/*",

            "User-Agent":
              "SIH-26002-Logistics-Intelligence/2.0",
          },
        },
        CAP_XML_TIMEOUT_MS
      );

    if (!response.ok) {
      console.warn(
        `SACHET CAP XML ${identifier}: HTTP ${response.status}`
      );

      return null;
    }

    const xml =
      await response.text();

    if (
      !xml ||
      !xml.trim()
    ) {
      return null;
    }

    const parsed =
      xmlParser.parse(xml);

    const capAlert =
      parsed?.alert ||
      parsed?.Alert ||
      parsed;

    const metadata =
      extractCAPMetadata(
        capAlert
      );

    /*
    Store successful CAP result.
    */

    capCache.set(
      identifier,
      {
        data: metadata,
        cachedAt: Date.now(),
      }
    );

    return metadata;
  } catch (error) {
    console.warn(
      `SACHET CAP XML failed for ${identifier}:`,
      error.message
    );

    return null;
  }
}


/*
========================================================
MERGE RSS + CAP DATA
========================================================
*/

function mergeCAPIntoRSS(
  rssAlert,
  capData
) {
  if (!capData) {
    return rssAlert;
  }

  const merged = {
    ...rssAlert,
  };

  /*
  CAP should fill missing RSS
  values.

  We do NOT blindly overwrite good
  RSS values.
  */

  merged.identifier =
    rssAlert.identifier ||
    capData.identifier ||
    null;

  merged.sender =
    rssAlert.sender ||
    capData.sender ||
    null;

  merged.sent =
    rssAlert.sent ||
    capData.sent ||
    null;

  merged.status =
    rssAlert.status ||
    capData.status ||
    null;

  merged.msgType =
    rssAlert.msgType ||
    capData.msgType ||
    null;

  merged.scope =
    rssAlert.scope ||
    capData.scope ||
    null;

  merged.headline =
    rssAlert.headline ||
    capData.headline ||
    "";

  merged.event =
    rssAlert.event ||
    capData.event ||
    "";

  merged.description =
    rssAlert.description ||
    capData.description ||
    "";

  merged.instruction =
    rssAlert.instruction ||
    capData.instruction ||
    "";

  merged.category =
    rssAlert.category ||
    capData.category ||
    "";

  /*
  If RSS severity is Unknown,
  use CAP severity.
  */

  if (
    !rssAlert.severity ||
    rssAlert.severity ===
      "Unknown"
  ) {
    merged.severity =
      capData.severity ||
      "Unknown";
  }

  merged.severityColor =
    severityColor(
      merged.severity
    );

  merged.urgency =
    rssAlert.urgency ||
    capData.urgency ||
    "";

  merged.certainty =
    rssAlert.certainty ||
    capData.certainty ||
    "";

  merged.effective =
    rssAlert.effective ||
    capData.effective ||
    null;

  merged.expires =
    rssAlert.expires ||
    capData.expires ||
    null;

  /*
  Area description.
  */

  const rssArea =
    text(rssAlert.areaDesc);

  const capArea =
    text(capData.areaDesc);

  merged.areaDesc =
    rssArea || capArea || "";

  merged.area_description =
    merged.areaDesc;

  merged.areaDescription =
    merged.areaDesc;

  /*
  Geocodes.
  */

  merged.geocodes =
    Array.isArray(
      rssAlert.geocodes
    ) &&
    rssAlert.geocodes.length > 0
      ? rssAlert.geocodes
      : capData.geocodes || [];

  /*
  Geometry.
  */

  merged.polygon =
    rssAlert.polygon ||
    capData.polygon ||
    null;

  merged.circle =
    rssAlert.circle ||
    capData.circle ||
    null;

  merged.centroid =
    rssAlert.centroid ||
    capData.centroid ||
    polygonCentroid(
      merged.polygon
    ) ||
    (merged.circle
      ? {
          lat:
            merged.circle.lat,
          lon:
            merged.circle.lon,
        }
      : null);

  merged.geometrySource =
    merged.polygon
      ? (
          rssAlert.polygon
            ? "SACHET RSS polygon"
            : "SACHET CAP XML polygon"
        )
      : merged.circle
        ? (
            rssAlert.circle
              ? "SACHET RSS circle"
              : "SACHET CAP XML circle"
          )
        : null;

  merged.geometryAvailable =
    Boolean(
      merged.polygon ||
        merged.circle
    );

  merged.source =
    "SACHET / NDMA";

  merged.sourceType =
    "Government CAP Alert";

  return merged;
}


/*
========================================================
ENRICH ONE ALERT
========================================================
*/

async function enrichAlert(
  alert
) {
  /*
  We need CAP XML if:

  1. metadata is missing
  OR
  2. geometry is missing.
  */

  const needsMetadata =
    !alert.headline ||
    !alert.event ||
    !alert.areaDesc ||
    !alert.description ||
    !alert.severity ||
    alert.severity ===
      "Unknown";

  const needsGeometry =
    !alert.polygon &&
    !alert.circle;

  if (
    !alert.identifier ||
    (!needsMetadata &&
      !needsGeometry)
  ) {
    return alert;
  }

  const capData =
    await fetchCAPXML(
      alert.identifier
    );

  if (!capData) {
    return alert;
  }

  return mergeCAPIntoRSS(
    alert,
    capData
  );
}


/*
========================================================
ENRICH ALL ALERTS
========================================================
*/

async function enrichAlerts(
  alerts
) {
  if (
    !Array.isArray(alerts) ||
    alerts.length === 0
  ) {
    return [];
  }

  const output =
    new Array(alerts.length);

  let currentIndex = 0;

  async function worker() {
    while (true) {
      const index =
        currentIndex++;

      if (
        index >= alerts.length
      ) {
        return;
      }

      try {
        output[index] =
          await enrichAlert(
            alerts[index]
          );
      } catch (error) {
        console.warn(
          `Alert enrichment failed at index ${index}:`,
          error.message
        );

        output[index] =
          alerts[index];
      }
    }
  }

  const workers = [];

  const workerCount =
    Math.min(
      CAP_CONCURRENCY,
      alerts.length
    );

  for (
    let i = 0;
    i < workerCount;
    i++
  ) {
    workers.push(
      worker()
    );
  }

  await Promise.all(
    workers
  );

  return output;
}


/*
========================================================
REMOVE EXACT DUPLICATES
========================================================
*/

function deduplicateAlerts(
  alerts
) {
  const seen =
    new Set();

  const result = [];

  for (const alert of alerts) {
    const key =
      alert.identifier ||
      [
        alert.headline,
        alert.event,
        alert.areaDesc,
        alert.effective,
      ]
        .filter(Boolean)
        .join("|");

    if (
      !key ||
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);

    result.push(alert);
  }

  return result;
}


/*
========================================================
FETCH SACHET ALERTS
========================================================
*/

async function getSachetAlerts() {
  const now =
    Date.now();

  /*
  --------------------------------------------
  NORMAL CACHE
  --------------------------------------------
  */

  if (
    cachedAlerts &&
    now - cachedAt <
      RSS_CACHE_MS
  ) {
    return {
      ...cachedAlerts,

      cached: true,
      stale: false,

      cachedAt:
        new Date(
          cachedAt
        ).toISOString(),
    };
  }


  /*
  --------------------------------------------
  REQUEST HEADERS
  --------------------------------------------
  */

  const headers = {
    Accept:
      "application/rss+xml, application/xml, text/xml, */*",

    "User-Agent":
      "SIH-26002-Logistics-Intelligence/2.0",
  };

  if (cachedETag) {
    headers["If-None-Match"] =
      cachedETag;
  }


  /*
  --------------------------------------------
  FETCH LIVE SACHET FEED
  --------------------------------------------
  */

  let response;

  try {
    response =
      await fetchWithTimeout(
        SACHET_RSS_URL,
        {
          headers,
        },
        REQUEST_TIMEOUT_MS
      );
  } catch (error) {
    console.error(
      "SACHET live feed request failed:",
      error.message
    );

    /*
    Use last successful government
    snapshot if available.
    */

    if (cachedAlerts) {
      return {
        ...cachedAlerts,

        success: true,

        live: false,
        cached: true,
        stale: true,

        warning:
          "Live SACHET feed is temporarily unavailable. Showing the last successful government snapshot.",

        lastSuccessfulFetch:
          cachedAlerts.fetchedAt,

        cachedAt:
          new Date(
            cachedAt
          ).toISOString(),
      };
    }

    throw new Error(
      `Unable to reach official SACHET feed: ${error.message}`
    );
  }


  /*
  --------------------------------------------
  304 NOT MODIFIED
  --------------------------------------------
  */

  if (
    response.status === 304 &&
    cachedAlerts
  ) {
    cachedAt = now;

    return {
      ...cachedAlerts,

      cached: true,
      stale: false,
      notModified: true,

      cachedAt:
        new Date(
          cachedAt
        ).toISOString(),
    };
  }


  /*
  --------------------------------------------
  HTTP ERROR
  --------------------------------------------
  */

  if (!response.ok) {
    const message =
      `SACHET returned HTTP ${response.status}`;

    console.error(
      message
    );

    if (cachedAlerts) {
      return {
        ...cachedAlerts,

        success: true,

        live: false,
        cached: true,
        stale: true,

        warning:
          "Live SACHET feed is temporarily unavailable. Showing the last successful government snapshot.",

        lastSuccessfulFetch:
          cachedAlerts.fetchedAt,

        cachedAt:
          new Date(
            cachedAt
          ).toISOString(),
      };
    }

    throw new Error(
      message
    );
  }


  /*
  --------------------------------------------
  READ RSS XML
  --------------------------------------------
  */

  const xml =
    await response.text();

  if (
    !xml ||
    !xml.trim()
  ) {
    if (cachedAlerts) {
      return {
        ...cachedAlerts,

        success: true,

        live: false,
        cached: true,
        stale: true,

        warning:
          "SACHET returned an empty response. Showing the last successful government snapshot.",

        lastSuccessfulFetch:
          cachedAlerts.fetchedAt,
      };
    }

    throw new Error(
      "SACHET returned an empty RSS response."
    );
  }


  /*
  --------------------------------------------
  PARSE RSS
  --------------------------------------------
  */

  let alerts;

  try {
    alerts =
      await parseRSS(
        xml
      );
  } catch (error) {
    console.error(
      "SACHET RSS parsing failed:",
      error.message
    );

    if (cachedAlerts) {
      return {
        ...cachedAlerts,

        success: true,

        live: false,
        cached: true,
        stale: true,

        warning:
          "SACHET response could not be parsed. Showing the last successful government snapshot.",

        lastSuccessfulFetch:
          cachedAlerts.fetchedAt,
      };
    }

    throw error;
  }


  /*
  --------------------------------------------
  DEDUPLICATE
  --------------------------------------------
  */

  alerts =
    deduplicateAlerts(
      alerts
    );


  /*
  --------------------------------------------
  FULL CAP ENRICHMENT
  --------------------------------------------

  This is the main correction.

  Missing metadata + missing geometry
  are filled from official individual
  SACHET CAP XML.
  --------------------------------------------
  */

  alerts =
    await enrichAlerts(
      alerts
    );


  /*
  --------------------------------------------
  ETAG
  --------------------------------------------
  */

  const etag =
    response.headers.get(
      "etag"
    );

  if (etag) {
    cachedETag =
      etag;
  }


  /*
  --------------------------------------------
  SUCCESSFUL SNAPSHOT
  --------------------------------------------
  */

  cachedAt = now;

  cachedAlerts = {
    success: true,

    live: true,
    cached: false,
    stale: false,

    source:
      "SACHET / NDMA",

    feed:
      "India CAP RSS",

    sourceUrl:
      SACHET_RSS_URL,

    capEndpoint:
      SACHET_CAP_XML_URL,

    count:
      alerts.length,

    fetchedAt:
      new Date(
        now
      ).toISOString(),

    alerts,
  };

  return cachedAlerts;
}


/*
========================================================
API: SACHET ALERTS
========================================================
*/

app.get(
  "/api/sachet",
  async (req, res) => {
    try {
      const data =
        await getSachetAlerts();

      res.set(
        "Cache-Control",
        "no-store"
      );

      res.json(data);
    } catch (error) {
      console.error(
        "/api/sachet error:",
        error
      );

      res.status(502).json({
        success: false,

        live: false,

        stale: false,

        source:
          "SACHET / NDMA",

        error:
          error.message ||
          "Unable to fetch SACHET alerts.",
      });
    }
  }
);


/*
========================================================
API: SACHET STATUS
========================================================
*/

app.get(
  "/api/sachet/status",
  (req, res) => {
    const now =
      Date.now();

    const hasCache =
      Boolean(
        cachedAlerts
      );

    const cacheAgeSeconds =
      hasCache
        ? Math.max(
            0,
            Math.round(
              (now - cachedAt) /
                1000
            )
          )
        : null;

    res.set(
      "Cache-Control",
      "no-store"
    );

    res.json({
      success: true,

      source:
        "SACHET / NDMA",

      feed:
        "India CAP RSS",

      feedUrl:
        SACHET_RSS_URL,

      capEndpoint:
        SACHET_CAP_XML_URL,

      cacheAvailable:
        hasCache,

      cacheAgeSeconds,

      cachedAt:
        hasCache
          ? new Date(
              cachedAt
            ).toISOString()
          : null,

      lastSuccessfulFetch:
        cachedAlerts?.fetchedAt ||
        null,

      alertCount:
        cachedAlerts?.count ||
        0,

      etagAvailable:
        Boolean(
          cachedETag
        ),

      capCacheEntries:
        capCache.size,
    });
  }
);


/*
========================================================
API: DEBUG ONE ALERT
========================================================

Useful for development.

Example:

/api/sachet/debug/<identifier>

This lets you inspect exactly what
the official CAP XML contains.
========================================================
*/

app.get(
  "/api/sachet/debug/:identifier",
  async (req, res) => {
    try {
      const identifier =
        req.params.identifier;

      if (!identifier) {
        return res.status(400).json({
          success: false,
          error:
            "CAP identifier is required.",
        });
      }

      const data =
        await fetchCAPXML(
          identifier
        );

      if (!data) {
        return res.status(404).json({
          success: false,
          error:
            "Unable to retrieve CAP XML for this identifier.",
        });
      }

      res.set(
        "Cache-Control",
        "no-store"
      );

      res.json({
        success: true,

        identifier,

        source:
          "SACHET / NDMA",

        data,
      });
    } catch (error) {
      console.error(
        "/api/sachet/debug error:",
        error
      );

      res.status(500).json({
        success: false,

        error:
          error.message ||
          "Debug request failed.",
      });
    }
  }
);


/*
========================================================
API: HEALTH CHECK
========================================================
*/

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,

      service:
        "SIH 26002 AI Logistics Intelligence Backend",

      status:
        "running",

      timestamp:
        new Date().toISOString(),

      sachet: {
        source:
          "SACHET / NDMA",

        feed:
          "India CAP RSS",

        cacheAvailable:
          Boolean(
            cachedAlerts
          ),

        lastSuccessfulFetch:
          cachedAlerts?.fetchedAt ||
          null,

        alertCount:
          cachedAlerts?.count ||
          0,

        capCacheEntries:
          capCache.size,
      },
    });
  }
);


/*
========================================================
ROOT
========================================================
*/

app.get(
  "/",
  (req, res) => {
    res.sendFile(
      __dirname +
        "/index.html"
    );
  }
);


/*
========================================================
ERROR HANDLER
========================================================
*/

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(
      "Unhandled server error:",
      err
    );

    res.status(500).json({
      success: false,

      error:
        "Internal server error.",
    });
  }
);


/*
========================================================
START SERVER
========================================================
*/

/*
========================================================
START SERVER
========================================================
*/

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("==================================================");
  console.log("SIH 26002 Logistics Intelligence Server");
  console.log("==================================================");
  console.log(`Server running on port ${PORT}`);
  console.log(`SACHET RSS: ${SACHET_RSS_URL}`);
  console.log(
    `CAP XML: ${SACHET_CAP_XML_URL}<identifier>`
  );
  console.log(
    "Full CAP metadata + geometry enrichment: ENABLED"
  );
  console.log("==================================================");
  console.log("SERVER PROCESS IS ALIVE");
  console.log("Waiting for requests...");
});


/*
========================================================
SERVER ERROR HANDLER
========================================================
*/

server.on("error", (error) => {
  console.error(
    "=================================================="
  );

  console.error(
    "SERVER ERROR"
  );

  console.error(
    error
  );

  console.error(
    "=================================================="
  );
});


/*
========================================================
SERVER CLOSE DETECTOR
========================================================
*/

server.on("close", () => {
  console.error(
    "WARNING: HTTP SERVER CLOSED"
  );
});


/*
========================================================
NODE PROCESS ERROR HANDLERS
========================================================
*/

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "UNCAUGHT EXCEPTION:"
    );

    console.error(
      error
    );
  }
);


process.on(
  "unhandledRejection",
  (reason) => {
    console.error(
      "UNHANDLED PROMISE REJECTION:"
    );

    console.error(
      reason
    );
  }
);


/*
========================================================
KEEP-ALIVE DIAGNOSTIC
========================================================
*/

setInterval(() => {
  console.log(
    `[SERVER ALIVE] ${new Date().toISOString()}`
  );
}, 10000);