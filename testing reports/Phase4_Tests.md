# Phase 4 Test Report — Operations (Maintenance & Lease Expiry)

Run migration `supabase/migrations/004_maintenance_requests.sql` in Supabase SQL Editor before testing.

**Schema notes (Phase 1–2):** `tenants` uses `first_name` / `last_name`; `leases` has `landlord_id` and `lease_status`; tenant portal links via `profiles.tenant_id`.

## Step 1 — Schema & RLS

| ID | Description | Expected | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `TC-MNT-01` | Landlord A cannot SELECT landlord B maintenance via API | Empty or error | | |
| `TC-MNT-02` | Landlord creates request on own unit | Row inserted, `submitted_by_tenant_id` null | | |
| `TC-MNT-03` | Tenant without active lease INSERT | Blocked by app + RLS | | |
| `TC-MNT-04` | Tenant with active lease INSERT | Row with correct `unit_id` | | |

## Step 2 — Admin CRUD

| ID | Description | Expected | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `TC-MNT-05` | List shows landlord requests only | All portfolio requests | | |
| `TC-MNT-06` | `days_open` for open request | Correct day count | | |
| `TC-MNT-07` | Open > 7 days flag | Warning icon + red badge | | |
| `TC-MNT-08` | New form unit dropdown | Only landlord units | | |
| `TC-MNT-09` | Detail page fields | All fields + history timeline | | |
| `TC-MNT-10` | `open → in_progress` | Success | | |
| `TC-MNT-11` | `in_progress → open` | 422 / error message | | |
| `TC-MNT-12` | `→ resolved` sets `resolved_at` | Timestamp set | | |
| `TC-MNT-13` | Resolved request update blocked | Read-only UI + server error | | |
| `TC-MNT-14` | PUT `/api/maintenance/[id]` invalid transition | HTTP 422 | | |

## Step 3 — Tenant Portal

| ID | Description | Expected | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `TC-MNT-15` | Landlord visits `/tenant/maintenance` | Redirect `/unauthorized` | | |
| `TC-MNT-16` | Tenant submits description only | Success message | | |
| `TC-MNT-17` | Tenant login redirect | `/tenant/maintenance` | | |

## Step 4 — `getExpiringLeases()`

| ID | Description | Expected | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `TC-LEASE-01` | Active lease ending in 15 days | Included, `days_remaining` ≈ 15 | | |
| `TC-LEASE-02` | Lease ending in 45 days | Excluded | | |
| `TC-LEASE-03` | Lease ended yesterday | Excluded | | |
| `TC-LEASE-04` | Order by `end_date` ASC | Earliest first | | |
| `TC-LEASE-05` | Other landlord leases | Excluded | | |
