"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EvidenceRecordDTO } from "@/server/repositories/evidenceRepository";
import { trackWebsiteUsage } from "@/components/analytics/WebsiteUsageTracker";
import { useQuizState } from "@/contexts/QuizStateContext";
import { useLanguage } from "@/contexts/LanguageContext";
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

const NATIONAL = "national";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function compareEngagementLevel(left: string, right: string): number {
  const leftNumber = Number(left);
  const rightNumber = Number(right);
  const leftIsNumber = Number.isFinite(leftNumber);
  const rightIsNumber = Number.isFinite(rightNumber);

  if (leftIsNumber || rightIsNumber) {
    if (!leftIsNumber) {
      return 1;
    }
    if (!rightIsNumber) {
      return -1;
    }
    return leftNumber - rightNumber;
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
  const { t } = useLanguage();
  const [evidenceRecords, setEvidenceRecords] = useState<EvidenceRecordDTO[] | null>(null);
  const [results, setResults] = useState<FilteredEvidenceGroup[] | null>(null);
  const [submittedFilters, setSubmittedFilters] = useState<MultiQuizFilters | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTrackedStart, setHasTrackedStart] = useState(false);

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
      setOptionsError(t("optionsLoadError"));
      return null;
    } finally {
      setIsLoadingOptions(false);
    }
  }, [evidenceRecords, t]);

  useEffect(() => {
    if (currentStep === 2 && !evidenceRecords && !isLoadingOptions && !optionsError) {
      void loadEvidenceRecords();
    }
  }, [currentStep, evidenceRecords, isLoadingOptions, loadEvidenceRecords, optionsError]);

  useEffect(() => {
    if (currentStep === 1 && !hasTrackedStart) {
      trackWebsiteUsage("questionnaire_start", {
        jurisdictions: answers.jurisdictions.length,
      });
      setHasTrackedStart(true);
    }
  }, [answers.jurisdictions.length, currentStep, hasTrackedStart]);

  async function loadResults(nextFilters: MultiQuizFilters) {
    setIsSubmitting(true);
    setError(null);
    setSubmittedFilters(nextFilters);

    const records = await loadEvidenceRecords();
    if (!records) {
      setResults([]);
      setError(t("evidenceLoadError"));
      setIsSubmitting(false);
      return;
    }

    const nextResults = filterEvidenceGroups(records, nextFilters);
    setResults(nextResults);
    trackWebsiteUsage("questionnaire_complete", {
      jurisdictions: nextFilters.jurisdictions,
      contexts: nextFilters.selections.map((selection) => selection.context),
      selections: nextFilters.selections.length,
      resultCount: nextResults.reduce((total, group) => total + group.records.length, 0),
    });
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
    setHasTrackedStart(false);
    resetAnswers();
  }

  return (
    <div className="quiz-shell w-full bg-gradient-to-br from-[#eff8f5] via-[#fbfcfa] to-[#fbfcfa] px-5 py-6 sm:px-8 sm:py-8 lg:px-[75px]">
      <div className="quiz-shell-inner">
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
