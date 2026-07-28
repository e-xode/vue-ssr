---
paths:
  - 'docker-compose*.yml'
  - 'Dockerfile'
  - '.github/workflows/**'
---

# Fleet ops boundary

- Fleet ops — production rollout, container restart, TLS renewal, log rotation, crontabs — are **not** in this repo. They live in the private `e-xode.scripts` Ops repo and are never duplicated here.
- Never inline a real hostname, IP address, port, path, or credential in these files. Use placeholders and environment variables only.
- **A tag or a merge to master does not deploy by itself** — production only moves when the private Ops rollout runs on the server.
