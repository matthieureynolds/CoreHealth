# CoreHealth Backend

## Overview

AWS CDK (TypeScript) backend for CoreHealth. Replaces Supabase entirely.
Full serverless stack: Cognito auth, RDS Postgres, Lambda microservices, API Gateway.

---

## Monorepo structure

```
/TOTO
  /app          ← React Native + Expo (frontend)
  /backend      ← AWS CDK + Lambda functions (this folder)
  /shared       ← Shared TypeScript types (imported by both app and backend)
```

---

## Architecture

```
React Native App
      │
      ▼
API Gateway (REST)
      │
      ├── Cognito Authorizer (JWT validation on every route)
      │
      ├── /users        → Lambda: users
      ├── /biomarkers   → Lambda: biomarkers
      ├── /lab-results  → Lambda: lab-results
      └── /ai/chat      → Lambda: ai-agent
                │
                ├── RDS Proxy → RDS Postgres (eu-north-1)
                ├── S3 (documents) → CloudFront
                ├── SQS → Lambda: document-processor
                │              │
                │              ├── Textract (OCR)
                │              └── Comprehend Medical (entity extraction)
                └── Secrets Manager (OpenAI key, Google Vision key, DB credentials)
```

---

## Stacks

| Stack | File | What it provisions |
|-------|------|--------------------|
| `CoreHealth-Cognito` | `stacks/cognito-stack.ts` | User Pool, Apple + Google IdPs, mobile app client |
| `CoreHealth-Database` | `stacks/database-stack.ts` | VPC, RDS Postgres 16.3, RDS Proxy, security groups |
| `CoreHealth-Storage` | `stacks/storage-stack.ts` | S3 bucket (private, versioned), CloudFront distribution |
| `CoreHealth-Api` | `stacks/api-stack.ts` | API Gateway, all Lambda functions, SQS queue, Secrets Manager |

Deploy order: Cognito → Database → Storage → Api (enforced by `addDependency` in `bin/backend.ts`)

---

## Lambda functions

| Function | Entry | Routes | Purpose |
|----------|-------|--------|---------|
| users | `lambdas/users/index.ts` | GET/PUT `/users/{userId}` | Profile read/update |
| biomarkers | `lambdas/biomarkers/index.ts` | GET/POST/DELETE `/biomarkers` | Biomarker CRUD, auto-trend |
| lab-results | `lambdas/lab-results/index.ts` | GET/POST/DELETE `/lab-results` | Upload flow, S3 pre-signed URL |
| document-processor | `lambdas/lab-results/processor.ts` | SQS trigger | Textract OCR → Comprehend Medical → biomarker rows |
| ai-agent | `lambdas/ai-agent/index.ts` | POST `/ai/chat`, GET `/ai/history` | GPT-4o with user health context |

All Lambda functions share:
- `lambdas/_shared/db.ts` — Postgres connection via RDS Proxy (pooled, reused across warm invocations)
- `lambdas/_shared/response.ts` — `ok()`, `err()`, `forbidden()` helpers

---

## Database

**Engine:** RDS Postgres 16.3 (eu-north-1)
**Connection:** Via RDS Proxy (never connect directly from Lambda)
**Extensions:** `uuid-ossp`, `vector` (pgvector for future AI embeddings)

### Tables

| Table | Purpose |
|-------|---------|
| `users` | User profile. `id` = Cognito sub (UUID) |
| `biomarkers` | All biomarker readings. UNIQUE on `(user_id, name, recorded_at)` |
| `lab_results` | Lab report metadata + processing status |
| `medical_conditions` | Diagnosed conditions |
| `medications` | Current and past medications |
| `vaccinations` | Vaccination history |
| `device_data` | Wearable metrics (JSONB, partitioned by year) |
| `chat_messages` | Toto AI conversation history |
| `relationship_links` | Family connections (for hereditary risk) |
| `hereditary_signals` | E2EE encrypted hereditary health signals |

Migration file: `migrations/001_initial_schema.sql`
Run this manually against RDS after first deploy.

---

## Auth

**Provider:** AWS Cognito
**User Pool:** `corehealth-users` (eu-north-1)
**App client:** `corehealth-mobile` — no client secret (public mobile client), SRP auth flow
**Identity providers:** Email/password, Apple Sign-In, Google
**Tokens:** Access token 1h, ID token 1h, Refresh token 30 days
**Authorizer:** Every API Gateway route requires a valid Cognito JWT

### Auth flow
1. User signs up / logs in via Cognito in the app
2. Cognito returns JWT tokens
3. App sends `Authorization: Bearer <id_token>` on every API request
4. API Gateway validates token against Cognito before any Lambda runs
5. Lambda reads `event.requestContext.authorizer.claims.sub` as the user ID

---

## Key decisions

