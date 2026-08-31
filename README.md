# Westos D2C E-Commerce Platform

A modular monolith e-commerce platform built with Next.js, NestJS, and PostgreSQL.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      EXTERNAL LAYER                          │
│  CDN (CloudFront/Cloudflare) + WAF                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      API GATEWAY (Kong)                      │
│  TLS, Rate Limiting, Routing, Request ID, Auth Preprocessing,│
│  CORS, Basic Security                                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    NEXT.JS FRONTEND                          │
│  App Router, TypeScript, Server/Client Components,           │
│  React Query, Three.js/R3F, Design System                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   NESTJS MODULAR MONOLITH                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  auth  │ customers │ catalogue │ products │ inventory  │  │
│  │ pricing│ discounts │ coupons   │ cart     │ checkout    │  │
│  │ orders │ payments  │ shipping  │ returns  │ refunds     │  │
│  │ reviews│ wishlist  │ cms       │ marketing│ notifications│  │
│  │ analytics│ admin   │ serialization│ buyback              │  │
│  └────────────────────────────────────────────────────────┘  │
│  Adapter Layer: Payment / Courier / Notification             │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  PostgreSQL   │  │     Redis     │  │  Object Store │
│  (Primary +   │  │ (Cache,       │  │   (S3/GCS)    │
│   Replicas)   │  │  Sessions,    │  │  + CDN        │
│               │  │  Queue)       │  │               │
└───────────────┘  └───────────────┘  └───────────────┘
                           │
                    ┌──────┴──────┐
                    │ Background  │
                    │  Workers    │
                    │  (BullMQ)   │
                    └─────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router), TypeScript, React 18, Tailwind CSS, Three.js/R3F |
| Backend | NestJS 10, TypeScript, PostgreSQL 15, Redis 7, BullMQ |
| Infrastructure | Docker, Kubernetes (EKS), Terraform, ArgoCD |
| Observability | Loki, Prometheus, Grafana, Jaeger, Sentry |
| CI/CD | GitHub Actions, ArgoCD (GitOps) |

## Project Structure

```
## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Local Development

1. **Start infrastructure:**
   ```bash
   cd infrastructure/docker
   docker-compose up -d
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp apps/frontend/.env.example apps/frontend/.env.local
   cp apps/backend/.env.example apps/backend/.env
   ```

4. **Run database migrations:**
   ```bash
   npm run db:migrate --workspace=apps/backend
   ```

5. **Start development servers:**
   ```bash
   # Terminal 1 - Frontend
   npm run dev:frontend

   # Terminal 2 - Backend
   npm run dev:backend
   ```

### Available Scripts

```bash
# Development
npm run dev:frontend     # Start Next.js dev server
npm run dev:backend      # Start NestJS dev server

# Building
npm run build            # Build all workspaces
npm run build:frontend   # Build frontend only
npm run build:backend    # Build backend only

# Code Quality
npm run lint             # Lint all workspaces
npm run type-check       # TypeScript check all workspaces

# Database
npm run db:migrate       # Run Flyway migrations
npm run db:seed          # Seed database

# Testing
npm run test             # Run all tests
npm run test:cov         # Run tests with coverage
```

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CDN_URL=http://localhost:3000
NEXT_PUBLIC_RAZORPAY_KEY_ID=
NEXT_PUBLIC_SENTRY_DSN=
```

### Backend (.env)
```env
## Deployment

### Docker Compose (Development)
```bash
cd infrastructure/docker
docker-compose up -d
```

### Kubernetes (Production)
```bash
# Apply base manifests
kubectl apply -k infrastructure/kubernetes/overlays/prod

# Or use ArgoCD for GitOps
argocd app create westos-prod \
  --repo https://github.com/your-org/westos-platform \
  --path infrastructure/kubernetes/overlays/prod \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace westos
```

### Terraform (Infrastructure)
```bash
cd infrastructure/terraform
terraform init
terraform plan -var="environment=prod"
terraform apply -var="environment=prod"
```

## Phase 0 Decisions (Confirmed)

| Decision | Choice |
|----------|--------|
| Payment Gateway | Razorpay |
| Courier Provider | Delhivery |
| Email/SMS/WhatsApp | Twilio + Gupshup |
| Discount Priority | Configurable Matrix |
| GST/Tax | Tax-inclusive + per-category HSN |
| Database DDL | DBA creates from ERD (Flyway) |
| Search Engine | PostgreSQL full-text → Meilisearch later |

## Documentation

- [Master Specification](docs/WESTOS_MASTER_SPECIFICATION.md) - All requirements
- [Module Map](docs/WESTOS_MODULE_MAP.md) - 22 modules with responsibilities
- [Implementation Roadmap](docs/WESTOS_IMPLEMENTATION_ROADMAP.md) - 11 phases
- [Open Decisions](docs/WESTOS_OPEN_DECISIONS.md) - 25 decisions needed
- [Architecture Decisions](docs/WESTOS_ARCHITECTURE_DECISIONS.md) - 22 decisions
- [Phase 0 Brief](docs/WESTOS_PHASE_0_DECISION_BRIEF.md) - Validation & approval

## Implementation Phases

| Phase | Duration | Focus |
|-------|----------|-------|
| 0 | 1-2 weeks | Decisions & Architecture Lock |
| 1 | 2-3 weeks | Foundation (Infra, DB, CI/CD) |
| 2 | 2-3 weeks | Identity & Authorization |
| 3 | 3-4 weeks | Catalogue & Product Management |
| 4 | 3-4 weeks | Storefront Shopping Experience |
| 5 | 2-3 weeks | Cart & Checkout |
| 6 | 3-4 weeks | Orders, Payments & Inventory |
| 7 | 3-4 weeks | Shipping & Returns |
| 8 | 2-3 weeks | Admin Operations |
| 9 | 2-3 weeks | Notifications, Analytics & Marketing |
| 10 | 3-4 weeks | Hardening, Testing & Production |
| 11 | 3-4 weeks | Jeans Buyback (Phase 2) |

## License

Proprietary - Westos Platform
NODE_ENV=development
PORT=3001
API_PREFIX=api
FRONTEND_URL=http://localhost:3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=westos
DATABASE_PASSWORD=westos_dev_password
DATABASE_NAME=westos_dev
DATABASE_SYNCHRONIZE=true
DATABASE_LOGGING=true

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
ADMIN_JWT_SECRET=your-admin-jwt-secret-change-in-production

RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxx

SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@westos.com

TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_PHONE_NUMBER=+1xxxx

DELHIVERY_API_KEY=xxxx
DELHIVERY_WEBHOOK_SECRET=xxxx
```
westos-platform/
├── apps/
│   ├── frontend/          # Next.js 14+ App Router
│   └── backend/           # NestJS Modular Monolith
├── packages/
│   ├── shared/            # Shared types, constants, utilities
│   ├── ui/                # Design System components
│   └── config/            # Shared configuration
├── infrastructure/
│   ├── docker/            # Dockerfiles & docker-compose
│   ├── kubernetes/        # K8s manifests (Kustomize)
│   ├── terraform/         # AWS Infrastructure (Terraform)
│   └── scripts/           # Deployment & utility scripts
└── docs/
    ├── architecture/      # Architecture Decision Records
    ├── WESTOS_MASTER_SPECIFICATION.md
    ├── WESTOS_MODULE_MAP.md
    ├── WESTOS_IMPLEMENTATION_ROADMAP.md
    ├── WESTOS_OPEN_DECISIONS.md
    ├── WESTOS_ARCHITECTURE_DECISIONS.md
    └── WESTOS_PHASE_0_DECISION_BRIEF.md
```