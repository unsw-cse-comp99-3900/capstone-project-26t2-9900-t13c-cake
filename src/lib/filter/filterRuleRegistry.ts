/** CAKE-4 — shared filter rule documentation and constants */
export const filterRuleRegistry = {
  jurisdictionLogic:
    "OR within user selection, including National for state selections",
  contextLogic: "AND exact match",
  subCategoryLogic: "AND when provided",
  engagementLogic: "AND exact match",
  resultOrder:
    "State-specific before National, then year descending, publisher, title, and id",
} as const;