| Decision | What was chosen | Why |
|----------|----------------|-----|
| Vector store | pgvector (Postgres extension) | OpenSearch Serverless is $700+/month minimum. pgvector runs on the same RDS instance, free |
| AI agents | Single agent (Toto) | Multi-agent is over-engineered for v1. One well-prompted agent with user context is sufficient |
| Conversation memory | Postgres `chat_messages` table | Redis/ElastiCache adds cost and complexity with no benefit at this scale |
| AI model | OpenAI GPT-4o | Already working. Bedrock migration would cost time with no user-facing benefit |
| Async doc processing | SQS → Lambda | Textract + Comprehend Medical can take 10-30s. Never block the user waiting |
| Connection pooling | RDS Proxy | Lambda creates a new connection per invocation. Without the proxy, RDS hits connection limits fast |
| API keys | Secrets Manager | Never hardcoded. Fetched at Lambda cold start and cached in memory |
| Documents | S3 (private) + CloudFront + pre-signed URLs | Client uploads directly to S3 (bypasses Lambda for large files). CloudFront serves with OAC |
| Region | eu-north-1 | GDPR-friendly, same as original Cognito setup |
| Removal policy | `RETAIN` on all stateful resources | Prevent accidental deletion of user data during CDK updates |

---

## Secrets

All secrets live in AWS Secrets Manager. Never in source code or environment files.

| Secret name | What it is |
|-------------|-----------|
| `corehealth/db/credentials` | RDS master username + password (auto-rotated by CDK) |
| `corehealth/openai/api-key` | OpenAI API key for Toto |
| `corehealth/google/vision-api-key` | Google Cloud Vision key for lab result OCR |

After deploy, populate the OpenAI and Google Vision secrets manually:
```bash
aws secretsmanager put-secret-value \
  --secret-id corehealth/openai/api-key \
  --secret-string "sk-..."

aws secretsmanager put-secret-value \
  --secret-id corehealth/google/vision-api-key \
  --secret-string "AIza..."
```

---

## Phases

### Phase 1 — Infrastructure (current)
- [x] CDK project initialised
- [x] CognitoStack — User Pool + IdPs + mobile client
- [x] DatabaseStack — VPC + RDS Postgres + RDS Proxy
- [x] StorageStack — S3 + CloudFront
- [x] ApiStack — API Gateway + all Lambda functions + SQS + Secrets Manager
- [x] SQL schema — `migrations/001_initial_schema.sql`
- [x] Shared types — `/TOTO/shared`
- [ ] Bootstrap CDK in AWS account (`cdk bootstrap`)
- [ ] Deploy all stacks (`cdk deploy --all`)
- [ ] Run SQL migration against RDS
- [ ] Populate secrets in Secrets Manager

### Phase 2 — Auth integration
- [x] Install AWS Amplify v6 in `/app`
- [x] Replace mock `authHelpers.ts` with real Cognito calls (sign up, sign in, sign out, password reset)
- [x] Replace mock `AuthContext.tsx` session with real Cognito session
- [x] Fix email verification screens (EmailVerificationScreen, EmailSentScreen, EmailVerificationStepScreen)
- [x] Fix familyService.ts — replace supabase.auth.getUser() with Amplify getCurrentUser()
- [x] Wire Amplify configure into App.tsx (before all other imports)
- [ ] Fill in COGNITO_USER_POOL_ID + COGNITO_USER_POOL_CLIENT_ID in `amplify.ts` after CDK deploy
- [ ] Test full auth flow end-to-end (email + Apple + Google)
- [ ] Remove Supabase package from `/app` (after Phase 3 clears remaining DB calls)

### Phase 3 — Data layer
- [ ] Replace hardcoded mock biomarkers with real API calls to `/biomarkers`
- [ ] Wire lab result upload to real S3 pre-signed URL flow
- [ ] Connect Toto chat to real `/ai/chat` endpoint
- [ ] Replace mock user profile with real `/users/{id}` API
- [ ] Wire wearable device data to `device_data` table

### Phase 4 — Document processing
- [ ] Test Textract on real lab PDFs
- [ ] Validate Comprehend Medical entity extraction accuracy
- [ ] Add manual biomarker correction flow in app (for OCR errors)
- [ ] Add `processing_status` polling in app (pending → complete)

### Phase 5 — Pre-launch hardening
- [ ] Enable RDS Multi-AZ (flip `multiAz: true` in database-stack)
- [ ] Enable CloudTrail for audit logging (GDPR)
- [ ] Security audit — IAM least privilege review
- [ ] Lambda timeout + memory tuning based on real usage
- [ ] Set up CloudWatch alarms (Lambda errors, RDS CPU, SQS DLQ depth)
- [ ] Remove all remaining mock data from frontend
- [ ] App Store submission

---

## Commands

```bash
# From /TOTO/backend

# First-time setup (one per AWS account/region)
cdk bootstrap

# Preview what will be deployed
cdk diff --all

# Deploy everything
cdk deploy --all

# Deploy a single stack
cdk deploy CoreHealth-Database

# Destroy (careful — stateful resources have RETAIN policy)
cdk destroy --all
```

---

## Environment variables required before deploy

Set these in your shell or `.env` (never commit):

```bash
# Apple Sign-In (from Apple Developer portal)
APPLE_CLIENT_ID=com.corehealth.app
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_KEY_ID=XXXXXXXXXX
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Google Sign-In (from Google Cloud Console)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```
