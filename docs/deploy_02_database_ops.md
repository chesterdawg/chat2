# docs/deploy_02_database_ops.md

> Sprint: **S6 — Beta Deploy & Internal Pilot**  
> Task: **S6-A — Database operations (pgvector, migrations, backups, safety)**  
> Audience: High school student (plain English, copy–paste steps)  
> Estimated time: **30–45 minutes**  
> Outcome: Postgres 16 ready for AI search with **pgvector**, baseline migrations applied, health checks in place, and backups configured per policy.

---

## What
Get your database production‑ready: create the **app database**, enable **pgvector**, run your migrations, sanity‑check performance, and align with the backup rules in `configs/backup/backup.rules.json`.

## Why
- **Accuracy**: embeddings need **pgvector**.  
- **Safety**: backups & restores prevent data loss.  
- **Repeatability**: migrations let everyone get the same schema.

## How

### 1) Create DB & user (run from a secure admin shell)
```bash
export AWS_REGION=ap-southeast-2
export PGHOST=$(aws rds describe-db-instances --db-instance-identifier ndis-chatbot-prod --query "DBInstances[0].Endpoint.Address" --output text)
export PGPASSWORD='' ; read -s -p "RDS admin password: " PGPASSWORD; echo
createdb -h "$PGHOST" -U admin ndis_chatbot
psql -h "$PGHOST" -U admin -d ndis_chatbot -v ON_ERROR_STOP=1 -c "CREATE USER app_user WITH PASSWORD '$(python - <<'PY'\nimport secrets,string;print(''.join(secrets.choice(string.ascii_letters+string.digits) for _ in range(32))) )\nPY';"
psql -h "$PGHOST" -U admin -d ndis_chatbot -v ON_ERROR_STOP=1 -c "GRANT CONNECT ON DATABASE ndis_chatbot TO app_user;"
psql -h "$PGHOST" -U admin -d ndis_chatbot -v ON_ERROR_STOP=1 -c "GRANT USAGE ON SCHEMA public TO app_user;"
unset PGPASSWORD
```

### 2) Enable **pgvector**
```bash
read -s -p "RDS admin password: " PGPASSWORD; echo
psql -h "$PGHOST" -U admin -d ndis_chatbot -v ON_ERROR_STOP=1 -c "CREATE EXTENSION IF NOT EXISTS vector;"
unset PGPASSWORD
```
Check it:
```bash
read -s -p "RDS admin password: " PGPASSWORD; echo
psql -h "$PGHOST" -U admin -d ndis_chatbot -c "SELECT extname, extversion FROM pg_extension WHERE extname='vector';"
unset PGPASSWORD
```
**Expected output:** a row with `vector` and the installed version.

### 3) Prepare the app connection string (store in SSM)
```bash
read -s -p "Enter app_user password (from step 1): " APPPWD; echo
export DATABASE_URL_APP="postgres://app_user:${APPPWD}@${PGHOST}:5432/ndis_chatbot?sslmode=require"
aws ssm put-parameter --name "/ndis-chatbot/prod/DATABASE_URL" --type "SecureString" --value "$DATABASE_URL_APP" --overwrite --region $AWS_REGION
unset APPPWD DATABASE_URL_APP
```

### 4) Run migrations
If you use **Prisma**, run:
```bash
npx prisma migrate deploy
```
If you use raw SQL, keep a folder like `db/migrations/*.sql` and run:
```bash
for f in db/migrations/*.sql; do
  echo "Applying $f"
  read -s -p "RDS admin password: " PGPASSWORD; echo
  psql -h "$PGHOST" -U admin -d ndis_chatbot -v ON_ERROR_STOP=1 -f "$f"
  unset PGPASSWORD
done
```

### 5) Baseline indexes for embeddings (example: 1536‑dim)
```bash
read -s -p "RDS admin password: " PGPASSWORD; echo
psql -h "$PGHOST" -U admin -d ndis_chatbot -v ON_ERROR_STOP=1 <<'SQL'
-- Example table+index; adapt to your schema names:
CREATE TABLE IF NOT EXISTS embeddings (
  id uuid PRIMARY KEY,
  doc_id text NOT NULL,
  chunk_idx int NOT NULL,
  embedding vector(1536) NOT NULL
);
CREATE INDEX IF NOT EXISTS embeddings_ivfflat ON embeddings
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
ANALYZE embeddings;
SQL
unset PGPASSWORD
```

### 6) Backups per policy
Our rules live in `configs/backup/backup.rules.json`. Apply the easy parts now:
- **RDS automated backups** are already enabled (7 days from step 4 of the previous doc).  
- Set a preferred backup window (Sydney night):
```bash
aws rds modify-db-instance   --db-instance-identifier ndis-chatbot-prod   --preferred-backup-window 15:30-16:00   --apply-immediately --region $AWS_REGION
```
- Logical dumps (nightly) will be wired by CI/ops later, honoring the JSON schedule.

---

## Verify
- **Extension installed:** vector listed by `SELECT extname FROM pg_extension`.  
- **Migration success:** your tables exist (`\dt` in `psql`).  
- **Index present:** `\d+ embeddings` shows `ivfflat` index.  
- **Backups:** `aws rds describe-db-instances ... --query "DBInstances[0].PreferredBackupWindow"` shows your window.

## Troubleshoot
1) **Permission denied** → confirm you connected as `admin` for DDL tasks; `app_user` has limited rights.  
2) **pgvector not found** → ensure Postgres **16.x**; RDS parameter group should be `default.postgres16` or compatible.  
3) **Migrations out-of-order** → always run `migrate deploy` on prod; never `migrate dev`.  
4) **Slow similarity search** → increase `lists` value, `ANALYZE`, and ensure the correct operator class (`vector_cosine_ops`).  
5) **Backups not visible** → check retention days and window; confirm instance status is `available` after modify.

## Acceptance Criteria
- [ ] `ndis_chatbot` database exists with `app_user` created  
- [ ] `pgvector` installed and verified  
- [ ] Schema migrated without errors; embedding index present  
- [ ] Backup window configured; retention >= 7 days  
- [ ] Secrets stored in SSM; app uses app_user (not admin)
