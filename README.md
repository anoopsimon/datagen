# Synthetic Banking Data API (Bun)

**Simple tool built on the Bun runtime to see how cool Bun really is.**
Learn more about Bun here: https://bun.com/docs

Lightweight HTTP API that produces synthetic banking data (customers, accounts, transactions) for testing dashboards or integrations.

## UI preview

![App UI](doc/img/app.png)

## Run the API

```bash
bun run index.ts
# or specify a port
PORT=4000 bun run index.ts
```

## Endpoints

- `GET /health` readiness check.
- `GET /customers` list of generated customers.
- `GET /accounts` customers plus their generated accounts.
- `GET /transactions` customers, accounts, and transactions.

All endpoints accept the same query params:

| Param | Default | Notes |
| --- | --- | --- |
| `seed` | current timestamp | Set for deterministic runs |
| `customers` | `10` | Number of customers |
| `minAccounts` | `1` | Min accounts per customer |
| `maxAccounts` | `3` | Max accounts per customer |
| `minTransactions` | `3` | Min transactions per account |
| `maxTransactions` | `8` | Max transactions per account |
| `currency` | `AUD` | Currency code |
| `minAmount` | `10` | Min transaction amount |
| `maxAmount` | `500` | Max transaction amount |
| `startDate` | 1 month ago | ISO date (inclusive) |
| `endDate` | now | ISO date (inclusive) |

## Example requests

```bash
# Default dataset
curl "http://localhost:3000/transactions"

# Deterministic dataset with tighter ranges
curl "http://localhost:3000/transactions?seed=42&customers=5&minAccounts=1&maxAccounts=2&minTransactions=2&maxTransactions=4&minAmount=5&maxAmount=120&startDate=2024-01-01&endDate=2024-02-01"

# Customers only
curl "http://localhost:3000/customers?seed=99&customers=3"
```

Responses include a `meta` block describing the generation config and a `data` block with the generated objects.
