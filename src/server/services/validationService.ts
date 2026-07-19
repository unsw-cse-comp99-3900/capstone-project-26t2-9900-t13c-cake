import type { Prisma } from "@prisma/client";
import type { ExcelEvidenceRow } from "@/server/services/excelParseService";

export type EvidencePayload = Prisma.EvidenceRecordCreateInput;

function isRecord(payload: unknown): payload is Record<string, unknown> {
  return typeof payload === "object" && payload !== null && !Array.isArray(payload);
}

function readRequiredString(payload: Record<string, unknown>, field: string): string {
  const value = payload[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

function readOptionalString(payload: Record<string, unknown>, field: string): string | null {
  const value = payload[field];
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error(`${field} must be text`);
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function readOptionalNumber(payload: Record<string, unknown>, field: string): number | null {
  const value = payload[field];
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue)) {
    throw new Error(`${field} must be a number`);
  }
  return numberValue;
}

function readOptionalInteger(payload: Record<string, unknown>, field: string): number | null {
  const value = readOptionalNumber(payload, field);
  if (value === null) {
    return null;
  }
  if (!Number.isInteger(value)) {
    throw new Error(`${field} must be a whole number`);
  }
  return value;
}

function readBoolean(payload: Record<string, unknown>, field: string): boolean {
  const value = payload[field];
  if (typeof value === "boolean") {
    return value;
  }
  return value === "true" || value === "on" || value === 1;
}

function hasInvalidNumber(value: number | null): boolean {
  return typeof value === "number" && !Number.isFinite(value);
}

function hasText(value: string | null): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function hasValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Layer 3 — ValidationService (CAKE-11) */
export const validationService = {
  validateEvidencePayload(payload: unknown): EvidencePayload {
    if (!isRecord(payload)) {
      throw new Error("Evidence payload must be an object");
    }

    const minHourlyRate = readOptionalNumber(payload, "minHourlyRate");
    const maxHourlyRate = readOptionalNumber(payload, "maxHourlyRate");

    if (minHourlyRate !== null && minHourlyRate < 0) {
      throw new Error("minHourlyRate must not be negative");
    }
    if (maxHourlyRate !== null && maxHourlyRate < 0) {
      throw new Error("maxHourlyRate must not be negative");
    }
    if (minHourlyRate !== null && maxHourlyRate !== null && minHourlyRate > maxHourlyRate) {
      throw new Error("minHourlyRate must be less than or equal to maxHourlyRate");
    }

    return {
      publisher: readRequiredString(payload, "publisher"),
      title: readRequiredString(payload, "title"),
      year: readOptionalInteger(payload, "year"),
      link: readOptionalString(payload, "link"),
      jurisdictions: readRequiredString(payload, "jurisdictions"),
      context: readRequiredString(payload, "context"),
      subCategory: readOptionalString(payload, "subCategory"),
      engagementLevel: readRequiredString(payload, "engagementLevel"),
      minHourlyRate,
      maxHourlyRate,
      reimbursementGuidance: readBoolean(payload, "reimbursementGuidance"),
      unpaidEngagementGuidance: readBoolean(payload, "unpaidEngagementGuidance"),
      exampleOrganisations: readOptionalString(payload, "exampleOrganisations"),
    };
  },

  validateExcelEvidenceRow(row: ExcelEvidenceRow): string[] {
    const errors: string[] = [];

    if (!hasText(row.publisher)) {
      errors.push("publisher is required");
    }
    if (!hasText(row.title)) {
      errors.push("title is required");
    }
    if (!hasText(row.jurisdictions)) {
      errors.push("jurisdictions is required");
    }
    if (!hasText(row.context)) {
      errors.push("context is required");
    }
    if (!hasText(row.engagementLevel)) {
      errors.push("engagementLevel is required");
    }

    if (hasInvalidNumber(row.year) || (row.year !== null && !Number.isInteger(row.year))) {
      errors.push("year must be a valid whole number if present");
    }
    if (hasInvalidNumber(row.minHourlyRate)) {
      errors.push("minHourlyRate must be a valid number if present");
    }
    if (hasInvalidNumber(row.maxHourlyRate)) {
      errors.push("maxHourlyRate must be a valid number if present");
    }
    if (
      Number.isFinite(row.minHourlyRate) &&
      Number.isFinite(row.maxHourlyRate) &&
      row.minHourlyRate !== null &&
      row.maxHourlyRate !== null &&
      row.minHourlyRate > row.maxHourlyRate
    ) {
      errors.push("minHourlyRate must be less than or equal to maxHourlyRate");
    }
    if (hasText(row.link) && !hasValidHttpUrl(row.link)) {
      errors.push("link must be a valid URL if present");
    }

    return errors;
  },
};
