# Razorpay Integration Blueprint for TheGolfDraw

This blueprint is tailored to your current stack:
- Backend: Node + Express + Drizzle + Postgres
- Frontend: React + Vite + React Query
- Existing modules: `subscriptions`, `donations`, `dashboard`, `winners`

## 1) Integration Goals

1. Replace manual subscription activation with Razorpay-backed billing.
2. Record one-time and recurring payment events from webhooks as source of truth.
3. Keep current business logic (charity contribution + draw eligibility) but trigger it on verified captures.
4. Add payout/disbursement readiness for winner and charity settlements.

## 2) Environment Variables

Add these in backend `.env` (test keys first):

- `RAZORPAY_KEY_ID=`
- `RAZORPAY_KEY_SECRET=`
- `RAZORPAY_WEBHOOK_SECRET=`
- `RAZORPAY_API_BASE=https://api.razorpay.com` (optional)

Frontend `.env`:

- `VITE_RAZORPAY_KEY_ID=`

## 3) Data Model Changes (Drizzle)

Your current `subscriptions` and `donations` tables can stay, but add payment tracking tables for correctness and audits.

### 3.1 New enum values

- Extend `subscription_status` with:
  - `PENDING`
  - `PAST_DUE`

- Extend `donation_source` with:
  - `RAZORPAY_ONE_TIME`
  - `RAZORPAY_SUBSCRIPTION`

### 3.2 New table: `payment_orders`

Purpose: track checkout orders created before user pays.

Columns:
- `id` text PK (internal UUID)
- `user_id` text nullable FK users
- `purpose` text not null (`SUBSCRIPTION`, `DONATION`, `TOPUP`)
- `subscription_plan` text nullable (`MONTHLY`, `YEARLY`)
- `charity_id` text nullable FK charities
- `amount_cents` integer not null
- `currency` text not null default `INR`
- `razorpay_order_id` text unique not null
- `status` text not null default `CREATED`
- `meta` jsonb nullable
- `created_at`, `updated_at`

### 3.3 New table: `payment_transactions`

Purpose: store each verified payment attempt/capture.

Columns:
- `id` text PK (internal UUID)
- `order_id` text nullable FK payment_orders
- `user_id` text nullable FK users
- `subscription_id` text nullable FK subscriptions
- `donation_id` text nullable FK donations
- `provider` text not null default `RAZORPAY`
- `provider_payment_id` text unique not null
- `provider_order_id` text nullable
- `provider_signature` text nullable
- `amount_cents` integer not null
- `currency` text not null default `INR`
- `status` text not null (`AUTHORIZED`, `CAPTURED`, `FAILED`, `REFUNDED`)
- `failure_reason` text nullable
- `captured_at` timestamp nullable
- `raw_payload` jsonb nullable
- `created_at`, `updated_at`

### 3.4 New table: `payment_webhook_events`

Purpose: idempotency + audit trail.

Columns:
- `id` text PK (internal UUID)
- `provider` text not null default `RAZORPAY`
- `event_id` text not null unique
- `event_type` text not null
- `signature` text not null
- `payload` jsonb not null
- `received_at` timestamp not null default now
- `processed_at` timestamp nullable
- `status` text not null default `RECEIVED` (`RECEIVED`, `PROCESSED`, `IGNORED`, `FAILED`)
- `error_message` text nullable

### 3.5 Subscription table additions

Add to `subscriptions`:
- `razorpay_subscription_id` text unique nullable
- `razorpay_customer_id` text nullable
- `payment_method` text nullable
- `last_charged_at` timestamp nullable
- `next_charge_at` timestamp nullable

## 4) Backend API Blueprint

## 4.1 New route group: `/api/payments`

1. `POST /api/payments/orders`
- Auth: optional/required by purpose
- Input:
  - `purpose`: `SUBSCRIPTION | DONATION`
  - `plan` for subscriptions
  - `charityId` + `amountCents` for donations
- Action:
  - Validate amount/plan
  - Create Razorpay Order
  - Persist `payment_orders`
- Output:
  - `orderId` (internal)
  - `razorpayOrderId`
  - `amountCents`, `currency`
  - `keyId` (public)

2. `POST /api/payments/verify`
- Auth: optional/required by purpose
- Input:
  - `razorpay_order_id`
  - `razorpay_payment_id`
  - `razorpay_signature`
  - `orderId` (internal)
- Action:
  - Verify signature with `RAZORPAY_KEY_SECRET`
  - Upsert `payment_transactions`
  - Mark order `PAID`
  - Trigger donation/subscription business update (or defer to webhook)
