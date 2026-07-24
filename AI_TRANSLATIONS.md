# AI-generated public translations

Argos Translate runs an offline neural translation model when maintainers
regenerate the committed public language pack. No cloud translation API or API
key is used. The administrator interface remains English-only.

## GitHub setup

1. Run **Actions → Update offline public translations → Run workflow**.
2. Leave `language` empty for all languages, or enter `fr`, `es`, `it`, `de`,
   `ja`, `ko`, `th`, or `vi`.

The workflow generates translations temporarily and validates all public keys
and placeholders. It has read-only repository access and never commits or
pushes changes. Maintainers regenerate and commit the language pack locally
when the English source text changes.

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
