#!/usr/bin/env python3
"""Generate committed public UI language packs with offline neural translation."""

import json
import re
import sys
from pathlib import Path

import argostranslate.package
import argostranslate.translate

SOURCE_PATH = Path("src/i18n/translations.ts")
OUTPUT_PATH = Path("src/i18n/generatedPublicTranslations.json")
LANGUAGES = {
    "fr": "French",
    "es": "Spanish",
    "it": "Italian",
    "de": "German",
    "ja": "Japanese",
    "ko": "Korean",
    "th": "Thai",
    "vi": "Vietnamese",
}


def read_public_source() -> dict[str, str]:
    source = SOURCE_PATH.read_text(encoding="utf-8")
    start = source.find("const en = {")
    end = source.find("} as const;", start)
    if start < 0 or end < 0:
        raise RuntimeError("English translation dictionary was not found.")

    entries = re.findall(
        r'^  ([A-Za-z][A-Za-z0-9]*): (".*"),$',
        source[start:end],
        flags=re.MULTILINE,
    )
    parsed = [(key, json.loads(value)) for key, value in entries]
    admin_start = next(
        (index for index, (key, _) in enumerate(parsed) if key == "administrator"),
        -1,
    )
    if admin_start < 0:
        raise RuntimeError("Public/admin translation boundary was not found.")
    return dict(parsed[:admin_start])


def install_model(target_code: str) -> None:
    installed = argostranslate.translate.get_installed_languages()
    english = next((language for language in installed if language.code == "en"), None)
    if english and any(language.code == target_code for language in installed):
        try:
            english.get_translation(
                next(language for language in installed if language.code == target_code)
            )
            return
        except Exception:
            pass

    packages = argostranslate.package.get_available_packages()
    package = next(
        (
            candidate
            for candidate in packages
            if candidate.from_code == "en" and candidate.to_code == target_code
        ),
        None,
    )
    if package is None:
        raise RuntimeError(f"No Argos model is available for en -> {target_code}.")
    argostranslate.package.install_from_path(package.download())


def translator_for(target_code: str):
    installed = argostranslate.translate.get_installed_languages()
    english = next(language for language in installed if language.code == "en")
    target = next(language for language in installed if language.code == target_code)
    return english.get_translation(target)


def translate_text(translator, text: str) -> str:
    placeholders = re.findall(r"\{[^}]+\}", text)
    if not placeholders:
        return translator.translate(text)

    # Some models omit synthetic placeholder tokens entirely. Translate only
    # the natural-language fragments and stitch the original placeholders back
    # into their exact positions.
    translated = "".join(
        part if re.fullmatch(r"\{[^}]+\}", part) else translator.translate(part)
        for part in re.split(r"(\{[^}]+\})", text)
        if part
    )

    if sorted(re.findall(r"\{[^}]+\}", translated)) != sorted(placeholders):
        raise RuntimeError(f"Translation changed placeholders: {text!r} -> {translated!r}")
    return translated


def main() -> None:
    requested = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] else None
    if requested and requested not in LANGUAGES:
        raise RuntimeError(f"Unsupported language: {requested}")
    targets = [requested] if requested else list(LANGUAGES)

    source = read_public_source()
    generated = json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
    argostranslate.package.update_package_index()

    for code in targets:
        install_model(code)
        translator = translator_for(code)
        generated[code] = {
            key: translate_text(translator, value) for key, value in source.items()
        }
        OUTPUT_PATH.write_text(
            json.dumps(generated, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"Generated {len(source)} {LANGUAGES[code]} translations.")


if __name__ == "__main__":
    main()
