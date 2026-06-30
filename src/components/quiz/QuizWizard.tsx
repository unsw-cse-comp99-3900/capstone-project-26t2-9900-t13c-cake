"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import { useQuizState } from "@/contexts/QuizStateContext";
import { fetchEvidenceRecords } from "@/lib/api/evidenceApiClient";
import { filterEvidence, type QuizFilters } from "@/lib/filter/filterService";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { ContextStep } from "./ContextStep";
import { EngagementStep } from "./EngagementStep";
import { JurisdictionStep } from "./JurisdictionStep";
import { QuizProgress } from "./QuizProgress";

const ENGAGEMENT_LEVEL_ORDER = [
  "Inform",
  "Consult",
  "Involve",
  "Collaborate",
  "Empower",
  "Extended roles",
] as const;

const NATIONAL = "national";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function compareEngagementLevel(left: string, right: string): number {
  const leftIndex = ENGAGEMENT_LEVEL_ORDER.findIndex((level) => level === left);
  const rightIndex = ENGAGEMENT_LEVEL_ORDER.findIndex((level) => level === right);

  if (leftIndex !== -1 || rightIndex !== -1) {
    if (leftIndex === -1) {
      return 1;
    }
    if (rightIndex === -1) {
      return -1;
    }
    return leftIndex - rightIndex;
  }

  return left.localeCompare(right);
}

function recordMatchesSelectedJurisdiction(
  record: EvidenceRecordDTO,
  selectedJurisdictions: string[],
): boolean {
  const selected = new Set(selectedJurisdictions.map(normalize).filter(Boolean));
  if (selected.size === 0) {
    return false;
  }

  return record.jurisdictions
    .split(",")
    .map(normalize)
    .some((jurisdiction) => jurisdiction === NATIONAL || selected.has(jurisdiction));
}

/** CAKE-3 - QuizWizard */
export function QuizWizard() {
  const { answers, currentStep, resetAnswers } = useQuizState();
  const [evidenceRecords, setEvidenceRecords] = useState<EvidenceRecordDTO[] | null>(null);
  const [results, setResults] = useState<EvidenceRecordDTO[] | null>(null);
  const [submittedFilters, setSubmittedFilters] = useState<QuizFilters | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filters = useMemo<QuizFilters | null>(() => {
    if (!answers.context || !answers.engagementLevel) {
      return null;
    }

    return {
      jurisdictions: answers.jurisdictions,
      context: answers.context,
      subCategory: answers.subCategory,
      engagementLevel: answers.engagementLevel,
    };
  }, [answers]);

  const contexts = useMemo(() => {
    return Array.from(
      new Set(
        (evidenceRecords ?? [])
          .map((record) => record.context.trim())
          .filter(Boolean),
      ),
    ).sort((left, right) => left.localeCompare(right));
  }, [evidenceRecords]);

  const subCategories = useMemo(() => {
    const relevantRecords = answers.context
      ? (evidenceRecords ?? []).filter((record) => record.context === answers.context)
      : (evidenceRecords ?? []);

    return Array.from(
      new Set(
        relevantRecords
          .map((record) => record.subCategory?.trim() ?? "")
          .filter(Boolean),
      ),
    ).sort((left, right) => left.localeCompare(right));
  }, [answers.context, evidenceRecords]);

  const engagementLevels = useMemo(() => {
    const relevantRecords = (evidenceRecords ?? []).filter((record) => {
      const matchesJurisdiction = recordMatchesSelectedJurisdiction(
        record,
        answers.jurisdictions,
      );
      const matchesContext = answers.context ? record.context === answers.context : true;
      const matchesSubCategory = answers.subCategory
        ? record.subCategory === answers.subCategory
        : true;

      return matchesJurisdiction && matchesContext && matchesSubCategory;
    });

    return Array.from(
      new Set(
        relevantRecords
          .map((record) => record.engagementLevel.trim())
          .filter(Boolean),
      ),
    ).sort(compareEngagementLevel);
  }, [answers.context, answers.jurisdictions, answers.subCategory, evidenceRecords]);

  const loadEvidenceRecords = useCallback(async (): Promise<EvidenceRecordDTO[] | null> => {
    if (evidenceRecords) {
      return evidenceRecords;
    }

    setIsLoadingOptions(true);
    setOptionsError(null);
    try {
      const records = await fetchEvidenceRecords();
      setEvidenceRecords(records);
      return records;
    } catch {
      setOptionsError("Failed to load context options from the evidence database.");
      return null;
    } finally {
      setIsLoadingOptions(false);
    }
  }, [evidenceRecords]);

  useEffect(() => {
    if (currentStep === 2 && !evidenceRecords && !isLoadingOptions) {
      void loadEvidenceRecords();
    }
  }, [currentStep, evidenceRecords, isLoadingOptions, loadEvidenceRecords]);

  async function loadResults(nextFilters: QuizFilters) {
    setIsSubmitting(true);
    setError(null);
    setSubmittedFilters(nextFilters);

    const records = await loadEvidenceRecords();
    if (!records) {
      setResults([]);
      setError("Failed to load evidence records. Please check the API and try again.");
      setIsSubmitting(false);
      return;
    }

    setResults(filterEvidence(records, nextFilters));
    setIsSubmitting(false);
  }

  function handleSubmit() {
    if (!filters) {
      return;
    }

    void loadResults(filters);
  }

  function handleStartOver() {
    setResults(null);
    setSubmittedFilters(null);
    setError(null);
    resetAnswers();
  }

  return (
    <div className="quiz-shell mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="quiz-shell-inner rounded-2xl bg-slate-100 p-3 sm:p-4 lg:p-5">
        {submittedFilters && results !== null ? (
          <ResultsPanel
            filters={submittedFilters}
            records={results}
            error={error}
            onRetry={() => void loadResults(submittedFilters)}
            onStartOver={handleStartOver}
          />
        ) : (
          <>
            <QuizProgress currentStep={currentStep} />

            <div className="mt-4">
              {currentStep === 1 ? <JurisdictionStep /> : null}
              {currentStep === 2 ? (
                <ContextStep
                  contexts={contexts}
                  subCategories={subCategories}
                  isLoading={isLoadingOptions}
                  error={optionsError}
                  onRetry={() => void loadEvidenceRecords()}
                />
              ) : null}
              {currentStep === 3 ? (
                <EngagementStep
                  engagementLevels={engagementLevels}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmit}
                />
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
