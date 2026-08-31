# Westos Platform - Complete Implementation Plan

## Executive Summary

This document outlines the complete implementation plan for the Westos D2C E-Commerce Platform, organized by the 11 phases defined in the roadmap. We'll address Phase 1 and 2 gaps first, then provide detailed plans for all subsequent phases.

---

## Phase 0: Decisions & Architecture Lock ✅ (Documented in README)

**Status**: Complete - All 7 decisions documented in README.md lines 174-185

**Missing**: Documentation files referenced in README don't exist as actual files:
- `docs/WESTOS_MASTER_SPECIFICATION.md`
- `docs/WESTOS_MODULE_MAP.md` 
- `docs/WESTOS_IMPLEMENTATION_ROADMAP.md`
- `docs/WESTOS_OPEN_DECISIONS.md`
- `docs/WESTOS_ARCHITECTURE_DECISIONS.md`
- `docs/WESTOS_PHASE_0_DECISION_BRIEF.md`

**Action**: Create these 6 documentation files from README content.

---

## Phase 1: Foundation (Infra, DB, CI/CD) - 2-3 weeks

### Current State ✅
- [x] Docker Compose (PostgreSQL, Redis, Flyway)
- [x] PostgreSQL 15 with 9 migrations (v1-v8)
- [x] Redis 7
- [x] Flyway migrations (9 SQL files)
- [x] Environment variables (.env files)
- [x] Kubernetes manifests (Kustomize structure)
- [x] Terraform (main.tf, outputs.tf, variables.tf)

### Missing - CRITICAL ❌

| # | Component | Priority | Effort | Dependencies |
|---|-----------|----------|--------|--------------|
| 1.1 | **GitHub Actions CI/CD** | 🔴 Critical | 2 days | None |
| 1.2 | **ArgoCD GitOps Config** | 🔴 Critical | 1 day | K8s manifests |
| 1.3 | **API Gateway (Kong)** | 🔴 Critical | 2 days | Docker/K8s |
| 1.4 | **Monitoring Stack** | 🔴 Critical | 3 days | Docker/K8s |
| 1.5 | **Object Store (S3/GCS)** | 🟠 High | 1 day | AWS/GCP account |
| 1.6 | **CDN Configuration** | 🟠 High | 1 day | CloudFront/Cloudflare |
| 1.7 | **Background Workers (BullMQ)** | 🟠 High | 2 days | Redis |
| 1.8 | **Secrets Management** | 🔴 Critical | 1 day | K8s/Vault |

---

## Phase 1 Detailed Implementation Plan

### 1.1 GitHub Actions CI/CD Pipeline (2 days)
```yaml
# .github/workflows/ci.yml
- Lint & TypeCheck (backend + frontend + packages)
- Unit Tests
- Integration Tests (with testcontainers)
- Build Docker images
- Push to GHCR/ECR
- Deploy to staging (on merge to develop)
- Deploy to production (on tag)
```

### 1.2 ArgoCD GitOps (1 day)
```
infrastructure/argocd/
├── applications/
│   ├── backend.yaml
│   ├── frontend.yaml
│   ├── postgres.yaml
│   ├── redis.yaml
│   └── monitoring.yaml
└── projects/
    └── westos.yaml
```

### 1.3 API Gateway - Kong (2 days)
```yaml
# docker-compose.yml addition
kong:
  image: kong:3.4
  environment:
    KONG_DATABASE: "off"
    KONG_DECLARATIVE_CONFIG: /kong/kong.yml
  volumes:
    - ./kong.yml:/kong/kong.yml
```
Kong config: Routes, Rate limiting, JWT validation, CORS, Request ID, TLS termination

### 1.4 Monitoring Stack (3 days)
```yaml
# docker-compose.monitoring.yml
prometheus:
  image: prom/prometheus:v2.47
grafana:
  image: grafana/grafana:10.1
loki:
  image: grafana/loki:2.9
jaeger:
  image: jaegertracing/all-in-one:1.48
promtail:
  image: grafana/promtail:2.9
```
- Dashboards: API latency, error rates, DB connections, Redis memory, Queue depth
- Alerts: High error rate, latency > 500ms, disk space, memory

---

## Phase 2 Detailed Implementation Plan

