"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import { useQuizState } from "@/contexts/QuizStateContext";
import { fetchEvidenceRecords } from "@/lib/api/evidenceApiClient";
import {
  filterEvidenceGroups,
  type FilteredEvidenceGroup,
  type MultiQuizFilters,
} from "@/lib/filter/filterService";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { ContextStep } from "./ContextStep";
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
  const [results, setResults] = useState<FilteredEvidenceGroup[] | null>(null);
  const [submittedFilters, setSubmittedFilters] = useState<MultiQuizFilters | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filters = useMemo<MultiQuizFilters | null>(() => {
    const selections = answers.selections
      .filter((selection) => selection.engagementLevel)
      .map((selection) => ({
        context: selection.context,
        subCategory: selection.subCategory,
        engagementLevel: selection.engagementLevel ?? "",
      }));

    if (selections.length === 0) {
      return null;
    }

    return {
      jurisdictions: answers.jurisdictions,
      selections,
    };
  }, [answers]);

  const contexts = useMemo(() => {
    return Array.from(
      new Set(
        (evidenceRecords ?? [])
          .filter((record) =>
            recordMatchesSelectedJurisdiction(record, answers.jurisdictions),
          )
          .map((record) => record.context.trim())
          .filter(Boolean),
      ),
    ).sort((left, right) => left.localeCompare(right));
  }, [answers.jurisdictions, evidenceRecords]);

  const selectionOptions = useMemo(() => {
    return contexts.map((context) => {
      const relevantRecords = (evidenceRecords ?? []).filter(
        (record) =>
          recordMatchesSelectedJurisdiction(record, answers.jurisdictions) &&
          normalize(record.context) === normalize(context),
      );

      const subCategories = Array.from(
        new Set(
          relevantRecords
            .map((record) => record.subCategory?.trim() ?? "")
            .filter(Boolean),
        ),
      ).sort((left, right) => left.localeCompare(right));

      const engagementLevelsBySubCategory: Record<string, string[]> = {};
      const subCategoryKeys = ["", ...subCategories];

      for (const subCategory of subCategoryKeys) {
        const subCategoryRecords = subCategory
          ? relevantRecords.filter(
              (record) => normalize(record.subCategory ?? "") === normalize(subCategory),
            )
          : relevantRecords;

        engagementLevelsBySubCategory[subCategory] = Array.from(
          new Set(
            subCategoryRecords
              .map((record) => record.engagementLevel.trim())
              .filter(Boolean),
          ),
        ).sort(compareEngagementLevel);
      }

      return {
        context,
        subCategories,
        engagementLevelsBySubCategory,
      };
    });
  }, [answers.jurisdictions, contexts, evidenceRecords]);

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
    if (currentStep === 2 && !evidenceRecords && !isLoadingOptions && !optionsError) {
      void loadEvidenceRecords();
    }
  }, [currentStep, evidenceRecords, isLoadingOptions, loadEvidenceRecords, optionsError]);

  async function loadResults(nextFilters: MultiQuizFilters) {
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

    setResults(filterEvidenceGroups(records, nextFilters));
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
                  selectionOptions={selectionOptions}
                  isLoading={isLoadingOptions}
                  error={optionsError}
                  onRetry={() => void loadEvidenceRecords()}
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
