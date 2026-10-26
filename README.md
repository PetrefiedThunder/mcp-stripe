# mcp-stripe

Manage Stripe payments, customers, subscriptions, invoices, and payment links.

## Tools

| Tool | Description |
|------|-------------|
| `list_customers` | List Stripe customers. |
| `create_customer` | Create a new Stripe customer. |
| `list_payments` | List recent payment intents. |
| `create_payment_link` | Create a Stripe Payment Link for a price. |
| `list_subscriptions` | List subscriptions. |
| `list_invoices` | List invoices. |
| `get_balance` | Get current Stripe account balance. |

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (sk_live_... or sk_test_...) |

## Installation

```bash
git clone https://github.com/PetrefiedThunder/mcp-stripe.git
cd mcp-stripe
npm install
npm run build
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "node",
      "args": ["/path/to/mcp-stripe/dist/index.js"],
      "env": {
        "STRIPE_SECRET_KEY": "your-stripe-secret-key"
      }
    }
  }
}
```

## Usage with npx

```bash
npx mcp-stripe
```

## License

Apache-2.0
