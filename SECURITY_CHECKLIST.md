# Security Checklist & Verification Guide

## 🔐 Pre-Deployment Security Verification

Use this checklist before deploying to production or publishing the project.

### ✅ Environment & Configuration

- [ ] `.env` file not committed to git
  ```bash
  git check-ignore .env  # Should return match
  ```

- [ ] All credentials are environment variables
  ```bash
  grep -r "password\|secret" src/ | grep -v "process.env"
  # Should return 0 results (only docs/comments)
  ```

- [ ] `.gitignore` covers all sensitive items
  ```bash
  git check-ignore -v .env logs/ dist/ node_modules/
  # All should match
  ```

- [ ] Session files not tracked
  ```bash
  git status logs/sessions/  # Should show "ignored"
  ```

### ✅ Code Review

- [ ] No hardcoded credentials (searches)
  ```bash
  grep -ri "password.*=\|secret.*=\|token.*=" src/ \
    --include="*.js" --include="*.vue" | \
    grep -v "process.env" | \
    grep -v "console.log" | \
    grep -v "comment"
  ```

- [ ] No product-specific references left
  ```bash
  grep -ri "vitapulse\|payment\|stripe" src/
  # Should find nothing
  ```

- [ ] No real email addresses
  ```bash
  grep -ri "@.*\.com\|@.*\.io" src/ | grep -v example.com
  # Should find nothing (only docs reference security@e-xode.io)
  ```

- [ ] No real domain names
  ```bash
  grep -r "localhost:5173\|example.com\|test@" src/
  # Only expected values, no production domains
  ```

### ✅ Documentation

- [ ] Example credentials use placeholders
  ```bash
  grep -r "password\|secret\|token" docs/ README*.md | \
    grep -v "example\|placeholder\|your_\|your-"
  # Should find only explanatory text
  ```

- [ ] SECURITY.md exists and has contact info
  ```bash
  test -f .github/SECURITY.md && \
  grep -q "security@" .github/SECURITY.md
  ```

- [ ] Contributing guide mentions no-secrets rule
  ```bash
  grep -q "secret\|credential" CONTRIBUTING.md
  ```

### ✅ Docker & Deployment

- [ ] Docker doesn't expose env variables
  ```bash
  grep -r "ENV.*PASSWORD\|ENV.*SECRET" docker/
  # Should only show ${VAR} references, not actual values
  ```

- [ ] .dockerignore exists and is comprehensive
  ```bash
  test -f .dockerignore && wc -l .dockerignore
  # Should have ~30+ lines
  ```

- [ ] Production build doesn't include dev files
  ```bash
  grep "dev\|node_modules\|\.env" .dockerignore
  # Should find matches for all
  ```

### ✅ Git Operations

- [ ] No credentials in git history
  ```bash
  git log --all -p -- '*' | \
  grep -i "password\|secret\|api.key" | head -5
  # Should find nothing (or only docs)
  ```

- [ ] Recent commits don't add secrets
  ```bash
  git log -10 --name-only | grep "\.env\|password\|secret"
  # Should find nothing
  ```

- [ ] Branch protection configured (GitHub)
  - Require pull request reviews: ✓
  - Require status checks to pass: ✓
  - Dismiss stale pull request approvals: ✓

### ✅ Dependencies & Packages

- [ ] Audit npm packages for vulnerabilities
  ```bash
  npm audit
  # Should show no critical/high issues
  ```

- [ ] package.json doesn't include dev env secrets
  ```bash
  grep -E "password|secret|token|api" package.json
  # Should find nothing (only dev dependencies)
  ```

### ✅ Secrets Management for Deployment

**Before deploying to production:**

1. Create strong values:
   ```bash
   # Generate COOKIE_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

   # Generate MongoDB root password (minimum 12 chars, special chars)
   openssl rand -base64 20
   ```

2. Set environment variables in hosting platform:
   - Heroku: `heroku config:set KEY=value`
   - AWS: Use AWS Secrets Manager
   - DigitalOcean: Use App Platform environment variables
   - Docker: Use Docker secrets or external secret store

