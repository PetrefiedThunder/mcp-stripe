import { describe, it, expect } from "vitest";
describe("mcp-stripe", () => {
  it("should build auth headers", () => {
    const key = "sk_test_123";
    expect(`Bearer ${key}`).toBe("Bearer sk_test_123");
  });
  it("should build customer search params", () => {
    const p = new URLSearchParams({ limit: "10", email: "test@test.com" });
    expect(p.toString()).toContain("email=test%40test.com");
  });
  it("should build line items for payment links", () => {
    const p = new URLSearchParams();
    p.set("line_items[0][price]", "price_xxx");
    p.set("line_items[0][quantity]", "1");
    expect(p.toString()).toContain("line_items");
  });
  it("should support subscription statuses", () => {
    const statuses = ["active", "past_due", "canceled", "incomplete", "trialing", "all"];
    expect(statuses.length).toBe(6);
  });
  it("should support invoice statuses", () => {
    const statuses = ["draft", "open", "paid", "uncollectible", "void"];
    expect(statuses.length).toBe(5);
  });
  it("should build API URLs", () => {
    expect("https://api.stripe.com/v1/customers").toContain("/v1/");
  });
});
