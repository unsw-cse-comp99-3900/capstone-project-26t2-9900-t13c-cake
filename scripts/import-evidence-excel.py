"""Regenerate prisma/seed-data.json from the supervisor Excel file (CAKE-2).

Usage:
  python scripts/import-evidence-excel.py
  python scripts/import-evidence-excel.py --input path/to/file.xlsx
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pandas as pd

JURISDICTION_MAP = {
    "Australian Capital Territory": "ACT",
    "National": "National",
    "New South Wales": "NSW",
    "Northern Territory": "NT",
    "Queensland": "QLD",
    "South Australia": "SA",
    "Tasmania": "TAS",
    "Victoria": "VIC",
    "Western Australia": "WA",
}

def clean(value: object) -> str | None:
    if pd.isna(value):
        return None
    text = str(value).strip()
    return text if text and text.lower() != "nan" else None


def parse_year(value: object) -> int | None:
    if pd.isna(value):
        return None
    match = re.search(r"(20\d{2})", str(value))
    return int(match.group(1)) if match else None


def parse_rate(value: object) -> float | None:
    if pd.isna(value):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def parse_bool_yes_no(value: object) -> bool:
    if pd.isna(value):
        return False
    return str(value).strip().upper().startswith("Y")


def parse_bool_yn(value: object) -> bool:
    if pd.isna(value):
        return False
    return str(value).strip().upper() in {"Y", "YES"}


def normalize_link(value: object) -> str | None:
    link = clean(value)
    if not link:
        return None
    if not link.startswith("http"):
        return f"https://{link}"
    return link


def convert_excel(input_path: Path) -> list[dict]:
    frame = pd.read_excel(input_path, sheet_name="Evidence Table")
    frame.columns = [str(column).strip().replace("\xa0", " ").strip() for column in frame.columns]

    rows: list[dict] = []
    for _, row in frame.iterrows():
        publisher = clean(row["Publisher"])
        if not publisher:
            continue

        jurisdiction = clean(row["Juristiction"])
        jurisdiction_code = JURISDICTION_MAP.get(jurisdiction, jurisdiction) if jurisdiction else "National"
        engagement_raw = clean(row["Consumer engagement levels"])
        engagement_level = engagement_raw or "2"

        rows.append(
            {
                "publisher": publisher,
                "title": clean(row["Title"]) or "Untitled",
                "year": parse_year(row["Date"]),
                "link": normalize_link(row["Link"]),
                "jurisdictions": jurisdiction_code,
                "context": clean(row["Context"]) or "General Public",
                "subCategory": clean(row["Sub-category"]),
                "engagementLevel": engagement_level,
                "minHourlyRate": parse_rate(row["Minimum estimated/ indicative hourly rate*"]),
                "maxHourlyRate": parse_rate(row["Maximum estimated/ indicative hourly rate*"]),
                "reimbursementGuidance": parse_bool_yes_no(
                    row["Reimbursement guidance included (e.g., out-of-pocket costs)"]
                ),
                "unpaidEngagementGuidance": parse_bool_yn(row["Unpaid consumer engagement guidance"]),
                "exampleOrganisations": clean(
                    row["Example organisations using this remuneration framework"]
                ),
            }
        )

    return rows


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    default_input = root / "docs" / "Evidence Table Consumer Rep Remuneration.xlsx"
    default_output = root / "prisma" / "seed-data.json"

    parser = argparse.ArgumentParser(description="Convert supervisor Excel to seed-data.json")
    parser.add_argument("--input", type=Path, default=default_input)
    parser.add_argument("--output", type=Path, default=default_output)
    args = parser.parse_args()

    if not args.input.exists():
        raise SystemExit(f"Input file not found: {args.input}")

    rows = convert_excel(args.input)
    args.output.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(rows)} records to {args.output}")


if __name__ == "__main__":
    main()
