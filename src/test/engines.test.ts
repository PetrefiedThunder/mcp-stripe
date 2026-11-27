import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const manifest = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
const lock = JSON.parse(readFileSync(new URL("../../package-lock.json", import.meta.url), "utf8"));

type Version = [number, number, number];

function parseVersion(text: string): Version {
  const parts = text.split(".").map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) {
    throw new Error(`Unsupported version: ${text}`);
  }
  return [parts[0], parts[1], parts[2]];
}

function compare(a: Version, b: Version): number {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

// Supports the "^X.Y.Z" and ">=X.Y.Z" comparators joined by "||" used in engines fields.
function satisfies(version: Version, range: string): boolean {
  return range.split("||").some((raw) => {
    const comparator = raw.trim();
    if (comparator.startsWith(">=")) {
      return compare(version, parseVersion(comparator.slice(2))) >= 0;
    }
    if (comparator.startsWith("^")) {
      const floor = parseVersion(comparator.slice(1));
      return version[0] === floor[0] && compare(version, floor) >= 0;
    }
    throw new Error(`Unsupported comparator: ${comparator}`);
  });
}

function declaredFloors(range: string): Version[] {
  return range.split("||").map((raw) => parseVersion(raw.trim().replace(/^(\^|>=)/, "")));
}

describe("Node.js engine support", () => {
  it("matches the locked build tool requirements in both manifests", () => {
    const nodeRange = manifest.engines.node;

    expect(nodeRange).toBe(lock.packages["node_modules/vite"].engines.node);
    expect(nodeRange).toBe(lock.packages["node_modules/rolldown"].engines.node);
    expect(nodeRange).toBe(lock.packages[""].engines.node);
  });

  it("keeps every declared Node.js floor supported by the locked Vitest", () => {
    const vitestRange: string = lock.packages["node_modules/vitest"].engines.node;

    for (const floor of declaredFloors(manifest.engines.node)) {
      expect(satisfies(floor, vitestRange), `Node ${floor.join(".")} vs vitest ${vitestRange}`).toBe(true);
    }
  });
});
