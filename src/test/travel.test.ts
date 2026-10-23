import { describe, it, expect } from "vitest";
import {
  JOURNEY_TYPES,
  isReimbursableType,
  km,
  durationMinutes,
  formatDuration,
  sumGpsMetres,
  awaitingMileageReview,
} from "../lib/travel";

describe("travel journey helpers", () => {
  it("offers the 9 configured journey types", () => {
    expect(JOURNEY_TYPES).toHaveLength(9);
  });

  it("marks personal journeys as non-reimbursable and all business types as reimbursable", () => {
    expect(isReimbursableType("personal")).toBe(false);
    expect(isReimbursableType("home_office")).toBe(true);
    expect(isReimbursableType("site_site")).toBe(true);
    expect(isReimbursableType("unknown_type")).toBe(true); // business journey by default
  });

  it("never mixes GPS and road distance in sums", () => {
    const journeys = [
      { gps_distance_m: 12400 },
      { gps_distance_m: 6200 },
      { gps_distance_m: 14000 },
    ];
    // 12.4 + 6.2 + 14.0 = 32.6 km, GPS source only
    expect(km(sumGpsMetres(journeys))).toBe(32.6);
  });

  it("converts metres to kilometres with 1 decimal", () => {
    expect(km(0)).toBe(0);
    expect(km(12400)).toBe(12.4);
    expect(km(12345)).toBe(12.3);
  });

  it("computes duration only from start to end", () => {
    const start = "2026-10-23T09:00:00Z";
    expect(durationMinutes(start, "2026-10-23T09:45:00Z")).toBe(45);
    expect(durationMinutes(start, "2026-10-23T08:00:00Z")).toBe(0); // invalid end
    expect(durationMinutes(start)).toBeGreaterThanOrEqual(0); // active journey
  });

  it("formats durations", () => {
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(125)).toBe("2h 5m");
  });

  it("counts only completed eligible journeys without an approved distance as awaiting review", () => {
    const journeys = [
      { status: "active", reimbursement_eligible: true, approved_distance_m: null },
      { status: "completed", reimbursement_eligible: true, approved_distance_m: null },
      { status: "completed", reimbursement_eligible: false, approved_distance_m: null },
      { status: "completed", reimbursement_eligible: true, approved_distance_m: 14000 },
      { status: "completed", reimbursement_eligible: true, approved_distance_m: null },
    ];
    expect(awaitingMileageReview(journeys)).toBe(2);
  });
});
