const form = document.getElementById("config-form");
const statusEl = document.getElementById("status");
const countrySelect = document.getElementById("country");
const stateSelect = document.getElementById("state");
const currencyInput = form.querySelector("input[name=\"currency\"]");
const formatSelect = form.querySelector("select[name=\"format\"]");
const tabs = [...document.querySelectorAll(".tab")];
const viewers = {
  customers: document.getElementById("customers"),
  accounts: document.getElementById("accounts"),
  transactions: document.getElementById("transactions"),
};
const curlSnippet = document.getElementById("curl-snippet");
const showCurlBtn = document.getElementById("show-curl");
const modal = document.getElementById("curl-modal");
const closeModalBtn = document.getElementById("close-modal");
const copyBtn = document.getElementById("copy-response");
let lastCurl = "";

const endpointForTab = {
  customers: "/customers",
  accounts: "/accounts",
  transactions: "/transactions",
};

const territoryOptions = {
  australia: {
    currency: "AUD",
    states: [
      { key: "nsw", label: "New South Wales" },
      { key: "vic", label: "Victoria" },
      { key: "qld", label: "Queensland" },
      { key: "wa", label: "Western Australia" },
      { key: "sa", label: "South Australia" },
      { key: "tas", label: "Tasmania" },
      { key: "nt", label: "Northern Territory" },
      { key: "act", label: "Australian Capital Territory" },
    ],
  },
  india: {
    currency: "INR",
    states: [
      { key: "andhra-pradesh", label: "Andhra Pradesh" },
      { key: "arunachal-pradesh", label: "Arunachal Pradesh" },
      { key: "assam", label: "Assam" },
      { key: "bihar", label: "Bihar" },
      { key: "chhattisgarh", label: "Chhattisgarh" },
      { key: "goa", label: "Goa" },
      { key: "gujarat", label: "Gujarat" },
      { key: "haryana", label: "Haryana" },
      { key: "himachal-pradesh", label: "Himachal Pradesh" },
      { key: "jammu-kashmir", label: "Jammu & Kashmir" },
      { key: "jharkhand", label: "Jharkhand" },
      { key: "karnataka", label: "Karnataka" },
      { key: "kerala", label: "Kerala" },
      { key: "madhya-pradesh", label: "Madhya Pradesh" },
      { key: "maharashtra", label: "Maharashtra" },
      { key: "manipur", label: "Manipur" },
      { key: "meghalaya", label: "Meghalaya" },
      { key: "mizoram", label: "Mizoram" },
      { key: "nagaland", label: "Nagaland" },
      { key: "odisha", label: "Odisha" },
      { key: "punjab", label: "Punjab" },
      { key: "rajasthan", label: "Rajasthan" },
      { key: "sikkim", label: "Sikkim" },
      { key: "tamil-nadu", label: "Tamil Nadu" },
      { key: "telangana", label: "Telangana" },
      { key: "tripura", label: "Tripura" },
      { key: "uttar-pradesh", label: "Uttar Pradesh" },
      { key: "uttarakhand", label: "Uttarakhand" },
      { key: "west-bengal", label: "West Bengal" },
      { key: "andaman-nicobar", label: "Andaman & Nicobar Islands" },
      { key: "chandigarh", label: "Chandigarh" },
      { key: "dadra-nagar-haveli-daman-diu", label: "Dadra & Nagar Haveli and Daman & Diu" },
      { key: "delhi", label: "Delhi" },
      { key: "ladakh", label: "Ladakh" },
      { key: "lakshadweep", label: "Lakshadweep" },
      { key: "puducherry", label: "Puducherry" },
    ],
  },
  "united-kingdom": {
    currency: "GBP",
    states: [
      { key: "england", label: "England" },
      { key: "scotland", label: "Scotland" },
      { key: "wales", label: "Wales" },
      { key: "northern-ireland", label: "Northern Ireland" },
    ],
  },
  "united-states": {
    currency: "USD",
    states: [
      { key: "alabama", label: "Alabama" },
      { key: "alaska", label: "Alaska" },
      { key: "arizona", label: "Arizona" },
      { key: "arkansas", label: "Arkansas" },
      { key: "california", label: "California" },
      { key: "colorado", label: "Colorado" },
      { key: "connecticut", label: "Connecticut" },
      { key: "delaware", label: "Delaware" },
      { key: "florida", label: "Florida" },
      { key: "georgia", label: "Georgia" },
      { key: "hawaii", label: "Hawaii" },
      { key: "idaho", label: "Idaho" },
      { key: "illinois", label: "Illinois" },
      { key: "indiana", label: "Indiana" },
      { key: "iowa", label: "Iowa" },
      { key: "kansas", label: "Kansas" },
      { key: "kentucky", label: "Kentucky" },
      { key: "louisiana", label: "Louisiana" },
      { key: "maine", label: "Maine" },
      { key: "maryland", label: "Maryland" },
      { key: "massachusetts", label: "Massachusetts" },
      { key: "michigan", label: "Michigan" },
      { key: "minnesota", label: "Minnesota" },
      { key: "mississippi", label: "Mississippi" },
      { key: "missouri", label: "Missouri" },
      { key: "montana", label: "Montana" },
      { key: "nebraska", label: "Nebraska" },
      { key: "nevada", label: "Nevada" },
      { key: "new-hampshire", label: "New Hampshire" },
      { key: "new-jersey", label: "New Jersey" },
      { key: "new-mexico", label: "New Mexico" },
      { key: "new-york", label: "New York" },
      { key: "north-carolina", label: "North Carolina" },
      { key: "north-dakota", label: "North Dakota" },
      { key: "ohio", label: "Ohio" },
      { key: "oklahoma", label: "Oklahoma" },
      { key: "oregon", label: "Oregon" },
      { key: "pennsylvania", label: "Pennsylvania" },
      { key: "rhode-island", label: "Rhode Island" },
      { key: "south-carolina", label: "South Carolina" },
      { key: "south-dakota", label: "South Dakota" },
      { key: "tennessee", label: "Tennessee" },
      { key: "texas", label: "Texas" },
      { key: "utah", label: "Utah" },
      { key: "vermont", label: "Vermont" },
      { key: "virginia", label: "Virginia" },
      { key: "washington", label: "Washington" },
      { key: "west-virginia", label: "West Virginia" },
      { key: "wisconsin", label: "Wisconsin" },
      { key: "wyoming", label: "Wyoming" },
      { key: "district-of-columbia", label: "District of Columbia" },
    ],
  },
};

