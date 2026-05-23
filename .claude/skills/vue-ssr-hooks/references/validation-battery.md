# Validation battery details

## Execution order

1. **Format** (prettier --write .) — auto-fixes formatting
2. **Lint** (eslint . --fix) — fixes fixable issues, reports errors
3. **Test** (vitest run) — runs all unit tests

Stop at first failure. Report structured pass/fail.

## Expected output format

```
## Validation result

- format: ✅ PASS
- lint: ✅ PASS (0 errors, N warnings)
- test: ✅ PASS (72/72 SUCCESS)
```

Or on failure:

```
## Validation result

- format: ✅ PASS
- lint: ❌ FAIL
  <error output — max 30 lines>
```

## Text-based failure indicators

Check for these even on exit 0:

- `error` in eslint output with non-zero error count
- `FAIL` in vitest output
- Non-zero exit code

## When validation is skipped

- No code files modified (only .md, .json, config)
- Git digest matches previous run (no new changes since last validation)
- Explicit user override (rare)
