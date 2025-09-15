# docs/deploy_01_aws_kiro.md

> Sprint: **S6 — Beta Deploy & Internal Pilot**  
> Task: **S6-A — Provision AWS (Sydney) & ship a beta container with Kiro**  
> Audience: High school student (plain English, copy–paste steps)  
> Estimated time: **60–90 minutes**  
> Outcome: A minimal, production‑grade AWS stack in **ap-southeast-2** running your containerized app behind HTTPS, with configs and secrets stored safely.

---

## What
Stand up a small, safe AWS footprint for the beta: container image in **ECR**, service on **App Runner** (HTTPS, autoscaling), data in **RDS Postgres 16**, configuration in **SSM Parameter Store**, and buckets for artifacts/backups. We’ll keep everything in **Sydney (ap‑southeast‑2)** and wire it so Kiro (your IDE) can re‑deploy from config files.

## Why
- **Fast beta**: App Runner deploys a container with SSL and scaling in minutes.  
- **Separation of concerns**: app image (ECR), service (App Runner), data (RDS), config (SSM), files (S3).  
- **Safety**: no secrets in code; AWS‑managed TLS; private database.  
- **Australian data**: region pinned to **ap‑southeast‑2**.

## How

### 0) Prereqs
- AWS Account with Administrator access.  
- **AWS CLI v2**, **Docker**, **git** installed. Logged in (`aws configure`).  
- Project root contains a `Dockerfile` that runs your Next.js server on port **3000**.

Check region & identity:
```bash
aws configure get region
aws sts get-caller-identity
```
If region is not `ap-southeast-2`:
```bash
aws configure set region ap-southeast-2
```

### 1) Environment variables & helpers (shell)
```bash
export AWS_REGION=ap-southeast-2
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export APP_NAME=ndis-chatbot
export IMAGE_TAG=beta-1
```

### 2) Buckets (artifacts & backups)
```bash
aws s3api create-bucket   --bucket ${APP_NAME}-artifacts-${ACCOUNT_ID}-${AWS_REGION}   --region $AWS_REGION --create-bucket-configuration LocationConstraint=$AWS_REGION

aws s3api put-bucket-encryption   --bucket ${APP_NAME}-artifacts-${ACCOUNT_ID}-${AWS_REGION}   --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

aws s3api create-bucket   --bucket ${APP_NAME}-backups-${ACCOUNT_ID}-${AWS_REGION}   --region $AWS_REGION --create-bucket-configuration LocationConstraint=$AWS_REGION

aws s3api put-bucket-encryption   --bucket ${APP_NAME}-backups-${ACCOUNT_ID}-${AWS_REGION}   --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
```
**Expected output:** each command prints a JSON describing the bucket or returns `None` on success.

### 3) ECR repo, build & push image
```bash
aws ecr create-repository --repository-name ${APP_NAME}   --image-scanning-configuration scanOnPush=true --region $AWS_REGION

aws ecr get-login-password --region $AWS_REGION   | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

docker build -t ${APP_NAME}:${IMAGE_TAG} .
docker tag ${APP_NAME}:${IMAGE_TAG} ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}:${IMAGE_TAG}
docker push ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}:${IMAGE_TAG}
```

### 4) RDS Postgres 16 (create & remember endpoint)
Create the database (private, Multi‑AZ, encrypted). You’ll be prompted for a strong password; it won’t echo.
```bash
read -s -p "Enter a strong RDS master password: " RDS_PWD; echo
aws rds create-db-instance   --db-instance-identifier ${APP_NAME}-prod   --engine postgres --engine-version 16.3   --db-instance-class db.t4g.medium   --allocated-storage 50 --storage-encrypted   --no-publicly-accessible --multi-az   --master-username admin --master-user-password "$RDS_PWD"   --backup-retention-period 7 --region $AWS_REGION
unset RDS_PWD
```
Wait for status `available`:
```bash
aws rds describe-db-instances --db-instance-identifier ${APP_NAME}-prod   --query "DBInstances[0].{Status:DBInstanceStatus,Endpoint:Endpoint.Address,Port:Endpoint.Port}" --output table
```
Note the **Endpoint** and **Port** (usually 5432).

