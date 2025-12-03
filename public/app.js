const form = document.getElementById("config-form");
const statusEl = document.getElementById("status");
const countrySelect = document.getElementById("country");
const stateSelect = document.getElementById("state");
const currencyInput = form.querySelector("input[name=\"currency\"]");
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
    ],
  },
  india: {
    currency: "INR",
    states: [
      { key: "karnataka", label: "Karnataka" },
      { key: "maharashtra", label: "Maharashtra" },
      { key: "delhi", label: "Delhi" },
      { key: "tamil-nadu", label: "Tamil Nadu" },
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
      { key: "california", label: "California" },
      { key: "new-york", label: "New York" },
      { key: "texas", label: "Texas" },
      { key: "washington", label: "Washington" },
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
  lastCurl = buildCurl(target, qs);
  setStatus(`Fetching ${url} ...`);
  tabs.forEach((b) => b.disabled = true);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const json = await res.json();
    viewers[target].textContent = JSON.stringify(json, null, 2);
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

populateStates(countrySelect.value);
syncCurrency(countrySelect.value);

// Initial fetch
fetchData("customers");
