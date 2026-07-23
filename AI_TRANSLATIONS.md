# AI-generated public translations

Argos Translate runs an offline neural translation model when maintainers
regenerate the committed public language pack. No cloud translation API or API
key is used. The administrator interface remains English-only.

## GitHub setup

1. Run **Actions → Update offline public translations → Run workflow**.
2. Leave `language` empty for all languages, or enter `fr`, `es`, `it`, `de`,
   `ja`, `ko`, `th`, or `vi`.

The workflow validates all public keys and placeholders before committing
`src/i18n/generatedPublicTranslations.json` to the selected branch.

## Local commands

```bash
python3 -m pip install -r requirements-translation.txt
npm run translate:public
npm run translate:public:check
```

To update only Japanese:

```bash
npm run translate:public -- ja
```

Only the generated translations belong in Git. Downloaded Argos language models
remain in the local or GitHub Actions cache.