### 2.1 2FA/TOTP Implementation (2 days)
```typescript
// apps/backend/src/modules/auth/
├── services/
│   ├── totp.service.ts          // Generate/verify TOTP
│   └── backup-codes.service.ts  // Generate/validate backup codes
├── controllers/
│   └── 2fa.controller.ts        // Enable/disable/verify endpoints
├── entities/
│   └── user-2fa.entity.ts       // Store secret, backup codes
└── dto/
    └── 2fa.dto.ts               // Enable2faDto, Disable2faDto, Verify2faDto

// Dependencies: otplib, qrcode
npm install otplib qrcode @types/qrcode
```

### 2.2 Social Login (2 days)
```typescript
// Add to auth.module.ts
import { GoogleStrategy } from './strategies/google.strategy';
import { AppleStrategy } from './strategies/apple.strategy';

// New files:
- strategies/google.strategy.ts (passport-google-oauth20)
- strategies/apple.strategy.ts (passport-apple)
- services/social-auth.service.ts
- dto/social-login.dto.ts

// Frontend: Add "Continue with Google/Apple" buttons
```

### 2.3 Admin RBAC Module (3 days)
```typescript
// apps/backend/src/modules/admin/
├── admin.module.ts
├── auth/
│   ├── admin-auth.controller.ts
│   ├── admin-auth.service.ts
│   ├── admin-jwt.strategy.ts
│   ├── guards/admin-jwt.guard.ts
│   └── guards/roles.guard.ts
├── rbac/
│   ├── roles.controller.ts
│   ├── roles.service.ts
│   ├── permissions.controller.ts
│   └── permissions.service.ts
├── users/
│   ├── admin-users.controller.ts
│   └── admin-users.service.ts
└── entities/ (already exist)
    ├── admin-user.entity.ts
    ├── role.entity.ts
    ├── permission.entity.ts
    ├── admin-2fa.entity.ts
    └── admin-session.entity.ts

// Default roles: super_admin, admin, manager, support, viewer
// Permissions: CRUD per module
```

### 2.4 API Key Authentication (1 day)
```typescript
// apps/backend/src/modules/auth/
├── guards/api-key.guard.ts
├── strategies/api-key.strategy.ts
├── entities/api-key.entity.ts
└── services/api-key.service.ts

// Features: Create, list, revoke, rotate, scopes
// Header: X-API-Key or Authorization: Bearer <key>
```

### 2.5 OAuth2/OIDC Provider (3 days)
```typescript
// Using @nestjs/passport + oauth2orize or custom implementation
// Endpoints:
// - GET  /oauth/authorize
// - POST /oauth/token
// - POST /oauth/revoke
// - GET  /oauth/userinfo
// - GET  /.well-known/openid-configuration
// - GET  /oauth/jwks
```

### 2.6 Rate Limiting (1 day)
```typescript
// Option A: Kong rate limiting plugin (recommended)
// Option B: NestJS @nestjs/throttler
// Configuration per endpoint:
// - Auth: 10 req/min
// - API: 100 req/min
// - Search: 30 req/min
```

### 2.7 Email/Phone Change Flow (2 days)
```typescript
// New endpoints:
// POST /auth/email/change/request
// POST /auth/email/change/verify
// POST /auth/phone/change/request
// POST /auth/phone/change/verify

// Requires: OTP to new email/phone, confirm with current password
```

