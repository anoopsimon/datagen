type Random = () => number;

const mulberry32 = (seed: number): Random => {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = <T>(rand: Random, list: T[]): T =>
  list[Math.floor(rand() * list.length)];

const randomInt = (rand: Random, min: number, max: number): number =>
  Math.floor(rand() * (max - min + 1)) + min;

const randomFloat = (
  rand: Random,
  min: number,
  max: number,
  decimals = 2,
): number => {
  const value = rand() * (max - min) + min;
  return Number(value.toFixed(decimals));
};

const randomDate = (rand: Random, start: Date, end: Date): string => {
  const ts = start.getTime() + rand() * (end.getTime() - start.getTime());
  return new Date(ts).toISOString();
};

const normalizeKey = (value: string | null): string =>
  (value ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-");

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const firstNames = [
  "Alex",
  "Blake",
  "Casey",
  "Dana",
  "Elliot",
  "Harper",
  "Jordan",
  "Morgan",
  "Quinn",
  "Riley",
  "Taylor",
  "Sydney",
  "Sam",
  "Jamie",
];

const lastNames = [
  "Nguyen",
  "Kaur",
  "Smith",
  "Chen",
  "Lee",
  "Patel",
  "Brown",
  "Jones",
  "Williams",
  "Wilson",
  "Martin",
  "Singh",
  "Thompson",
  "King",
];

const merchants = [
  "ANZ ATM",
  "Uber",
  "Coles",
  "Woolworths",
  "Officeworks",
  "JB Hi-Fi",
  "Bunnings",
  "7-Eleven",
  "Qantas",
  "Virgin",
  "Airtasker",
  "Netflix",
  "Spotify",
];

type TerritoryState = {
  key: string;
  name: string;
  cities: string[];
  postalPrefix: string;
  areaCodes?: string[];
};

type Territory = {
  key: string;
  label: string;
  currency: string;
  streetNames: string[];
  states: TerritoryState[];
  mobile: (rand: Random, state: TerritoryState) => string;
  landline?: (rand: Random, state: TerritoryState) => string;
  postalCode: (rand: Random, state: TerritoryState) => string;
};

const territories: Record<string, Territory> = {
  australia: {
    key: "australia",
    label: "Australia",
    currency: "AUD",
    streetNames: [
      "George St",
      "Collins St",
      "Queen St",
      "Elizabeth St",
      "Bourke St",
      "Pitt St",
      "Swanston St",
      "Spring St",
      "Bridge Rd",
      "Oxford St",
      "Flinders St",
      "Lygon St",
    ],
    states: [
      {
        key: "nsw",
        name: "New South Wales",
        cities: ["Sydney", "Newcastle", "Wollongong"],
        postalPrefix: "2",
        areaCodes: ["02"],
      },
      {
        key: "vic",
        name: "Victoria",
        cities: ["Melbourne", "Geelong", "Ballarat"],
        postalPrefix: "3",
        areaCodes: ["03"],
      },
      {
        key: "qld",
        name: "Queensland",
        cities: ["Brisbane", "Gold Coast", "Cairns"],
        postalPrefix: "4",
        areaCodes: ["07"],
      },
      {
        key: "wa",
        name: "Western Australia",
        cities: ["Perth", "Fremantle", "Bunbury"],
        postalPrefix: "6",
        areaCodes: ["08"],
      },
    ],
    mobile: (rand) => `04${randomInt(rand, 10000000, 99999999)}`,
    landline: (rand, state) => {
      const area = pick(rand, state.areaCodes ?? ["02", "03", "07", "08"]);
      return `${area} ${randomInt(rand, 200, 999)} ${randomInt(rand, 100000, 999999)}`;
    },
    postalCode: (rand, state) => `${state.postalPrefix}${randomInt(rand, 0, 999).toString().padStart(3, "0")}`,
  },
  india: {
    key: "india",
    label: "India",
    currency: "INR",
    streetNames: [
      "MG Road",
      "Brigade Road",
      "Cambridge Layout",
      "Ring Road",
      "Indiranagar Main Rd",
      "Bandra Kurla Complex",
      "Linking Road",
      "Park Street",
      "Anna Salai",
      "FC Road",
    ],
    states: [
      {
        key: "karnataka",
        name: "Karnataka",
        cities: ["Bengaluru", "Mysuru", "Mangaluru"],
        postalPrefix: "56",
      },
      {
        key: "maharashtra",
        name: "Maharashtra",
        cities: ["Mumbai", "Pune", "Nagpur"],
        postalPrefix: "40",
      },
      {
        key: "delhi",
        name: "Delhi",
        cities: ["New Delhi", "Dwarka", "Rohini"],
        postalPrefix: "11",
      },
      {
        key: "tamil-nadu",
        name: "Tamil Nadu",
        cities: ["Chennai", "Coimbatore", "Madurai"],
        postalPrefix: "60",
      },
    ],
    mobile: (rand) => {
      const prefix = pick(rand, ["9", "8", "7"]);
      return `+91 ${prefix}${randomInt(rand, 100000000, 999999999)}`;
    },
    landline: (rand) => `0${randomInt(rand, 1111, 8899)}-${randomInt(rand, 100000, 999999)}`,
    postalCode: (rand, state) => `${state.postalPrefix}${randomInt(rand, 0, 9999).toString().padStart(4, "0")}`,
  },
  "united-kingdom": {
    key: "united-kingdom",
    label: "United Kingdom",
    currency: "GBP",
    streetNames: [
      "Baker St",
      "King's Rd",
      "Oxford St",
      "Piccadilly",
      "Fleet St",
      "Portobello Rd",
      "George St",
      "High St",
      "Queen's Rd",
      "Station Rd",
    ],
    states: [
      {
        key: "england",
        name: "England",
        cities: ["London", "Manchester", "Bristol"],
        postalPrefix: "SW1",
      },
      {
        key: "scotland",
        name: "Scotland",
        cities: ["Edinburgh", "Glasgow", "Aberdeen"],
        postalPrefix: "EH3",
      },
      {
        key: "wales",
        name: "Wales",
        cities: ["Cardiff", "Swansea", "Newport"],
        postalPrefix: "CF1",
      },
      {
        key: "northern-ireland",
        name: "Northern Ireland",
        cities: ["Belfast", "Derry", "Lisburn"],
        postalPrefix: "BT1",
      },
    ],
    mobile: (rand) => `+44 7${randomInt(rand, 100000000, 999999999)}`,
    landline: (rand) => `0${randomInt(rand, 113, 204)} ${randomInt(rand, 1000, 9999)} ${randomInt(rand, 1000, 9999)}`,
    postalCode: (rand, state) =>
      `${state.postalPrefix}${randomInt(rand, 1, 9)} ${randomInt(rand, 0, 9)}${pick(rand, letters)}${pick(rand, letters)}`,
  },
  "united-states": {
    key: "united-states",
    label: "United States",
    currency: "USD",
    streetNames: [
      "Main St",
      "Broadway",
      "Elm St",
      "Maple Ave",
      "Pine St",
      "Cedar Ave",
      "Market St",
      "2nd Ave",
      "Park Ave",
      "Sunset Blvd",
    ],
    states: [
      {
        key: "california",
        name: "California",
        cities: ["San Francisco", "Los Angeles", "San Diego"],
        postalPrefix: "90",
        areaCodes: ["415", "310", "619"],
      },
      {
        key: "new-york",
        name: "New York",
        cities: ["New York", "Buffalo", "Rochester"],
        postalPrefix: "10",
        areaCodes: ["212", "347", "718"],
      },
      {
        key: "texas",
        name: "Texas",
        cities: ["Houston", "Austin", "Dallas"],
        postalPrefix: "75",
        areaCodes: ["713", "512", "214"],
      },
      {
        key: "washington",
        name: "Washington",
        cities: ["Seattle", "Spokane", "Tacoma"],
        postalPrefix: "98",
        areaCodes: ["206", "509", "253"],
      },
    ],
    mobile: (rand, state) => {
      const area = pick(rand, state.areaCodes ?? ["206", "310", "415", "512", "718"]);
      return `+1-${area}-${randomInt(rand, 200, 999)}-${randomInt(rand, 1000, 9999)}`;
    },
    landline: (rand, state) => {
      const area = pick(rand, state.areaCodes ?? ["206", "310", "415", "512", "718"]);
      return `${area}-${randomInt(rand, 200, 999)}-${randomInt(rand, 1000, 9999)}`;
    },
    postalCode: (rand, state) => `${state.postalPrefix}${randomInt(rand, 0, 999).toString().padStart(3, "0")}`,
  },
};

const countryAliases: Record<string, string> = {
  au: "australia",
  aus: "australia",
  australia: "australia",
  in: "india",
  ind: "india",
  india: "india",
  uk: "united-kingdom",
  "united-kingdom": "united-kingdom",
  gb: "united-kingdom",
  "great-britain": "united-kingdom",
  "united-states": "united-states",
  usa: "united-states",
  us: "united-states",
  "united-state": "united-states",
};

const resolveTerritory = (countryParam: string | null): Territory => {
  const normalized = normalizeKey(countryParam) || "australia";
  const key = countryAliases[normalized] ?? normalized;
  return territories[key] ?? territories["australia"];
};

const resolveState = (
  territory: Territory,
  stateParam: string | null,
  rand: Random,
): TerritoryState => {
  const normalized = normalizeKey(stateParam);
  const match = territory.states.find((state) => state.key === normalized);
  if (match) return match;
  return pick(rand, territory.states);
};

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

type Account = {
  id: string;
  customerId: string;
  type: "transaction" | "savings" | "credit";
  currency: string;
  balance: number;
  openedOn: string;
};

type Transaction = {
  id: string;
  accountId: string;
  customerId: string;
  type: "debit" | "credit";
  amount: number;
  currency: string;
  description: string;
  merchant: string;
  postedOn: string;
  balanceAfter: number;
};

const parseIntParam = (value: string | null, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

const parseFloatParam = (value: string | null, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const parseDateParam = (value: string | null, fallback: Date): Date => {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const buildIdGenerator = (prefix: string) => {
  let counter = 1;
  return () => `${prefix}-${String(counter++).padStart(4, "0")}`;
};

const generateCustomers = ({
  rand,
  count,
  territory,
  state,
}: {
  rand: Random;
  count: number;
  territory: Territory;
  state: TerritoryState;
}): Customer[] => {
  const nextId = buildIdGenerator("CUST");
  return Array.from({ length: count }, () => {
    const firstName = pick(rand, firstNames);
    const lastName = pick(rand, lastNames);
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName}.${lastName}${randomInt(rand, 10, 999)}@example.com`
      .toLowerCase()
      .replace(" ", "");
    const city = pick(rand, state.cities);
    const street = pick(rand, territory.streetNames);
    const postalCode = territory.postalCode(rand, state);
    const mobile = territory.mobile(rand, state);
    const phone = (territory.landline ?? territory.mobile)(rand, state);
    const address = `${randomInt(rand, 1, 999)} ${street}, ${city}, ${state.name} ${postalCode}, ${territory.label}`;

    return {
      id: nextId(),
      firstName,
      lastName,
      fullName,
      email,
      phone,
      mobile,
      address,
      city,
      state: state.name,
      country: territory.label,
      postalCode,
    };
  });
};

const generateAccounts = ({
  rand,
  customers,
  minPerCustomer,
  maxPerCustomer,
  currency,
}: {
  rand: Random;
  customers: Customer[];
  minPerCustomer: number;
  maxPerCustomer: number;
  currency: string;
}): Account[] => {
  const nextId = buildIdGenerator("ACC");
  const types: Account["type"][] = ["transaction", "savings", "credit"];
  const today = new Date();

  return customers.flatMap((customer) => {
    const count = randomInt(rand, minPerCustomer, maxPerCustomer);
    return Array.from({ length: count }, () => {
      const openedOn = randomDate(
        rand,
        new Date(today.getFullYear() - 3, today.getMonth(), today.getDate()),
        today,
      );
      return {
        id: nextId(),
        customerId: customer.id,
        type: pick(rand, types),
        currency,
        balance: randomFloat(rand, 500, 15000),
        openedOn,
      };
    });
  });
};

const generateTransactions = ({
  rand,
  accounts,
  minPerAccount,
  maxPerAccount,
  startDate,
  endDate,
  currency,
  minAmount,
  maxAmount,
}: {
  rand: Random;
  accounts: Account[];
  minPerAccount: number;
  maxPerAccount: number;
  startDate: Date;
  endDate: Date;
  currency: string;
  minAmount: number;
  maxAmount: number;
}): Transaction[] => {
  const nextId = buildIdGenerator("TXN");

  return accounts.flatMap((account) => {
    const count = randomInt(rand, minPerAccount, maxPerAccount);
    let runningBalance = account.balance;
    return Array.from({ length: count }, () => {
      const isCredit = rand() > 0.45; // tilt slightly to credits to keep balances positive
      const amount = randomFloat(rand, minAmount, maxAmount);
      runningBalance = isCredit ? runningBalance + amount : runningBalance - amount;

      return {
        id: nextId(),
        accountId: account.id,
        customerId: account.customerId,
        type: isCredit ? "credit" : "debit",
        amount,
        currency,
        description: isCredit ? "Salary/Deposit" : "Card purchase",
        merchant: isCredit ? "Employer Pty Ltd" : pick(rand, merchants),
        postedOn: randomDate(rand, startDate, endDate),
        balanceAfter: Number(runningBalance.toFixed(2)),
      };
    });
  });
};

type BuildConfig = {
  rand: Random;
  seed: number;
  customerCount: number;
  minAccounts: number;
  maxAccounts: number;
  minTransactions: number;
  maxTransactions: number;
  currency: string;
  minAmount: number;
  maxAmount: number;
  startDate: Date;
  endDate: Date;
  territory: Territory;
  state: TerritoryState;
};

const buildConfig = (url: URL): BuildConfig => {
  const search = url.searchParams;
  const seed = parseIntParam(search.get("seed"), Date.now());
  const rand = mulberry32(seed);

  const territory = resolveTerritory(search.get("country"));
  const state = resolveState(territory, search.get("state"), rand);

  const customerCount = parseIntParam(search.get("customers"), 10);
  const minAccounts = parseIntParam(search.get("minAccounts"), 1);
  const maxAccounts = Math.max(
    minAccounts,
    parseIntParam(search.get("maxAccounts"), 3),
  );

  const minTransactions = parseIntParam(search.get("minTransactions"), 3);
  const maxTransactions = Math.max(
    minTransactions,
    parseIntParam(search.get("maxTransactions"), 8),
  );

  const currency = search.get("currency") ?? territory.currency;
  const minAmount = parseFloatParam(search.get("minAmount"), 10);
  const maxAmount = Math.max(minAmount, parseFloatParam(search.get("maxAmount"), 500));

  const endDate = parseDateParam(search.get("endDate"), new Date());
  const defaultStart = new Date(endDate);
  defaultStart.setMonth(defaultStart.getMonth() - 1);
  const startDate = parseDateParam(search.get("startDate"), defaultStart);

  return {
    rand,
    seed,
    customerCount,
    minAccounts,
    maxAccounts,
    minTransactions,
    maxTransactions,
    currency,
    minAmount,
    maxAmount,
    startDate,
    endDate,
    territory,
    state,
  };
};

const jsonResponse = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    ...init,
  });

const serveStatic = async (path: string) => {
  try {
    const file = Bun.file(`public${path === "/" ? "/index.html" : path}`);
    if (!(await file.exists())) return null;
    return new Response(file);
  } catch {
    return null;
  }
};

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/health") {
      return jsonResponse({ status: "ok" });
    }

    if (path === "/customers") {
      const config = buildConfig(url);
      const customers = generateCustomers({
        rand: config.rand,
        count: config.customerCount,
        territory: config.territory,
        state: config.state,
      });

      return jsonResponse({
        meta: {
          seed: config.seed,
          customers: config.customerCount,
          country: config.territory.label,
          state: config.state.name,
          currency: config.currency,
        },
        data: customers,
      });
    }

    if (path === "/accounts") {
      const config = buildConfig(url);
      const customers = generateCustomers({
        rand: config.rand,
        count: config.customerCount,
        territory: config.territory,
        state: config.state,
      });
      const accounts = generateAccounts({
        rand: config.rand,
        customers,
        minPerCustomer: config.minAccounts,
        maxPerCustomer: config.maxAccounts,
        currency: config.currency,
      });

      return jsonResponse({
        meta: {
          seed: config.seed,
          customers: customers.length,
          accounts: accounts.length,
          perCustomer: { min: config.minAccounts, max: config.maxAccounts },
          country: config.territory.label,
          state: config.state.name,
          currency: config.currency,
        },
        data: { customers, accounts },
      });
    }

    if (path === "/transactions") {
      const config = buildConfig(url);
      const customers = generateCustomers({
        rand: config.rand,
        count: config.customerCount,
        territory: config.territory,
        state: config.state,
      });
      const accounts = generateAccounts({
        rand: config.rand,
        customers,
        minPerCustomer: config.minAccounts,
        maxPerCustomer: config.maxAccounts,
        currency: config.currency,
      });
      const transactions = generateTransactions({
        rand: config.rand,
        accounts,
        minPerAccount: config.minTransactions,
        maxPerAccount: config.maxTransactions,
        startDate: config.startDate,
        endDate: config.endDate,
        currency: config.currency,
        minAmount: config.minAmount,
        maxAmount: config.maxAmount,
      });

      return jsonResponse({
        meta: {
          seed: config.seed,
          customers: customers.length,
          accounts: accounts.length,
          transactions: transactions.length,
          perAccount: { min: config.minTransactions, max: config.maxTransactions },
          amountRange: { min: config.minAmount, max: config.maxAmount },
          dateRange: {
            start: config.startDate.toISOString(),
            end: config.endDate.toISOString(),
          },
          country: config.territory.label,
          state: config.state.name,
          currency: config.currency,
        },
        data: { customers, accounts, transactions },
      });
    }

    const staticResp = await serveStatic(path);
    if (staticResp) return staticResp;

    return jsonResponse({ error: "Not found" }, { status: 404 });
  },
});

console.log(`Synthetic banking API listening on http://localhost:${server.port}`);
