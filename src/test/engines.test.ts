import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const manifest = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
const lock = JSON.parse(readFileSync(new URL("../../package-lock.json", import.meta.url), "utf8"));

describe("Node.js engine support", () => {
  it("matches the locked build tool requirements in both manifests", () => {
    const nodeRange = manifest.engines.node;

    expect(nodeRange).toBe(lock.packages["node_modules/vite"].engines.node);
    expect(nodeRange).toBe(lock.packages["node_modules/rolldown"].engines.node);
    expect(nodeRange).toBe(lock.packages[""].engines.node);
  });
});
