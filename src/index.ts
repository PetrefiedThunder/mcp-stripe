#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = "https://api.stripe.com/v1";
const RATE_LIMIT_MS = 100;
let lastRequestTime = 0;

function getKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY required");
  return key;
}

async function stripeFetch(path: string, method = "GET", body?: URLSearchParams): Promise<any> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_MS) await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - elapsed));
  lastRequestTime = Date.now();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${getKey()}`,
  };
  const opts: RequestInit = { method, headers };
  if (body && method !== "GET") {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    opts.body = body.toString();
  }
  const url = method === "GET" && body ? `${BASE}${path}?${body}` : `${BASE}${path}`;

  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Stripe error: ${res.status} — ${err.slice(0, 500)}`);
  }
  return res.json();
}

const server = new McpServer({ name: "mcp-stripe", version: "1.0.0" });

server.tool(
  "list_customers",
  "List Stripe customers.",
  {
    email: z.string().optional().describe("Filter by email"),
    limit: z.number().min(1).max(100).default(10),
    startingAfter: z.string().optional().describe("Cursor for pagination"),
  },
  async ({ email, limit, startingAfter }) => {
    const p = new URLSearchParams({ limit: String(limit) });
    if (email) p.set("email", email);
    if (startingAfter) p.set("starting_after", startingAfter);
    const data = await stripeFetch("/customers", "GET", p);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "create_customer",
  "Create a new Stripe customer.",
  {
    email: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    phone: z.string().optional(),
  },
  async (params) => {
    const p = new URLSearchParams();
    if (params.email) p.set("email", params.email);
    if (params.name) p.set("name", params.name);
    if (params.description) p.set("description", params.description);
    if (params.phone) p.set("phone", params.phone);
    const data = await stripeFetch("/customers", "POST", p);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "list_payments",
  "List recent payment intents.",
  {
    customer: z.string().optional().describe("Filter by customer ID"),
    limit: z.number().min(1).max(100).default(10),
  },
  async ({ customer, limit }) => {
    const p = new URLSearchParams({ limit: String(limit) });
    if (customer) p.set("customer", customer);
    const data = await stripeFetch("/payment_intents", "GET", p);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "create_payment_link",
  "Create a Stripe Payment Link for a price.",
  {
    priceId: z.string().describe("Stripe Price ID (e.g. 'price_xxx')"),
    quantity: z.number().min(1).default(1),
  },
  async ({ priceId, quantity }) => {
    const p = new URLSearchParams();
    p.set("line_items[0][price]", priceId);
    p.set("line_items[0][quantity]", String(quantity));
    const data = await stripeFetch("/payment_links", "POST", p);
    return { content: [{ type: "text" as const, text: JSON.stringify({ id: data.id, url: data.url, active: data.active }, null, 2) }] };
  }
);

server.tool(
  "list_subscriptions",
  "List subscriptions.",
  {
    customer: z.string().optional(),
    status: z.enum(["active", "past_due", "canceled", "incomplete", "trialing", "all"]).optional(),
    limit: z.number().min(1).max(100).default(10),
  },
  async ({ customer, status, limit }) => {
    const p = new URLSearchParams({ limit: String(limit) });
    if (customer) p.set("customer", customer);
    if (status) p.set("status", status);
    const data = await stripeFetch("/subscriptions", "GET", p);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "list_invoices",
  "List invoices.",
  {
    customer: z.string().optional(),
    status: z.enum(["draft", "open", "paid", "uncollectible", "void"]).optional(),
    limit: z.number().min(1).max(100).default(10),
  },
  async ({ customer, status, limit }) => {
    const p = new URLSearchParams({ limit: String(limit) });
    if (customer) p.set("customer", customer);
    if (status) p.set("status", status);
    const data = await stripeFetch("/invoices", "GET", p);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_balance",
  "Get current Stripe account balance.",
  {},
  async () => {
    const data = await stripeFetch("/balance");
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