### 2.8 Device Management API (1 day)
```typescript
// GET    /customers/me/devices
// DELETE /customers/me/devices/:id
// DELETE /customers/me/devices (all except current)
---

## Phase 3-11: Future Phases - High-Level Plans

### Phase 3: Catalogue & Product Management (3-4 weeks)
**Focus**: Advanced product features, search, merchandising
- [ ] Elasticsearch/Meilisearch integration
- [ ] Advanced filtering (facets, price range, attributes)
- [ ] Product comparisons
- [ ] Product recommendations engine
- [ ] Inventory reservations (soft holds)
- [ ] Bundles/kits
- [ ] Digital products
- [ ] Pre-orders/backorders
- [ ] Size guides per product
- [ ] Product reviews & ratings

### Phase 4: Storefront Shopping Experience (3-4 weeks)
**Focus**: Complete customer-facing UI
- [ ] Product Listing Page (PLP) with filters/sort/pagination
- [ ] Product Detail Page (PDP) with gallery, variants, size guide
- [ ] Category landing pages
- [ ] Search results page
- [ ] Homepage sections (hero, featured, new arrivals, brands)
- [ ] Design System completion (50+ components)
- [ ] Three.js/R3F product viewer (360° view)
- [ ] PWA support (offline, install prompt)
- [ ] Accessibility (WCAG 2.1 AA)

### Phase 5: Cart & Checkout (2-3 weeks)
**Focus**: Conversion-optimized checkout
- [ ] Guest cart (localStorage + merge on login)
- [ ] Checkout flow: Address → Shipping → Payment → Review
- [ ] Coupon/discount engine (stacking rules, priority matrix)
- [ ] Pricing engine (tiered, volume, customer-group)
- [ ] Gift cards
- [ ] Saved payment methods
- [ ] One-click reorder
- [ ] Abandoned cart recovery (email + push)

### Phase 6: Orders, Payments & Inventory (3-4 weeks)
**Focus**: Transaction processing & fulfillment
- [ ] Order management (state machine)
- [ ] Razorpay integration (UPI, Cards, NetBanking, Wallets)
- [ ] Payment webhooks handling
- [ ] Refunds (full/partial, auto/approval)
- [ ] Inventory allocation (FIFO/FEFO)
- [ ] Purchase orders (supplier management)
- [ ] Stock transfers (warehouse to warehouse)
- [ ] Low stock alerts
- [ ] Inventory reservations (checkout hold)
- [ ] Invoice generation (PDF, GST compliant)

### Phase 7: Shipping & Returns (3-4 weeks)
**Focus**: Post-purchase experience
- [ ] Delhivery integration (create shipment, track, cancel)
- [ ] Multi-courier support (Delhivery, BlueDart, Ecom Express)
- [ ] Shipping rules (zone, weight, value, speed)
- [ ] Manifest generation & pickup scheduling
- [ ] Returns portal (self-service)
- [ ] RMA workflow (inspection, restock, refund)
- [ ] Exchange flow
- [ ] Return reasons analytics
- [ ] Carrier webhooks

### Phase 8: Admin Operations (2-3 weeks)
**Focus**: Operational efficiency
- [ ] Admin dashboard (React Admin / Refine)
- [ ] Order management UI
- [ ] Product management UI (bulk actions)
- [ ] Customer management UI
- [ ] Inventory management UI
- [ ] Coupon/discount management UI
- [ ] Content management (CMS) - banners, pages, blocks
- [ ] Reports & exports (CSV, PDF)
- [ ] Role-based access control UI

### Phase 9: Notifications, Analytics & Marketing (2-3 weeks)
**Focus**: Engagement & insights
- [ ] Email templates (MJML/React Email)
- [ ] SMS/WhatsApp templates
- [ ] Push notifications (Firebase)
- [ ] In-app notifications
- [ ] Event tracking (Segment/GA4 compatible)
- [ ] Funnel analytics
- [ ] Cohort analysis
- [ ] Marketing automation (abandoned cart, welcome, win-back)
- [ ] A/B testing framework
- [ ] Referral program

### Phase 10: Hardening, Testing & Production (3-4 weeks)
**Focus**: Production readiness
- [ ] Load testing (k6 - 10k RPS target)
- [ ] Chaos engineering (Litmus/Gremlin)
- [ ] Security audit (OWASP, dependency scan)
- [ ] Penetration testing
- [ ] Disaster recovery drill
- [ ] Runbook documentation
- [ ] On-call rotation setup
- [ ] SLA/SLO definitions
- [ ] Error budgeting
- [ ] Blue-green deployment

---

## Implementation Approach & Best Practices

### 1. Development Workflow
```
Feature Branch → PR → CI Checks → Code Review → Merge to develop
                                                              ↓
                              Staging Deploy (ArgoCD) ← Auto-deploy
                                                              ↓
                              Production Deploy (Tag) ← Manual approve
