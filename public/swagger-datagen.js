const specForm = document.getElementById("spec-form");
const specStatus = document.getElementById("spec-status");
const opPanel = document.getElementById("op-panel");
const operationSelect = document.getElementById("operation");
const payloadViewer = document.getElementById("payload-viewer");
const genStatus = document.getElementById("gen-status");
const copyBtn = document.getElementById("copy-payload");
const generateBtn = document.getElementById("generate");

let currentSpec = null;
let currentOps = [];

const setSpecStatus = (msg) => (specStatus.textContent = msg);
const setGenStatus = (msg) => (genStatus.textContent = msg);

const normalizePath = (path) => path.replace(/\/+$/, "") || "/";

const fetchSpec = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch spec: ${res.status}`);
  return res.json();
};

const parseSpec = (raw) => {
  if (typeof raw !== "object" || raw === null) throw new Error("Spec must be an object");
  const isOas3 = !!raw.openapi;
  const isOas2 = !!raw.swagger;
  if (!isOas3 && !isOas2) throw new Error("Unsupported spec (expecting openapi/swagger field)");
  return { spec: raw, version: isOas3 ? "oas3" : "oas2" };
};

const loadOperations = ({ spec, version }) => {
  const ops = [];
  const paths = spec.paths || {};
  const methods = ["get", "post", "put", "patch", "delete"];
  Object.entries(paths).forEach(([path, item]) => {
    methods.forEach((method) => {
      const op = item[method];
      if (!op) return;
      const hasBody =
        version === "oas3"
          ? !!op.requestBody
          : (op.parameters || []).some((p) => p.in === "body");
      if (!hasBody && method === "get") return; // focus on data-gen relevant ops
      ops.push({
        id: `${method.toUpperCase()} ${normalizePath(path)}`,
        path,
        method,
        op,
      });
    });
  });
  return ops;
};

const resolveRef = (spec, ref) => {
  const withoutHash = ref.replace(/^#\//, "");
  const parts = withoutHash.split("/");
  let node = spec;
  for (const part of parts) {
    if (node && typeof node === "object") {
      node = node[part];
    } else {
      return null;
    }
  }
  return node || null;
};

const getSchema = (spec, version, op) => {
  if (version === "oas3") {
    const body = op.requestBody;
    const content = body?.content || {};
    const json = content["application/json"] || content["application/*+json"];
    return json?.schema || null;
  }

  const param = (op.parameters || []).find((p) => p.in === "body");
  return param?.schema || null;
};

const pickEnum = (schema, rand) => {
  if (!schema.enum || !schema.enum.length) return null;
  return schema.enum[Math.floor(rand() * schema.enum.length)];
};

const makeRand = (seed = Date.now()) => {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const randFrom = (list, rand) => list[Math.floor(rand() * list.length)];

const sampleForSchema = (schema, spec, version, rand, keyName = "", depth = 0) => {
  if (!schema || depth > 10) return null;
  if (schema.$ref) {
    const resolved = resolveRef(spec, schema.$ref);
    return sampleForSchema(resolved, spec, version, rand, keyName, depth + 1);
  }

  if (schema.oneOf || schema.anyOf) {
    const list = schema.oneOf || schema.anyOf;
    return sampleForSchema(list[0], spec, version, rand, keyName, depth + 1);
  }

  if (schema.allOf) {
    return schema.allOf.reduce((acc, part) => {
      const next = sampleForSchema(part, spec, version, rand, keyName, depth + 1);
      return Object.assign(acc || {}, next);
    }, {});
  }

  if (schema.type === "array" || schema.items) {
    const count = schema.minItems ? Math.min(schema.minItems, 2) : 2;
    return Array.from({ length: count }, () =>
      sampleForSchema(schema.items || {}, spec, version, rand, keyName, depth + 1),
    );
  }

  if (schema.type === "object" || schema.properties) {
    const obj = {};
    const props = schema.properties || {};
    const required = schema.required || [];
    Object.entries(props).forEach(([key, propSchema]) => {
      if (required.includes(key) || rand() > 0.3) {
        obj[key] = sampleForSchema(propSchema, spec, version, rand, key, depth + 1);
      }
    });
    return obj;
  }

  // primitives and enums
  const enumVal = pickEnum(schema, rand);
  if (enumVal !== null && enumVal !== undefined) return enumVal;

  switch (schema.type) {
    case "integer":
    case "number":
      return schema.minimum ?? schema.exclusiveMinimum ?? 1 + Math.floor(rand() * 1000);
    case "boolean":
      return rand() > 0.5;
    case "string":
    default: {
      const fmt = schema.format || "";
      const keyHint = (schema.title || keyName || "").toLowerCase();
      const firstNames = ["Alex", "Taylor", "Jordan", "Sam", "Jamie", "Riley", "Morgan", "Avery"];
      const lastNames = ["Smith", "Johnson", "Patel", "Chen", "Brown", "Garcia", "Singh", "Williams"];
      const word = schema.example || schema.default || `string-${Math.floor(rand() * 1000)}`;

      if (fmt === "email" || keyHint.includes("email"))
        return `${randFrom(firstNames, rand)}.${randFrom(lastNames, rand)}${Math.floor(rand() * 999)}@example.com`.toLowerCase();
      if (fmt === "date-time") return new Date().toISOString();
      if (fmt === "date") return new Date().toISOString().split("T")[0];
      if (fmt === "uuid") return "123e4567-e89b-12d3-a456-426614174000";

      if (keyHint.includes("firstname") || keyHint.includes("first name") || keyHint === "first")
        return randFrom(firstNames, rand);
      if (keyHint.includes("lastname") || keyHint.includes("last name") || keyHint === "last")
        return randFrom(lastNames, rand);
      if (keyHint.includes("username"))
        return `${randFrom(firstNames, rand).toLowerCase()}${Math.floor(rand() * 900 + 100)}`;
      if (keyHint.includes("phone"))
        return `+1-${Math.floor(rand() * 900 + 100)}-${Math.floor(rand() * 900 + 100)}-${Math.floor(rand() * 9000 + 1000)}`;
      if (keyHint.includes("password"))
        return `Pass${Math.floor(rand() * 9999)}!`;

      return word;
    }
  }
};

const toYaml = (value, indent = 0) => {
  const pad = "  ".repeat(indent);
  if (value === null || value === undefined) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value
      .map((item) => {
        const rendered = toYaml(item, indent + 1);
        if (rendered.includes("\n")) {
          const indented = rendered
            .split("\n")
            .map((line) => (line ? "  " + line : line))
            .join("\n");
          return `${pad}-\n${indented}`;
        }
        return `${pad}- ${rendered}`;
      })
      .join("\n");
  }

  const entries = Object.entries(value);
  if (entries.length === 0) return "{}";
  return entries
    .map(([k, v]) => {
      const rendered = toYaml(v, indent + 1);
      const keyLine = `${pad}${k}:`;
      if (rendered.includes("\n")) {
        const indented = rendered
          .split("\n")
          .map((line) => (line ? "  " + line : line))
          .join("\n");
        return `${keyLine}\n${indented}`;
      }
      return `${keyLine} ${rendered}`;
    })
    .join("\n");
};

const renderOperations = (ops) => {
  operationSelect.innerHTML = "";
  ops.forEach((op, idx) => {
    const opt = document.createElement("option");
    opt.value = String(idx);
    opt.textContent = op.id;
    operationSelect.appendChild(opt);
  });
  opPanel.style.display = ops.length ? "block" : "none";
};

const handleLoadSpec = async (e) => {
  e.preventDefault();
  setSpecStatus("Loading...");
  setGenStatus("");
  payloadViewer.textContent = "";
  opPanel.style.display = "none";

  const formData = new FormData(specForm);
  const url = (formData.get("specUrl") || "").toString().trim();
  const pasted = (formData.get("specJson") || "").toString().trim();

  try {
    let raw = null;
    if (url) {
      raw = await fetchSpec(url);
    } else if (pasted) {
      raw = JSON.parse(pasted);
    } else {
      throw new Error("Provide a spec URL or paste JSON.");
    }

    const parsed = parseSpec(raw);
    currentSpec = parsed;
    currentOps = loadOperations(parsed);
    if (!currentOps.length) throw new Error("No operations with bodies found.");
    renderOperations(currentOps);
    setSpecStatus(`Loaded ${currentOps.length} operations`);
  } catch (err) {
    setSpecStatus(err.message || "Failed to load spec");
  }
};

const handleGenerate = () => {
  if (!currentSpec || !currentOps.length) {
    setGenStatus("Load a spec first.");
    return;
  }
  const idx = Number(operationSelect.value || 0);
  const op = currentOps[idx];
  const schema = getSchema(currentSpec.spec, currentSpec.version, op.op);
  if (!schema) {
    setGenStatus("No request body schema found for this operation.");
    payloadViewer.textContent = "";
    return;
  }
  const rand = makeRand();
  const sample = sampleForSchema(schema, currentSpec.spec, currentSpec.version, rand);
  payloadViewer.textContent = `${op.method.toUpperCase()} ${normalizePath(op.path)}\n\nJSON:\n${JSON.stringify(sample, null, 2)}`;
  setGenStatus("Generated payload (JSON only).");
};

const handleCopy = async () => {
  const content = payloadViewer.textContent || "";
  if (!content.trim()) {
    setGenStatus("Nothing to copy yet.");
    return;
  }
  try {
    await navigator.clipboard.writeText(content);
    setGenStatus("Copied payload to clipboard.");
  } catch (err) {
    setGenStatus("Copy failed; clipboard not available.");
  }
};

specForm.addEventListener("submit", handleLoadSpec);
generateBtn.addEventListener("click", handleGenerate);
copyBtn.addEventListener("click", handleCopy);