3. Update `.env` template (for documentation only):
   ```plaintext
   # For documentation - NEVER use real values here
   MONGO_PWD=<generate-secure-random-password>
   COOKIE_SECRET=<generate-secure-random-hex>
   MAILER_PASSWORD=<your-app-specific-password>
   ```

### ✅ Monitoring & Maintenance

- [ ] Enable GitHub Secret Scanning
  - Settings → Code Security & Analysis → Secret scanning
  - Alerts go to: security@e-xode.io (or configured email)

- [ ] Set up pre-commit hooks locally
  ```bash
  npm install detect-secrets --save-dev
  # Configure in .pre-commit-config.yaml
  ```

- [ ] Review security issues quarterly
  - Check for exposed secrets: `git log -p -S "password"`
  - Audit dependencies: `npm audit`
  - Review GitHub security alerts

---

## 🔍 Quick Security Verification Script

Run this command to perform a quick security check:

```bash
#!/bin/bash
echo "🔐 Running security checks..."

# Check 1: No .env in git
if git check-ignore .env > /dev/null 2>&1; then
  echo "✅ .env properly ignored"
else
  echo "❌ .env NOT ignored in git"
  exit 1
fi

# Check 2: No secrets in code
SECRETS=$(grep -r "password\|secret\|token\|api.key" src/ \
  --include="*.js" --include="*.vue" | \
  grep -v "process.env" | wc -l)
if [ $SECRETS -eq 0 ]; then
  echo "✅ No hardcoded secrets in code"
else
  echo "⚠️  Found $SECRETS potential secrets - review:"
  grep -r "password\|secret" src/ --include="*.js" --include="*.vue" | grep -v "process.env"
fi

# Check 3: No product references
REFS=$(grep -ri "vitapulse\|stripe\|payment" src/ | wc -l)
if [ $REFS -eq 0 ]; then
  echo "✅ No product-specific references"
else
  echo "❌ Found $REFS product references"
  exit 1
fi

# Check 4: .gitignore coverage
for file in ".env" "logs/" "dist/" "node_modules/"; do
  if git check-ignore "$file" > /dev/null 2>&1; then
    echo "✅ $file is ignored"
  else
    echo "❌ $file is NOT ignored"
    exit 1
  fi
done

echo ""
echo "✅ All security checks passed!"
exit 0
```

Save as `scripts/security-check.sh` and run with:
```bash
chmod +x scripts/security-check.sh
./scripts/security-check.sh
```

---

## 📋 Security Audit Results

See [SECURITY_AUDIT.md](SECURITY_AUDIT.md) for the complete audit report.

**Summary:** ✅ **PASSED - No sensitive information found**

### Last Audit
- **Date:** February 8, 2026
- **Auditor:** Automated Security Review
- **Result:** 100% PASS (0 critical issues)
- **Recommendations:** 5 optional improvements

### Next Audit
- Recommended: 3-6 months
- Trigger: Before major releases
- Trigger: After security incidents
- Trigger: When adding new team members

---

## 🚨 If You Find a Security Issue

**DO NOT:**
- Create a public GitHub issue
- Post on social media
- Reply-all in team emails
- Commit fixes without reporting

**DO:**
1. Email `security@e-xode.io` with:
   - Description of vulnerability
   - Affected component
   - Severity level
   - Reproduction steps
   - Your contact info (optional)

2. Wait for response (48-72 hours)
3. Work with maintainers on fix
4. Give credit in release notes (if desired)

---

## 🔗 Related Resources

- [SECURITY.md](.github/SECURITY.md) - Vulnerability reporting policy
- [CONTRIBUTING.md](CONTRIBUTING.md) - Code contribution guidelines
- [CHANGELOG.md](CHANGELOG.md) - Version history and releases
- [README.md](README.md) - Project overview

---

**Remember:** Security is everyone's responsibility. When in doubt, ask! 🛡️
