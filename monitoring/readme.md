# Monitoring Stack

Observability for CruxAffairs: API health/latency, DB connection status, pipeline run history (when the twice-daily scheduler ran and whether it succeeded), OpenAI token cost/quota status, and alerting when any of the above breaks.

Self-hosted (not a managed service) — rather than use Grafana Cloud.

## Architecture

```
FastAPI (Azure App Service)  ---/metrics (scraped every 30s)--->  Prometheus  \
                                                                                 > Grafana (dashboards + alerts) -> notifications
GitHub Actions scheduler run --pushes result once, at the end-->  Pushgateway /
                                                                     (scraped by Prometheus)
```

- **Prometheus**: pulls metrics from continuously-running things (the API). Can't pull from something that's already gone.
- **Pushgateway**: bridge for the scheduler, which runs on GitHub Actions and exits — it pushes its result here right before dying, and Prometheus scrapes the gateway instead.
- **Grafana**: queries Prometheus, renders dashboards, evaluates alert rules, sends notifications. Doesn't store anything itself.

## Infrastructure

- **Host**: Oracle Cloud Infrastructure (OCI), Always Free tier
- **Shape**: `VM.Standard.E2.1.Micro` (1 OCPU, 1GB RAM, AMD)
- **OS**: Ubuntu (LTS)
- **Region**: ap-mumbai-1
- **VCN**: `pankaj-VCN`
- **Public IP**: (ephemeral — check OCI Console → Compute → Instances for current IP)

### Why a 1GB RAM box needs care
- 2GB swapfile configured (`/swapfile`) as a safety net against OOM kills
- Prometheus retention capped at 7 days (`--storage.tsdb.retention.time=7d`) to limit disk/resource usage
- Low metric cardinality by design — no per-request unique labels

### Firewall — two layers, both must allow traffic
1. **OCI Security List** (`pankaj-VCN` → Default Security List) — ingress rules for TCP 3000 (Grafana) and 9091 (Pushgateway)
2. **OS-level `ufw`** on the VM itself — same two ports allowed

Port 9090 (Prometheus's own UI) is **deliberately not exposed** externally at either layer — Grafana is the only intended public entry point, which keeps the attack surface smaller. To check Prometheus's UI directly, use an SSH tunnel:
```
ssh -i yourfile.key -L 9090:localhost:9090 ubuntu@<public-ip>
```
then browse `http://localhost:9090` locally.

## What's running on the VM

Defined in `docker-compose.yml`:
- `prometheus` (port 9090, internal + tunnel only)
- `pushgateway` (port 9091, public)
- `grafana` (port 3000, public — `http://<public-ip>:3000`)

Scrape targets configured in `prometheus.yml`.

## Accessing the services

### Grafana
Public and browser-reachable directly:
```
http://<public-ip>:3000
```

### Prometheus
**Not** publicly reachable, on purpose (see Firewall section above — port 9090 is intentionally closed at both the OCI Security List and `ufw` layers, so Grafana stays the only public entry point). To view Prometheus's own UI directly, use an SSH tunnel instead of opening the port:

```
ssh -i yourfile.key -L 9090:localhost:9090 ubuntu@<public-ip>
```
Leave that terminal open/connected, then browse to:
```
http://localhost:9090
```
on your own machine — **not** the VM's public IP (the public IP will always time out on 9090, that's expected). `localhost` here refers to your own laptop; the tunnel silently forwards it to the VM's Prometheus over the existing SSH connection.

Useful checks once inside: **Status → Targets** (should show `prometheus` and `pushgateway` both `UP`), or run the query `up` under the **Graph** tab.

Close the tunnel by exiting that SSH session (`exit` or `Ctrl+C`) when done — it doesn't stay open on its own.

## Deploying config changes

These files are hand-synced to the VM — no CI/CD for this on purpose, since the point is learning the stack directly. After editing `docker-compose.yml` or `prometheus.yml` locally:

```
scp -i yourfile.key monitoring/docker-compose.yml monitoring/prometheus.yml ubuntu@<public-ip>:~/monitoring/
```

Then on the VM, apply the change:
```
cd ~/monitoring
docker compose up -d
```
(Compose only recreates containers whose config actually changed.)

## Secrets

Never commit real secrets into this folder (Grafana admin password, Telegram bot tokens, App Service scrape auth token, etc.). Those live in a `.env` file on the VM directly (or a git-ignored local `.env`), not in version control.

**Note:** `/metrics` on the API is currently **unauthenticated** — a deliberate, revisit-later decision. It only exposes request counts/latency/DB-connection status (no secrets or user data), so the risk was judged low for a solo project at this stage. Revisit if this ever needs hardening (more users, more sensitive metrics).

## Status / build order

- [x] Phase 1 — VM baseline (Docker, swap, firewall)
- [x] Phase 2 — Prometheus + Pushgateway + Grafana running via Compose
- [x] Phase 3 — Instrument FastAPI app with `/metrics` (latency, health, DB connection gauge)
- [x] Phase 4 — Point Prometheus at the App Service `/metrics` endpoint (auth skipped deliberately — see note below)
- [x] Phase 5 — Instrument the scheduler to push pipeline run status + OpenAI cost/exhaustion metrics to Pushgateway
- [ ] Phase 6 — Grafana dashboards
- [ ] Phase 7 — Grafana alerting (pipeline failure, DB unreachable, OpenAI exhausted)