#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-db.sh  —  Creates the pilot_logbook database
# Run: bash setup-db.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "==> Enter your PostgreSQL password for user 'postgres':"
read -s PG_PASSWORD

PGPASSWORD="$PG_PASSWORD" psql -h localhost -U postgres -c \
  "CREATE DATABASE pilot_logbook;" 2>/dev/null \
  && echo "✅  Database 'pilot_logbook' created." \
  || echo "ℹ️   Database 'pilot_logbook' may already exist — continuing."

echo ""
echo "==> Done. Now update backend/src/main/resources/application.yml:"
echo "    datasource.password: <your postgres password>"
echo ""
echo "==> Then start the backend with:"
echo "    cd backend && mvn spring-boot:run"