```

### 2. Code Quality Gates
```yaml
# Required for every PR:
- TypeScript strict mode: PASS
- ESLint: PASS (0 errors, 0 warnings)
- Prettier: PASS
- Unit tests: >80% coverage
- Integration tests: PASS
- Build: PASS (Docker)
- Security scan: PASS (npm audit, Snyk)
```

### 3. Database Migration Strategy
- All schema changes via Flyway migrations (versioned)
- No `synchronize: true` in production
- Backward-compatible migrations (add columns, not remove)
- Rollback scripts for each migration

### 4. API Versioning
- URL versioning: `/api/v1/`, `/api/v2/`
- Deprecation policy: 6 months notice
- OpenAPI/Swagger for each version

### 5. Testing Strategy
```
Unit Tests (70%): Services, utilities, pure functions
Integration Tests (20%): Controllers, database, external APIs
E2E Tests (10%): Critical user flows (Cypress/Playwright)
Contract Tests: Provider-consumer (Pact)
```

### 6. Documentation as Code
- Architecture Decision Records (ADRs) in `docs/architecture/`
- API docs auto-generated from code (Swagger)
- Runbook for each service in `docs/runbooks/`
- Onboarding guide in `docs/onboarding/`

---

## GitHub Repository Setup

### Repository: `westos-vs-code` (or `westos-platform`)

```bash
# Create repo on GitHub first, then:
cd F:\westos-platform
git remote add origin https://github.com/<username>/westos-vs-code.git
git branch -M main
git add .
git commit -m "feat: initial commit - Westos platform foundation

- NestJS backend with 7 core modules
- Next.js 14 frontend with App Router
- Shared packages (types, UI, config)
- PostgreSQL + Flyway migrations (9 versions)
- Docker Compose + Kubernetes + Terraform
- JWT auth, cart, products, inventory, orders
- Health checks, Swagger docs"

git push -u origin main
```

### Branch Protection Rules
```yaml
# main branch:
- Require PR reviews: 2
- Require status checks: CI build, tests, lint
- Require linear history
- Include administrators
- Allow force pushes: NO

# develop branch:
- Require PR reviews: 1
- Require status checks: CI build, tests
```

### Repository Structure
```
westos-platform/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── cd-staging.yml
│   │   ├── cd-production.yml
│   │   └── dependabot.yml
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── apps/
│   ├── backend/
│   └── frontend/
├── packages/
│   ├── shared/
│   ├── ui/
│   └── config/
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   ├── terraform/
│   └── argocd/
├── docs/
│   ├── architecture/
│   ├── runbooks/
│   └── onboarding/
├── IMPLEMENTATION_PLAN.md
├── README.md
├── docker-compose.yml
├── docker-compose.monitoring.yml
├── docker-compose.override.yml.example
├── .env.example
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── tsconfig.base.json
└── package.json (root workspace)
```

---

## Phase 1 & 2 Sprint Plan (4 weeks)

### Sprint 1 (Week 1): CI/CD & Infrastructure
- Day 1-2: GitHub Actions CI pipeline
- Day 3: ArgoCD setup
- Day 4: Kong API Gateway
- Day 5: Monitoring stack (Prometheus, Grafana, Loki, Jaeger)

### Sprint 2 (Week 2): Infrastructure Completion
- Day 1-2: Object Store (S3) + CDN
- Day 3-4: BullMQ Workers (email, SMS, order processing)
- Day 5: Secrets Management + Security hardening

### Sprint 3 (Week 3): Auth Enhancements
- Day 1-2: 2FA/TOTP implementation
- Day 3-4: Social Login (Google, Apple)
- Day 5: Admin RBAC Module (core)

### Sprint 4 (Week 4): Auth Completion
- Day 1: API Key Authentication
- Day 2: OAuth2/OIDC Provider
- Day 3: Rate Limiting + Email/Phone Change
- Day 4: Device Management + Session Invalidation
- Day 5: Audit Logging + Documentation

---

## Memory Note for Future Sessions

**Project**: Westos D2C E-Commerce Platform
**Repo**: `westos-vs-code` on GitHub
**Current State**: Backend running on :3001, Frontend on :3000, DB seeded with 3 products
**Next Steps**: 
1. Create GitHub repo and push
2. Implement Phase 1 CI/CD + Monitoring
3. Implement Phase 2 Auth enhancements (2FA, Social, Admin RBAC)
4. Create missing documentation files

**Key Files to Reference**:
- `IMPLEMENTATION_PLAN.md` - This file
- `BACKEND_READY.md` - Backend status
- `README.md` - Architecture & decisions
- `PROJECT_ISSUES_UPDATED.md` - Known issues

**Running Services**:
- Backend: `cd apps/backend && npm run start:dev` (port 3001)
- Frontend: `cd apps/frontend && npm run dev` (port 3000)
- DB: Docker (postgres:5432, redis:6379)
- API Docs: http://localhost:3001/docs

