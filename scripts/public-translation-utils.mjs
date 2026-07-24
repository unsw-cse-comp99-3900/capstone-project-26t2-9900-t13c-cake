import fs from "node:fs/promises";

export const languageNames = {
  fr: "French",
  es: "Spanish",
  it: "Italian",
  de: "German",
  ja: "Japanese",
  ko: "Korean",
  th: "Thai",
  vi: "Vietnamese",
};

export async function readPublicSource(sourcePath = "src/i18n/translations.ts") {
  const source = await fs.readFile(sourcePath, "utf8");
  const start = source.indexOf("const en = {");
  const end = source.indexOf("} as const;", start);
  if (start < 0 || end < 0) throw new Error("English translation dictionary was not found.");

  const entries = [...source.slice(start, end).matchAll(
    /^  ([A-Za-z][A-Za-z0-9]*): (".*"),$/gm,
  )].map((match) => [match[1], JSON.parse(match[2])]);
  const adminStart = entries.findIndex(([key]) => key === "administrator");
  if (adminStart < 0) throw new Error("Public/admin translation boundary was not found.");
  return Object.fromEntries(entries.slice(0, adminStart));
}

export function placeholders(value) {
  return [...value.matchAll(/\{[^}]+\}/g)].map((match) => match[0]).sort();
}
