# mcp-stripe

MCP server for [Stripe](https://stripe.com) — customers, payments, subscriptions, invoices, payment links. Requires Stripe API key.

## Tools

| Tool | Description |
|------|-------------|
| `list_customers` | List/search customers |
| `create_customer` | Create a new customer |
| `list_payments` | List payment intents |
| `create_payment_link` | Create payment links for prices |
| `list_subscriptions` | List subscriptions with status filter |
| `list_invoices` | List invoices with status filter |
| `get_balance` | Get account balance |

## Setup

```
STRIPE_SECRET_KEY=sk_live_xxx  # or sk_test_xxx for testing
```

## Install

```bash
npm install && npm run build
```

## License

MIT
