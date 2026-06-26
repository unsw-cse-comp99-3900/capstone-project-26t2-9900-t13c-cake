# 前端接口速查

给负责 public quiz、results panel 和后续 admin UI 的同学看的开发者版本。

## TL;DR

业务目标：用户回答一个短 quiz，然后页面直接显示适合的 health consumer representative remuneration guidance。

前端主流程：

```text
Quiz answers -> fetchEvidenceRecords() -> filterEvidence(records, filters) -> ResultsPanel
```

现在可以用：

- `GET /api/evidence`
- `fetchEvidenceRecords()`
- `filterEvidence(records, filters)`

现在不要依赖：

- `POST /api/auth/login`
- `POST /api/evidence/import`
- `GET /api/evidence/export`

这些 admin / import / export 接口目前都返回 `501 Not implemented`。

## 当前实现状态

| 模块 | 状态 | 前端怎么做 |
| --- | --- | --- |
| Evidence DB + seed data | 可用 | 本地 migrate + seed。 |
| `GET /api/evidence` | 可用 | 获取所有 active evidence records。 |
| `fetchEvidenceRecords()` | 可用 | 前端优先用这个 helper。 |
| CAKE-4 `filterEvidence()` | 可用 | quiz submit 后调用。 |
| Results UI | 占位 | 还需要渲染 filtered records。 |
| Quiz option constants | 占位 | 暂时用本文档里的 value。 |
| Auth / import / export | 未完成 | public flow 不要调用。 |

## 本地启动

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

```text
App:          http://localhost:3000
Evidence API: http://localhost:3000/api/evidence
```

## API: Evidence Records

### `GET /api/evidence`

返回所有没有被 soft delete 的 evidence records。

```ts
type EvidenceRecordResponse = {
  id: string;
  publisher: string;
  title: string;
  year: number | null;
  link: string | null;
  jurisdictions: string;
  context: string;
  subCategory: string | null;
  engagementLevel: string;
  minHourlyRate: number | null;
  maxHourlyRate: number | null;
  reimbursementGuidance: boolean;
  unpaidEngagementGuidance: boolean;
  exampleOrganisations: string | null;
  createdAt: string;
  updatedAt: string;
};
```

注意：

- `createdAt` / `updatedAt` 到前端是 JSON string，不是 `Date`。
- `jurisdictions` 在 record 里是逗号分隔字符串，例如 `"National,NSW"`。
- 错误格式：`{ "error": "Unable to load evidence records" }`，HTTP status `500`。

## 前端 Fetch Helper

```ts
import { fetchEvidenceRecords } from "@/lib/api/evidenceApiClient";

const records = await fetchEvidenceRecords();
```

行为：

- 请求 `GET /api/evidence`。
- 成功返回 `EvidenceRecordDTO[]`。
- response 非 OK 时 throw `Error("Failed to load evidence records")`。

组件里建议这样处理：

```ts
try {
  const records = await fetchEvidenceRecords();
} catch {
  // 显示加载失败状态
}
```

## CAKE-4 Filter Engine

```ts
import { filterEvidence, type QuizFilters } from "@/lib/filter/filterService";
import { fetchEvidenceRecords } from "@/lib/api/evidenceApiClient";

const filters: QuizFilters = {
  jurisdictions: ["NSW", "VIC"],
  context: "Mental Health",
  subCategory: null,
  engagementLevel: "Consult",
};

const records = await fetchEvidenceRecords();
const results = filterEvidence(records, filters);
```

```ts
type QuizFilters = {
  jurisdictions: string[];
  context: string;
  subCategory: string | null;
  engagementLevel: string;
};
```

筛选行为：

| 字段 | 规则 |
| --- | --- |
| `jurisdictions` | 多选 OR。选州/领地时也包含 `National` guidance。 |
| `context` | 必填，trim/lowercase 后精确匹配。 |
| `subCategory` | 可选；用户选了才精确匹配。 |
| `engagementLevel` | 必填，trim/lowercase 后精确匹配。 |

必填 filter 缺失时返回 `[]`。

排序：

1. 州/领地 specific records 排在 `National` 前。
2. `year` 新的在前。
3. `publisher`、`title`、`id`。

## Quiz Values

在 `src/lib/constants/quizOptions.ts` 补好前，先用这些 exact values。

```ts
export const JURISDICTIONS = [
  "ACT", "NSW", "NT", "National", "QLD", "SA", "TAS", "VIC", "WA",
];

export const CONTEXTS = [
  "Disability",
  "General Public",
  "Medical Conditions",
  "Mental Health",
  "Research",
  "Social Services",
  "Victims of Crime",
  "Women's health and OB/GYN",
];

export const ENGAGEMENT_LEVELS = [
  "Collaborate", "Consult", "Empower", "Extended roles", "Inform", "Involve",
];
```

seed data 里目前存在的 sub-categories：

```ts
[
  "Alcohol and other Drugs",
  "Allergies",
  "Asthma",
  "Cancer",
  "Carers",
  "Cerebral Palsy",
  "Chronic Pain",
  "Gender-based Violence",
  "Health service improvement",
  "Homelessness",
  "Modern Slavery",
  "Motor Neuron Disease",
  "Palliative Care",
  "Postural Orthostatic Tachycardia Syndrome (POTS)",
  "Regional",
  "Rural and Remote",
  "Spinal Cord Injury",
  "Suicide",
  "Victims of Violence",
]
```

## Results UI Checklist

每张 result card 建议显示：

- `publisher`
- `title`
- `year`
- `link`，如果有
- `minHourlyRate` / `maxHourlyRate`
- `reimbursementGuidance`
- `unpaidEngagementGuidance`
- `exampleOrganisations`，如果有

rate 格式建议：

```ts
function formatRateRange(record: EvidenceRecordResponse): string {
  if (record.minHourlyRate === null && record.maxHourlyRate === null) return "Not specified";
  if (record.minHourlyRate === record.maxHourlyRate) return `$${record.minHourlyRate}/hr`;
  return `$${record.minHourlyRate ?? "?"}-$${record.maxHourlyRate ?? "?"}/hr`;
}
```

无匹配结果：

- `filterEvidence()` 返回 `[]`。
- Results UI 显示 empty state。
- 提示用户放宽 jurisdiction / context 等筛选。

## 还没完成

| Route | 当前行为 |
| --- | --- |
| `POST /api/auth/login` | `501`, `{ "error": "Not implemented" }` |
| `POST /api/evidence/import` | `501`, `{ "error": "Not implemented" }` |
| `GET /api/evidence/export` | `501`, `{ "error": "Not implemented" }` |

## 需要看的文件

```text
src/app/api/evidence/route.ts
src/lib/api/evidenceApiClient.ts
src/lib/filter/filterService.ts
src/lib/filter/filterService.test.ts
src/server/repositories/evidenceRepository.ts
prisma/schema.prisma
prisma/seed-data.json
```
