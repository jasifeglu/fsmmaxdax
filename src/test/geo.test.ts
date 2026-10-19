import { describe, it, expect } from "vitest";
import { overallExpenseStatus, distanceMeters } from "@/lib/geo";

describe("expense approval flow (Manager → HR)", () => {
  it("is pending until manager approves", () => expect(overallExpenseStatus("pending", "pending")).toBe("pending"));
  it("is still pending after only manager approves", () => expect(overallExpenseStatus("approved", "pending")).toBe("pending"));
  it("is approved after manager and HR approve", () => expect(overallExpenseStatus("approved", "approved")).toBe("approved"));
  it("is rejected if manager rejects", () => expect(overallExpenseStatus("rejected", "pending")).toBe("rejected"));
  it("is rejected if HR rejects", () => expect(overallExpenseStatus("approved", "rejected")).toBe("rejected"));
});

describe("distance", () => {
  it("measures ~111 km per degree of latitude", () => {
    expect(Math.round(distanceMeters(10, 76, 11, 76) / 1000)).toBe(111);
  });
});