const setStatus = (msg) => {
  statusEl.textContent = msg;
};

const activateTab = (target) => {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.target === target));
  Object.entries(viewers).forEach(([key, el]) => {
    el.classList.toggle("active", key === target);
  });
};

const serializeForm = () => {
  const data = new FormData(form);
  const params = new URLSearchParams();
  for (const [key, value] of data.entries()) {
    if (value !== "") params.append(key, value.toString());
  }
  return params.toString();
};

const buildCurl = (target, qs) => {
  const url = new URL(endpointForTab[target], window.location.origin);
  if (qs) url.search = qs;
  return `curl -X GET "${url.toString()}"`;
};

const openModal = () => {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  curlSnippet.textContent = lastCurl || "Make a request to see the sample curl.";
};

const closeModal = () => {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
};

const populateStates = (countryKey, preserveSelection = false) => {
  const territory = territoryOptions[countryKey];
  if (!territory) return;
  const previous = stateSelect.value;
  stateSelect.innerHTML = "";
  territory.states.forEach((state, idx) => {
    const option = document.createElement("option");
    option.value = state.key;
    option.textContent = state.label;
    if ((preserveSelection && previous === state.key) || (!preserveSelection && idx === 0)) {
      option.selected = true;
    }
    stateSelect.appendChild(option);
  });
};

const syncCurrency = (countryKey) => {
  const territory = territoryOptions[countryKey];
  if (!territory) return;
  currencyInput.value = territory.currency;
};

const fetchData = async (target) => {
  const qs = serializeForm();
  const url = `${endpointForTab[target]}${qs ? "?" + qs : ""}`;
  const format = formatSelect?.value ?? "json";
  const headers = {};
  if (format === "yaml") headers["Accept"] = "application/x-yaml";
  else if (format === "xml") headers["Accept"] = "application/xml";
  else headers["Accept"] = "application/json";

  lastCurl = buildCurl(target, qs);
  setStatus(`Fetching ${url} ...`);
  tabs.forEach((b) => b.disabled = true);
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed: ${res.status}`);
    }
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("json");
    const body = isJson ? await res.json() : await res.text();
    viewers[target].textContent = isJson ? JSON.stringify(body, null, 2) : body;
    setStatus("Done");
  } catch (err) {
    viewers[target].textContent = `Error: ${err.message}`;
    setStatus("Request error");
  } finally {
    tabs.forEach((b) => b.disabled = false);
  }
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const active = document.querySelector(".tab.active")?.dataset.target ?? "customers";
  fetchData(active);
});

countrySelect.addEventListener("change", () => {
  const selectedCountry = countrySelect.value;
  populateStates(selectedCountry);
  syncCurrency(selectedCountry);
});

showCurlBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal || e.target.classList.contains("modal-backdrop")) {
    closeModal();
  }
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activateTab(tab.dataset.target);
    fetchData(tab.dataset.target);
  });
});

copyBtn?.addEventListener("click", async () => {
  const activeKey = document.querySelector(".tab.active")?.dataset.target ?? "customers";
  const content = viewers[activeKey]?.textContent ?? "";
  if (!content.trim()) {
    setStatus("Nothing to copy yet.");
    return;
  }
  try {
    await navigator.clipboard.writeText(content);
    setStatus("Response copied to clipboard.");
  } catch (err) {
    setStatus("Copy failed; clipboard not available.");
  }
});

populateStates(countrySelect.value);
syncCurrency(countrySelect.value);

// Initial fetch
fetchData("customers");
