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

const randomFloat = (rand: Random, min: number, max: number, decimals = 2): number => {
  const value = rand() * (max - min) + min;
  return Number(value.toFixed(decimals));
};

const randomDate = (rand: Random, start: Date, end: Date): string => {
  const ts = start.getTime() + rand() * (end.getTime() - start.getTime());
  return new Date(ts).toISOString();
};

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

const streets = [
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

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
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
}: {
  rand: Random;
  count: number;
}): Customer[] => {
  const nextId = buildIdGenerator("CUST");
  return Array.from({ length: count }, () => {
    const firstName = pick(rand, firstNames);
    const lastName = pick(rand, lastNames);
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName}.${lastName}${randomInt(rand, 10, 999)}@example.com`
      .toLowerCase()
      .replace(" ", "");
    const phone = `04${randomInt(rand, 10000000, 99999999)}`;
    const address = `${randomInt(rand, 1, 999)} ${pick(rand, streets)}, ${["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"][randomInt(rand, 0, 4)]} NSW`;

    return {
      id: nextId(),
      firstName,
      lastName,
      fullName,
      email,
      phone,
      address,
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

const buildConfig = (url: URL) => {
  const search = url.searchParams;
  const seed = parseIntParam(search.get("seed"), Date.now());
  const rand = mulberry32(seed);

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

  const currency = search.get("currency") ?? "AUD";
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
      });

      return jsonResponse({
        meta: {
          seed: config.seed,
          customers: config.customerCount,
        },
        data: customers,
      });
    }

    if (path === "/accounts") {
      const config = buildConfig(url);
      const customers = generateCustomers({
        rand: config.rand,
        count: config.customerCount,
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
        },
        data: { customers, accounts },
      });
    }

    if (path === "/transactions") {
      const config = buildConfig(url);
      const customers = generateCustomers({
        rand: config.rand,
        count: config.customerCount,
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
        },
        data: { customers, accounts, transactions },
      });
    }

    // Static assets
    const staticResp = await serveStatic(path);
    if (staticResp) return staticResp;

    return jsonResponse({ error: "Not found" }, { status: 404 });
  },
});

console.log(`Synthetic banking API listening on http://localhost:${server.port}`);