### 5) Store secrets in SSM Parameter Store (SecureString)
Create a safe `DATABASE_URL` (replace YOUR_ENDPOINT with the one you noted; the command prompts securely):
```bash
read -s -p "Postgres admin password again (for DATABASE_URL): " DBPWD; echo
export PGHOST=$(aws rds describe-db-instances --db-instance-identifier ${APP_NAME}-prod --query "DBInstances[0].Endpoint.Address" --output text)
export DATABASE_URL="postgres://admin:${DBPWD}@${PGHOST}:5432/ndis_chatbot?sslmode=require"
aws ssm put-parameter --name "/${APP_NAME}/prod/DATABASE_URL" --type "SecureString" --value "$DATABASE_URL" --overwrite --region $AWS_REGION
unset DBPWD DATABASE_URL
```
(Repeat similarly for your model/API key if applicable, e.g., `/ndis-chatbot/prod/OPENAI_API_KEY`.)

### 6) App Runner service (HTTPS, autoscaling)
Create a role that lets App Runner pull from ECR:
```bash
aws iam create-service-linked-role --aws-service-name apprunner.amazonaws.com || true
```
Create the service:
```bash
aws apprunner create-service --service-name ${APP_NAME}   --source-configuration "{
    \"AuthenticationConfiguration\": {\"AccessRoleArn\": \"arn:aws:iam::${ACCOUNT_ID}:role/aws-service-role/apprunner.amazonaws.com/AWSServiceRoleForAppRunner\"},
    \"ImageRepository\": {
      \"ImageIdentifier\": \"${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}:${IMAGE_TAG}\",
      \"ImageRepositoryType\": \"ECR\",
      \"ImageConfiguration\": {
        \"Port\": \"3000\",
        \"RuntimeEnvironmentVariables\": [
          {\"Name\": \"NODE_ENV\", \"Value\": \"production\"},
          {\"Name\": \"VECTOR_BACKEND\", \"Value\": \"pgvector\"},
          {\"Name\": \"AWS_REGION\", \"Value\": \"${AWS_REGION}\"}
        ]
      }
    },
    \"AutoDeploymentsEnabled\": true
  }"   --instance-configuration Cpu=1vCPU,Memory=2GB   --region $AWS_REGION
```
**Note:** Secrets like `DATABASE_URL` are read by the app at runtime from **SSM** using the instance role (use AWS SDK v3 SSM client in your app). This keeps secrets out of env files.

### 7) Record infra as code (for Kiro)
We’ve provided `configs/deploy/infrastructure.json` in this batch. Kiro can read/validate it to show drift and remind you of manual steps. (When you adopt IaC fully, replace steps 4–6 with Terraform/CDK, but this is enough for beta.)

---

## Verify
- **Service URL:**  
  ```bash
  aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='${APP_NAME}'].ServiceUrl" --output text
  ```
  Open the URL, expect the app to load.  
- **Health check:**  
  ```bash
  curl -sS https://$(aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='${APP_NAME}'].ServiceUrl" --output text)/api/health
  ```
  Expected: JSON like `{"ok":true}` or similar.  
- **DB reachability (from local admin)**: use the RDS endpoint with `psql` and confirm connection (you may need a VPN/bastion if your DB is private; for beta you can temporarily allow your IP in the RDS security group and then remove it).  
- **Doc guard & code checks:**
  ```bash
  python ci/doc_completeness_check.py
  npm run lint
  npm run typecheck
  ```

## Troubleshoot
1) **App Runner fails to pull image** → Ensure ECR image exists and role `AWSServiceRoleForAppRunner` exists. Re-run step 6.  
2) **DB connection errors** → Confirm `PGHOST`, port 5432, and that security groups allow egress from App Runner VPC connector or that your app uses a public‑accessible RDS during beta (not recommended long‑term).  
3) **Secrets not loaded** → Make sure your app reads from SSM at boot (AWS SDK) and the App Runner service role has `ssm:GetParameter` for `/${APP_NAME}/prod/*`.  
4) **Region mismatch** → Run `aws configure set region ap-southeast-2` and re‑deploy.  
5) **Health check 404** → Add `/api/health` route in your app returning 200.

## Acceptance Criteria
- [ ] App container is built and pushed to ECR in **ap-southeast-2**  
- [ ] App Runner service is running with HTTPS URL reachable  
- [ ] RDS Postgres 16 exists; credentials stored in SSM; no secrets in repo  
- [ ] `configs/deploy/infrastructure.json` and `configs/deploy/env.prod.json` exist and match the deployed region/stack  
- [ ] Doc guard, lint, and typecheck all pass
