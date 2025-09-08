# 🌍 Navigation Game — Prod-Style with Observability

Single-containerized stack demonstrating a **browser map game** (React + Leaflet) and **observability** (JSON logs shipped to **Elasticsearch**, visualized in **Kibana**) with **trace propagation** end-to-end.

- Frontend (Nginx) proxies `/api/*` → Backend
- Backend logs single-line JSON with `"trace.id"`
- Filebeat ships container logs → Elasticsearch
- Kibana dashboards / Discover show logs & flows

---

## ✅ Prerequisites

- Docker Desktop (or Docker Engine + Compose)
- Ports available: `8080` (frontend), `3000` (backend), `5601` (Kibana), `9200` (Elasticsearch)

---

## 📦 Project Structure

```
navigation-game/
├─ docker-compose.yml
├─ frontend/            # Vite React app + Nginx reverse proxy (/api -> backend)
│  ├─ Dockerfile
│  ├─ nginx.conf
│  ├─ index.html
│  └─ src/...
├─ backend/             # Express API + JSON logging with trace IDs
│  ├─ Dockerfile
│  └─ src/...
└─ monitoring/
   └─ filebeat.yml      # Ships container logs -> Elasticsearch (observability-*)
```

---

## 🚀 Quick Start

```bash
# From project root
docker compose down -v
docker compose build --no-cache
docker compose up -d
docker compose ps
```

Open:
- Frontend → http://localhost:8080  
- Backend → http://localhost:3000  
- Kibana  → http://localhost:5601  
- Elasticsearch → http://localhost:9200

---

## 🧪 Quick Tests (cURL)

> We’ll use a single **trace** across calls to prove correlation end-to-end.

```bash
# (Git Bash/macOS/Linux) set a trace header value:
TRACE='00-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-bbbbbbbbbbbbbbbb-01'

# 1) Frontend (Nginx) static request — logs access + forwards trace
curl -I -H "traceparent: $TRACE" http://localhost:8080/

# 2) Frontend → Backend via proxy — both Nginx & Backend log with same trace
curl -H "traceparent: $TRACE" http://localhost:8080/api/session/start

# 3) Backend direct — start session and send events with the same trace
curl -H "traceparent: $TRACE" http://localhost:3000/api/session/start

curl -X POST http://localhost:3000/api/events   -H "Content-Type: application/json"   -H "traceparent: $TRACE"   -d '{"type":"position_tick","position":{"lat":25.276987,"lon":55.296249}}'

curl -X POST http://localhost:3000/api/events   -H "Content-Type: application/json"   -H "traceparent: $TRACE"   -d '{"type":"goal_reached","position":{"lat":25.2815,"lon":55.3020}}'
```

---

## 🔎 Verify Data Landed (Elasticsearch)

```bash
# Today’s index name
TODAY=$(date +%Y.%m.%d); echo $TODAY

# Count docs
curl "http://localhost:9200/observability-$TODAY/_count?pretty"

# Search by trace (replace the 32 a’s if you changed it)
curl -s "http://localhost:9200/observability-$TODAY/_search"   -H "Content-Type: application/json"   -d '{
        "query": { "term": { "trace.id.keyword": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" } },
        "_source": ["@timestamp","message","trace.id","meta.event.type","meta.position.lat","meta.position.lon","service","container.name"],
        "size": 50,
        "sort": [{ "@timestamp": "desc" }]
      }'
```

---

## 🧰 Create a Kibana Data View (no UI)

Create the Data View (aka index pattern) for `observability-*`:

```bash
curl -X POST "http://localhost:5601/api/data_views/data_view"   -H 'Content-Type: application/json'   -H 'kbn-xsrf: true'   -d '{
    "data_view": {
      "title": "observability-*",
      "name": "observability",
      "timeFieldName": "@timestamp"
    }
  }'
```

List data views:
```bash
curl -X GET "http://localhost:5601/api/data_views" -H 'kbn-xsrf: true'
```

Now open Kibana → Discover, select **observability**, set time to **Last 15 minutes**, and try queries:

- All docs for your trace:
  ```
  trace.id: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  ```
- All backend events:
  ```
  message: "event"
  ```
- Goal reached:
  ```
  meta.event.type: "goal_reached"
  ```

---

## 📊 (Optional) Import Dashboard via NDJSON

If you generated the NDJSON with panels (logs over time, events by type, top trace IDs, and Vega scatter for positions):

```bash
# Import via Kibana Saved Objects API (adjust path to your file)
curl -X POST "http://localhost:5601/api/saved_objects/_import?overwrite=true"   -H "kbn-xsrf: true"   -H "Content-Type: multipart/form-data"   -F file=@observability-dashboard.ndjson
```

Open: **Kibana → Analytics → Dashboard → “Observability - Navigation Game”**.

---

## 🛠 Troubleshooting

- **No logs in Discover**
  - Time range too small: set **Last 1 hour**
  - Check Filebeat logs:
    ```bash
    docker logs -f $(docker ps --format '{{.Names}}' | grep filebeat)
    ```
  - Confirm index exists:
    ```bash
    curl "http://localhost:9200/_cat/indices/observability*?v"
    ```

- **Frontend stuck at “Loading session…”**
  - Proxy test:
    ```bash
    curl http://localhost:8080/api/session/start
    ```
    Should return JSON from backend.

- **Windows + Docker Desktop**
  - Filebeat needs:
    ```yaml
    - /var/lib/docker/containers:/var/lib/docker/containers:ro
    - /var/run/docker.sock:/var/run/docker.sock:ro
    ```

---

## 🧹 Reset / Clean

```bash
docker compose down -v
docker system prune -f
```

---

## ✅ Acceptance Checklist

- [ ] `/api/session/start` returns start + goal  
- [ ] Events (`position_tick`, `goal_reached`) are logged with `"trace.id"`  
- [ ] Filebeat ships logs → `observability-YYYY.MM.DD` index has docs  
- [ ] Kibana Data View `observability-*` created and visible in Discover  
- [ ] Dashboard shows logs over time, events by type, top trace IDs (and positions if Vega is imported)
