# Security policy

## Supported versions

Security fixes are released for the latest minor version of the current major version.

| Version        | Supported |
| -------------- | --------- |
| 5.x (latest)   | Yes       |
| Older versions | No        |

A project built from the kit is a fork: it receives fixes by merging or porting them.
[CHANGELOG.md](../CHANGELOG.md) lists every security fix under a `Security` heading and marks the
ones that need action with ⚠️.

## Reporting a vulnerability

**Do not open a public issue, discussion or pull request for a vulnerability.**

Report it privately, either way:

- GitHub: **Security → Report a vulnerability** on this repository (private advisory).
- Email: <contact@e-xode.net>

Please include:

- the affected version or commit, and the component (API route, SSR, Docker image…);
- what an attacker can do, and the conditions required;
- steps to reproduce, or a proof of concept;
- a suggested fix, if you have one.

## What to expect

- An acknowledgement within 3 working days.
- An assessment, and a fix plan for confirmed issues, within 10 working days.
- A fix released as a patch version, with credit in the changelog unless you prefer otherwise.
- Please allow a reasonable time for the fix before any public disclosure.

## Scope

In scope: the code of this repository (authentication, sessions, API, SSR, the Docker images, the
default configuration).

Out of scope: vulnerabilities in dependencies that have no impact on the kit (report them
upstream), findings that require a compromised server or database, and the absence of
rate limiting in development mode, where it is disabled by design.

## Security measures in the kit

Summarised in [docs/AUTHENTICATION.md](../docs/AUTHENTICATION.md) and
[docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md): hashed passwords and codes, atomic attempt counters
and account lockout, session rotation and absolute lifetime, Helmet CSP, rate limiting,
reCAPTCHA v3, typed inputs, allowlisted user fields in responses, and startup checks that refuse
an unsafe production configuration.
