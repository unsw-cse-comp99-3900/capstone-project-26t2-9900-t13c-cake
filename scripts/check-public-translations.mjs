import fs from "node:fs/promises";
import { languageNames, placeholders, readPublicSource } from "./public-translation-utils.mjs";

const source = await readPublicSource();
const generated = JSON.parse(
  await fs.readFile("src/i18n/generatedPublicTranslations.json", "utf8"),
);
const errors = [];
const requestedLanguage = process.argv[2];
if (requestedLanguage && !(requestedLanguage in languageNames)) {
  throw new Error(`Unsupported language: ${requestedLanguage}`);
}
const languages = requestedLanguage ? [requestedLanguage] : Object.keys(languageNames);

for (const code of languages) {
  const dictionary = generated[code] || {};
  for (const [key, english] of Object.entries(source)) {
    if (typeof dictionary[key] !== "string" || !dictionary[key].trim()) {
      errors.push(`${code}.${key} is missing`);
      continue;
    }
    if (placeholders(english).join("|") !== placeholders(dictionary[key]).join("|")) {
      errors.push(`${code}.${key} has different placeholders`);
    }
  }
  for (const key of Object.keys(dictionary)) {
    if (!(key in source)) errors.push(`${code}.${key} is not a public translation key`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `Validated ${Object.keys(source).length} public keys across ${languages.length} language(s).`,
);
