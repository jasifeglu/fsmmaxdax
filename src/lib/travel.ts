/** Travel journey helpers shared by the Travel module. */

export interface JourneyTypeOption {
  value: string;
  label: string;
  reimbursable: boolean;
}

export const JOURNEY_TYPES: JourneyTypeOption[] = [
  { value: "home_office", label: "Home to Office", reimbursable: true },
  { value: "home_site", label: "Home to Customer Site", reimbursable: true },
  { value: "office_site", label: "Office to Customer Site", reimbursable: true },
  { value: "site_site", label: "Site to Site", reimbursable: true },
  { value: "site_office", label: "Customer Site to Office", reimbursable: true },
  { value: "site_home", label: "Customer Site to Home", reimbursable: true },
  { value: "office_home", label: "Office to Home", reimbursable: true },
  { value: "other", label: "Other Business Journey", reimbursable: true },
  { value: "personal", label: "Personal / Non-reimbursable", reimbursable: false },
];

export const journeyTypeLabel = (value: string) =>
  JOURNEY_TYPES.find((t) => t.value === value)?.label ?? value;

/** Personal journeys are never reimbursable; every other type follows company policy (reimbursable by default). */
export const isReimbursableType = (type: string) =>
  JOURNEY_TYPES.find((t) => t.value === type)?.reimbursable ?? true;

/** Metres -> kilometres rounded to 1 decimal. */
export const km = (metres: number) => Math.round((metres / 1000) * 10) / 10;

/** Duration in whole minutes between two ISO timestamps (0 if no end). */
export const durationMinutes = (startedAt: string, endedAt?: string | null) => {
  const start = new Date(startedAt).getTime();
  if (Number.isNaN(start)) return 0;
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  if (Number.isNaN(end) || end <= start) return 0;
  return Math.floor((end - start) / 60000);
};

export const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

/** Sum of GPS metres across journeys — only ever GPS metres, never mixed with road distance. */
export const sumGpsMetres = (journeys: { gps_distance_m: number | null }[]) =>
  journeys.reduce((sum, j) => sum + Number(j.gps_distance_m ?? 0), 0);

/** Total minutes across journeys (completed ones use their stored end time). */
export const sumDurationMinutes = (
  journeys: { started_at: string; ended_at: string | null }[]
) => journeys.reduce((sum, j) => sum + durationMinutes(j.started_at, j.ended_at), 0);

/** Completed, reimbursement-eligible journeys that have not been reviewed yet. */
export const awaitingMileageReview = (
  journeys: {
    status: string;
    reimbursement_eligible: boolean;
    approved_distance_m: number | null;
  }[]
) =>
  journeys.filter(
    (j) =>
      j.status === "completed" &&
      j.reimbursement_eligible &&
      j.approved_distance_m === null
  ).length;
