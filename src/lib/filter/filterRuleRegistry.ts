/** CAKE-4 — shared filter rule documentation and constants */
export const filterRuleRegistry = {
  jurisdictionLogic: "OR within user selection",
  contextLogic: "AND exact match",
  subCategoryLogic: "AND when provided",
  engagementLogic: "AND exact match",
} as const;