- Output:
  - `success`, normalized transaction summary

3. `POST /api/payments/webhooks/razorpay`
- Auth: none, signature-only
- Action:
  - Validate webhook signature using raw request body
  - Deduplicate by `event_id`
  - Store event in `payment_webhook_events`
  - Process event by type
- Return `200` quickly

## 4.2 Event handling map

Handle at minimum:
- `payment.captured`
  - mark transaction CAPTURED
  - if one-time donation order, create donation row
- `payment.failed`
  - mark transaction FAILED
- `subscription.charged`
  - mark subscription ACTIVE
  - update `last_charged_at`, `next_charge_at`
  - create `donations` row using user contribution percent
- `subscription.cancelled`
  - mark subscription CANCELED
- `subscription.halted` or similar
  - mark subscription PAST_DUE/LAPSED

## 4.3 Idempotency policy

Every payment effect must be idempotent:
- Unique keys:
  - transaction by `provider_payment_id`
  - webhook by `event_id`
  - donation generation key: `(subscription_id + billing_cycle_date)`
- If duplicate event arrives, return 200 and skip side effects.

## 5) Backend File Plan

Create:
- `src/controllers/payment.controller.js`
- `src/routes/payment.routes.js`
- `src/services/razorpay.service.js`
- `src/services/payment-processor.service.js`
- `src/utils/signature.js`

Update:
- `src/app.js`
  - mount `app.use('/api/payments', paymentRoutes)`
- `src/db/schema.js`
  - add new tables/columns/enums
- `src/controllers/subscription.controller.js`
  - split current manual activate flow from Razorpay flow

Important: webhook route must use raw body parser before `express.json()` for signature verification.

Example pattern:
- global JSON for normal routes
- dedicated webhook route with `express.raw({ type: 'application/json' })`

## 6) Frontend Flow Blueprint

## 6.1 Update API client (`frontend/src/lib/requests.ts`)

Add:
- `paymentApi.createOrder(payload)`
- `paymentApi.verify(payload)`

## 6.2 Subscription purchase flow (Pricing page)

1. User clicks monthly/yearly.
2. Call `POST /api/payments/orders` with `purpose: SUBSCRIPTION`, `plan`.
3. Open Razorpay Checkout with returned `razorpayOrderId` and `VITE_RAZORPAY_KEY_ID`.
4. On handler success, call `POST /api/payments/verify`.
5. Invalidate queries:
- `['dashboard', 'me']`
- `['subscriptions', 'me']`

## 6.3 One-time donation flow

1. User enters amount + charity.
2. Create order with `purpose: DONATION`.
3. Open checkout and verify.
4. Invalidate:
- `['dashboard', 'me']`
- donation list query

## 6.4 Failure and cancel handling

- Checkout dismissed: show non-error toast.
- Verification failed: show retry CTA and keep order for reconciliation.
- Payment pending: display pending status until webhook confirms.

## 7) Security Checklist

1. Verify all signatures server-side.
2. Never accept amount from frontend during verification; read from stored internal order.
3. Keep webhook fast and non-blocking.
4. Record raw payload for disputes.
5. Add rate-limit on payment create/verify endpoints.
6. Restrict CORS and do not expose `RAZORPAY_KEY_SECRET` in frontend.

## 8) Rollout Plan

1. Test mode only:
- create order
- complete checkout
- verify signature
- webhook receive
- dashboard reflects active subscription

2. Simulate failures:
- invalid signature
- duplicate webhooks
- repeated verify calls

3. Production switch:
- rotate to live keys
- monitor event failures
- add alerts for webhook `FAILED`

## 9) Minimal Acceptance Criteria

1. A successful subscription checkout sets subscription to ACTIVE.
2. A successful monthly charge creates a donation row.
3. Duplicate webhook does not create duplicate donation/transaction.
4. Dashboard reflects latest subscription and donation totals within one refresh.
5. Admin can trace payment from order -> transaction -> subscription/donation.

## 10) Notes for your current codebase

- You currently activate subscriptions directly via `POST /api/subscriptions/activate`.
- Keep that route for admin/testing fallback, but move customer-facing payment to Razorpay order/verify flow.
- Keep all draw eligibility logic dependent on subscription status and score count as-is.

---

If you want, next step I can implement phase 1 directly in code:
1. Razorpay service + payment routes.
2. Order creation + signature verification.
3. Frontend Pricing page checkout wiring.
4. Query invalidation for dashboard updates.
