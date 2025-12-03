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
      { key: "nsw", name: "New South Wales", cities: ["Sydney", "Newcastle", "Wollongong"], postalPrefix: "2", areaCodes: ["02"] },
      { key: "vic", name: "Victoria", cities: ["Melbourne", "Geelong", "Ballarat"], postalPrefix: "3", areaCodes: ["03"] },
      { key: "qld", name: "Queensland", cities: ["Brisbane", "Gold Coast", "Cairns"], postalPrefix: "4", areaCodes: ["07"] },
      { key: "wa", name: "Western Australia", cities: ["Perth", "Fremantle", "Bunbury"], postalPrefix: "6", areaCodes: ["08"] },
      { key: "sa", name: "South Australia", cities: ["Adelaide", "Mount Gambier", "Whyalla"], postalPrefix: "5", areaCodes: ["08"] },
      { key: "tas", name: "Tasmania", cities: ["Hobart", "Launceston", "Devonport"], postalPrefix: "7", areaCodes: ["03"] },
      { key: "nt", name: "Northern Territory", cities: ["Darwin", "Alice Springs", "Katherine"], postalPrefix: "0", areaCodes: ["08"] },
      { key: "act", name: "Australian Capital Territory", cities: ["Canberra", "Belconnen", "Queanbeyan"], postalPrefix: "2", areaCodes: ["02"] },
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
      { key: "andhra-pradesh", name: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada", "Guntur"], postalPrefix: "52" },
      { key: "arunachal-pradesh", name: "Arunachal Pradesh", cities: ["Itanagar", "Naharlagun", "Tawang"], postalPrefix: "79" },
      { key: "assam", name: "Assam", cities: ["Guwahati", "Silchar", "Dibrugarh"], postalPrefix: "78" },
      { key: "bihar", name: "Bihar", cities: ["Patna", "Gaya", "Bhagalpur"], postalPrefix: "80" },
      { key: "chhattisgarh", name: "Chhattisgarh", cities: ["Raipur", "Bilaspur", "Durg"], postalPrefix: "49" },
      { key: "goa", name: "Goa", cities: ["Panaji", "Margao", "Vasco da Gama"], postalPrefix: "40" },
      { key: "gujarat", name: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara"], postalPrefix: "38" },
      { key: "haryana", name: "Haryana", cities: ["Gurugram", "Faridabad", "Panipat"], postalPrefix: "12" },
      { key: "himachal-pradesh", name: "Himachal Pradesh", cities: ["Shimla", "Manali", "Dharamshala"], postalPrefix: "17" },
      { key: "jammu-kashmir", name: "Jammu & Kashmir", cities: ["Srinagar", "Jammu", "Anantnag"], postalPrefix: "18" },
      { key: "jharkhand", name: "Jharkhand", cities: ["Ranchi", "Jamshedpur", "Dhanbad"], postalPrefix: "81" },
      { key: "karnataka", name: "Karnataka", cities: ["Bengaluru", "Mysuru", "Mangaluru"], postalPrefix: "56" },
      { key: "kerala", name: "Kerala", cities: ["Kochi", "Thiruvananthapuram", "Kozhikode"], postalPrefix: "67" },
      { key: "madhya-pradesh", name: "Madhya Pradesh", cities: ["Indore", "Bhopal", "Gwalior"], postalPrefix: "45" },
      { key: "maharashtra", name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur"], postalPrefix: "40" },
      { key: "manipur", name: "Manipur", cities: ["Imphal", "Thoubal", "Ukhrul"], postalPrefix: "79" },
      { key: "meghalaya", name: "Meghalaya", cities: ["Shillong", "Tura", "Jowai"], postalPrefix: "79" },
      { key: "mizoram", name: "Mizoram", cities: ["Aizawl", "Lunglei", "Champhai"], postalPrefix: "79" },
      { key: "nagaland", name: "Nagaland", cities: ["Kohima", "Dimapur", "Mokokchung"], postalPrefix: "79" },
      { key: "odisha", name: "Odisha", cities: ["Bhubaneswar", "Cuttack", "Rourkela"], postalPrefix: "75" },
      { key: "punjab", name: "Punjab", cities: ["Ludhiana", "Amritsar", "Chandigarh"], postalPrefix: "14" },
      { key: "rajasthan", name: "Rajasthan", cities: ["Jaipur", "Jodhpur", "Udaipur"], postalPrefix: "30" },
      { key: "sikkim", name: "Sikkim", cities: ["Gangtok", "Namchi", "Gyalshing"], postalPrefix: "73" },
      { key: "tamil-nadu", name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai"], postalPrefix: "60" },
      { key: "telangana", name: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad"], postalPrefix: "50" },
      { key: "tripura", name: "Tripura", cities: ["Agartala", "Udaipur", "Dharmanagar"], postalPrefix: "79" },
      { key: "uttar-pradesh", name: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Noida"], postalPrefix: "20" },
      { key: "uttarakhand", name: "Uttarakhand", cities: ["Dehradun", "Haridwar", "Nainital"], postalPrefix: "24" },
      { key: "west-bengal", name: "West Bengal", cities: ["Kolkata", "Siliguri", "Durgapur"], postalPrefix: "70" },
      { key: "andaman-nicobar", name: "Andaman & Nicobar Islands", cities: ["Port Blair", "Havelock", "Diglipur"], postalPrefix: "74" },
      { key: "chandigarh", name: "Chandigarh", cities: ["Chandigarh"], postalPrefix: "16" },
      { key: "dadra-nagar-haveli-daman-diu", name: "Dadra & Nagar Haveli and Daman & Diu", cities: ["Daman", "Silvassa", "Diu"], postalPrefix: "39" },
      { key: "delhi", name: "Delhi", cities: ["New Delhi", "Dwarka", "Rohini"], postalPrefix: "11" },
      { key: "ladakh", name: "Ladakh", cities: ["Leh", "Kargil", "Diskit"], postalPrefix: "19" },
      { key: "lakshadweep", name: "Lakshadweep", cities: ["Kavaratti", "Agatti", "Minicoy"], postalPrefix: "68" },
      { key: "puducherry", name: "Puducherry", cities: ["Puducherry", "Karaikal", "Mahe"], postalPrefix: "60" },
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
      { key: "england", name: "England", cities: ["London", "Manchester", "Bristol"], postalPrefix: "SW1" },
      { key: "scotland", name: "Scotland", cities: ["Edinburgh", "Glasgow", "Aberdeen"], postalPrefix: "EH3" },
      { key: "wales", name: "Wales", cities: ["Cardiff", "Swansea", "Newport"], postalPrefix: "CF1" },
      { key: "northern-ireland", name: "Northern Ireland", cities: ["Belfast", "Derry", "Lisburn"], postalPrefix: "BT1" },
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
      { key: "alabama", name: "Alabama", cities: ["Birmingham", "Montgomery", "Mobile"], postalPrefix: "35", areaCodes: ["205", "251"] },
      { key: "alaska", name: "Alaska", cities: ["Anchorage", "Fairbanks", "Juneau"], postalPrefix: "99", areaCodes: ["907"] },
      { key: "arizona", name: "Arizona", cities: ["Phoenix", "Tucson", "Mesa"], postalPrefix: "85", areaCodes: ["480", "520", "602"] },
      { key: "arkansas", name: "Arkansas", cities: ["Little Rock", "Fayetteville", "Fort Smith"], postalPrefix: "71", areaCodes: ["479", "501"] },
      { key: "california", name: "California", cities: ["San Francisco", "Los Angeles", "San Diego"], postalPrefix: "90", areaCodes: ["415", "310", "619"] },
      { key: "colorado", name: "Colorado", cities: ["Denver", "Colorado Springs", "Boulder"], postalPrefix: "80", areaCodes: ["303", "719"] },
      { key: "connecticut", name: "Connecticut", cities: ["Hartford", "New Haven", "Stamford"], postalPrefix: "06", areaCodes: ["203", "860"] },
      { key: "delaware", name: "Delaware", cities: ["Wilmington", "Dover", "Newark"], postalPrefix: "19", areaCodes: ["302"] },
      { key: "florida", name: "Florida", cities: ["Miami", "Orlando", "Tampa"], postalPrefix: "32", areaCodes: ["305", "407", "813"] },
      { key: "georgia", name: "Georgia", cities: ["Atlanta", "Savannah", "Augusta"], postalPrefix: "30", areaCodes: ["404", "678", "912"] },
      { key: "hawaii", name: "Hawaii", cities: ["Honolulu", "Hilo", "Kailua"], postalPrefix: "96", areaCodes: ["808"] },
      { key: "idaho", name: "Idaho", cities: ["Boise", "Idaho Falls", "Twin Falls"], postalPrefix: "83", areaCodes: ["208"] },
      { key: "illinois", name: "Illinois", cities: ["Chicago", "Springfield", "Aurora"], postalPrefix: "60", areaCodes: ["312", "217", "630"] },
      { key: "indiana", name: "Indiana", cities: ["Indianapolis", "Fort Wayne", "Evansville"], postalPrefix: "46", areaCodes: ["317", "260"] },
      { key: "iowa", name: "Iowa", cities: ["Des Moines", "Cedar Rapids", "Davenport"], postalPrefix: "50", areaCodes: ["515", "319"] },
      { key: "kansas", name: "Kansas", cities: ["Wichita", "Overland Park", "Topeka"], postalPrefix: "66", areaCodes: ["316", "785"] },
      { key: "kentucky", name: "Kentucky", cities: ["Louisville", "Lexington", "Bowling Green"], postalPrefix: "40", areaCodes: ["502", "270"] },
      { key: "louisiana", name: "Louisiana", cities: ["New Orleans", "Baton Rouge", "Shreveport"], postalPrefix: "70", areaCodes: ["504", "225", "318"] },
      { key: "maine", name: "Maine", cities: ["Portland", "Bangor", "Augusta"], postalPrefix: "04", areaCodes: ["207"] },
      { key: "maryland", name: "Maryland", cities: ["Baltimore", "Annapolis", "Silver Spring"], postalPrefix: "21", areaCodes: ["410", "240"] },
      { key: "massachusetts", name: "Massachusetts", cities: ["Boston", "Worcester", "Cambridge"], postalPrefix: "01", areaCodes: ["617", "508"] },
      { key: "michigan", name: "Michigan", cities: ["Detroit", "Grand Rapids", "Ann Arbor"], postalPrefix: "48", areaCodes: ["313", "616"] },
      { key: "minnesota", name: "Minnesota", cities: ["Minneapolis", "St Paul", "Rochester"], postalPrefix: "55", areaCodes: ["612", "651"] },
      { key: "mississippi", name: "Mississippi", cities: ["Jackson", "Gulfport", "Biloxi"], postalPrefix: "39", areaCodes: ["601", "228"] },
      { key: "missouri", name: "Missouri", cities: ["St Louis", "Kansas City", "Springfield"], postalPrefix: "63", areaCodes: ["314", "816"] },
      { key: "montana", name: "Montana", cities: ["Billings", "Missoula", "Bozeman"], postalPrefix: "59", areaCodes: ["406"] },
      { key: "nebraska", name: "Nebraska", cities: ["Omaha", "Lincoln", "Kearney"], postalPrefix: "68", areaCodes: ["402", "531"] },
      { key: "nevada", name: "Nevada", cities: ["Las Vegas", "Reno", "Henderson"], postalPrefix: "89", areaCodes: ["702", "775"] },
      { key: "new-hampshire", name: "New Hampshire", cities: ["Manchester", "Nashua", "Concord"], postalPrefix: "03", areaCodes: ["603"] },
      { key: "new-jersey", name: "New Jersey", cities: ["Newark", "Jersey City", "Trenton"], postalPrefix: "07", areaCodes: ["201", "609"] },
      { key: "new-mexico", name: "New Mexico", cities: ["Albuquerque", "Santa Fe", "Las Cruces"], postalPrefix: "87", areaCodes: ["505", "575"] },
      { key: "new-york", name: "New York", cities: ["New York", "Buffalo", "Rochester"], postalPrefix: "10", areaCodes: ["212", "347", "718"] },
      { key: "north-carolina", name: "North Carolina", cities: ["Charlotte", "Raleigh", "Durham"], postalPrefix: "27", areaCodes: ["704", "919"] },
      { key: "north-dakota", name: "North Dakota", cities: ["Fargo", "Bismarck", "Grand Forks"], postalPrefix: "58", areaCodes: ["701"] },
      { key: "ohio", name: "Ohio", cities: ["Columbus", "Cleveland", "Cincinnati"], postalPrefix: "43", areaCodes: ["614", "216"] },
      { key: "oklahoma", name: "Oklahoma", cities: ["Oklahoma City", "Tulsa", "Norman"], postalPrefix: "73", areaCodes: ["405", "918"] },
      { key: "oregon", name: "Oregon", cities: ["Portland", "Eugene", "Salem"], postalPrefix: "97", areaCodes: ["503", "541"] },
      { key: "pennsylvania", name: "Pennsylvania", cities: ["Philadelphia", "Pittsburgh", "Allentown"], postalPrefix: "15", areaCodes: ["215", "412", "717"] },
      { key: "rhode-island", name: "Rhode Island", cities: ["Providence", "Warwick", "Cranston"], postalPrefix: "02", areaCodes: ["401"] },
      { key: "south-carolina", name: "South Carolina", cities: ["Charleston", "Columbia", "Greenville"], postalPrefix: "29", areaCodes: ["803", "843"] },
      { key: "south-dakota", name: "South Dakota", cities: ["Sioux Falls", "Rapid City", "Aberdeen"], postalPrefix: "57", areaCodes: ["605"] },
      { key: "tennessee", name: "Tennessee", cities: ["Nashville", "Memphis", "Knoxville"], postalPrefix: "37", areaCodes: ["615", "901"] },
      { key: "texas", name: "Texas", cities: ["Houston", "Austin", "Dallas"], postalPrefix: "75", areaCodes: ["713", "512", "214"] },
      { key: "utah", name: "Utah", cities: ["Salt Lake City", "Provo", "Ogden"], postalPrefix: "84", areaCodes: ["801", "385"] },
      { key: "vermont", name: "Vermont", cities: ["Burlington", "Montpelier", "Rutland"], postalPrefix: "05", areaCodes: ["802"] },
      { key: "virginia", name: "Virginia", cities: ["Richmond", "Virginia Beach", "Arlington"], postalPrefix: "22", areaCodes: ["804", "757", "571"] },
      { key: "washington", name: "Washington", cities: ["Seattle", "Spokane", "Tacoma"], postalPrefix: "98", areaCodes: ["206", "509", "253"] },
      { key: "west-virginia", name: "West Virginia", cities: ["Charleston", "Morgantown", "Huntington"], postalPrefix: "25", areaCodes: ["304", "681"] },
      { key: "wisconsin", name: "Wisconsin", cities: ["Milwaukee", "Madison", "Green Bay"], postalPrefix: "53", areaCodes: ["414", "608"] },
      { key: "wyoming", name: "Wyoming", cities: ["Cheyenne", "Casper", "Laramie"], postalPrefix: "82", areaCodes: ["307"] },
      { key: "district-of-columbia", name: "District of Columbia", cities: ["Washington"], postalPrefix: "20", areaCodes: ["202"] },
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

const parseEmailDomains = (value: string | null): string[] => {
  const defaultDomain = ["example.com"];
  if (!value) return defaultDomain;
  const domainPattern = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i;
  const domains = value
    .split(",")
    .map((d) => d.trim().replace(/^@/, "").toLowerCase())
    .filter((d) => d.length > 0 && domainPattern.test(d));

  return domains.length ? Array.from(new Set(domains)) : defaultDomain;
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
  emailDomains,
}: {
  rand: Random;
  count: number;
  territory: Territory;
  state: TerritoryState;
  emailDomains: string[];
}): Customer[] => {
  const nextId = buildIdGenerator("CUST");
  return Array.from({ length: count }, () => {
    const firstName = pick(rand, firstNames);
    const lastName = pick(rand, lastNames);
    const fullName = `${firstName} ${lastName}`;
    const domain = pick(rand, emailDomains);
    const email = `${firstName}.${lastName}${randomInt(rand, 10, 999)}@${domain}`
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
  emailDomains: string[];
};

const buildConfig = (url: URL): BuildConfig => {
  const search = url.searchParams;
  const seed = parseIntParam(search.get("seed"), Date.now());
  const rand = mulberry32(seed);

  const territory = resolveTerritory(search.get("country"));
  const state = resolveState(territory, search.get("state"), rand);
  const emailDomains = parseEmailDomains(search.get("emailDomains"));

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
    emailDomains,
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
        emailDomains: config.emailDomains,
      });

      return jsonResponse({
        meta: {
          seed: config.seed,
          customers: config.customerCount,
          country: config.territory.label,
          state: config.state.name,
          currency: config.currency,
          emailDomains: config.emailDomains,
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
        emailDomains: config.emailDomains,
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
          emailDomains: config.emailDomains,
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
        emailDomains: config.emailDomains,
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
          emailDomains: config.emailDomains,
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
