# Phase 4 Test Report — Maintenance Requests & Lease Expiry

## F7 — Maintenance Requests: Admin

| ID | Description | Expected Result | Actual Result | Status | Notes | Resolved |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-MNT-01` | **List page loads** | `GET /maintenance` renders with table and "New Request" button. No errors. | Page rendered correctly with table and "New Request" button visible. No console errors. | **PASS** | | |
| `TC-MNT-02` | **List scoped to logged-in landlord** | Only maintenance requests for the logged-in landlord's units appear. Requests belonging to other landlords are absent. | List query filters by `unit_id IN (landlord's units)` — only own requests visible. | **PASS** | Scoping is explicit at the app level: request → unit → building → landlord_id. Does not rely solely on RLS. | |
| `TC-MNT-03` | **List columns present** | Table shows: Unit, Description (truncated), Status, Days Open, Reported date, and a View link. | All six columns present. Description truncated at 80 characters with ellipsis. | **PASS** | Hard 80-char truncation via `slice(0, 80) + '…'`. | |
| `TC-MNT-04` | **Filter by status** | Selecting "Open" in the status filter shows only open requests; "In Progress" shows only those; "Resolved" shows only resolved. | Status dropdown filters correctly via URL param; query applies `.eq('status', ...)`. | **PASS** | | |
| `TC-MNT-05` | **Filter by building** | Selecting a building from the building filter narrows the list to requests for units in that building only. | Building dropdown filters correctly; query applies `.eq('units.building_id', ...)`. | **PASS** | | |
| `TC-MNT-06` | **Filter by unit** | Selecting a specific unit from the unit filter narrows the list to requests for that unit only. | Unit dropdown filters correctly; query applies `.eq('unit_id', ...)`. | **PASS** | Unit dropdown auto-narrows when a building is selected. | |
| `TC-MNT-07` | **Stale flag — request open > 7 days** | A request that has been open for more than 7 days displays a red warning icon in the Unit column and a red-badged days-open count. | Red triangle warning icon displayed in Unit column and days-open shown as red badge for requests open > 7 days. | **PASS** | Implemented via `isOverdueOpenRequest()` computed at read time. | |
| `TC-MNT-08` | **Stale flag — request open ≤ 7 days** | A request open for 7 days or fewer shows no stale indicator. | No warning icon or red badge shown for requests within the 7-day window. | **PASS** | | |
| `TC-MNT-09` | **Stale flag — in_progress or resolved requests** | A request with status `in_progress` or `resolved` open for more than 7 days does NOT show the stale flag. | Stale check correctly limited to `status === 'open'` only. In-progress and resolved requests show no warning. | **PASS** | | |
| `TC-MNT-10` | **days_open — open request** | `days_open` equals the number of full days between `reported_at` and now. | Computed at read time via `computeDaysOpen()`. Verified value matches expected day count. | **PASS** | Not stored — computed on each render. | |
| `TC-MNT-11` | **days_open — resolved request** | `days_open` equals the number of days between `reported_at` and `resolved_at`, not the current date. | `computeDaysOpen()` uses `resolved_at` as end date when status is resolved. | **PASS** | | |
| `TC-MNT-12` | **New request form loads** | `GET /maintenance/new` renders with a unit dropdown and description textarea. | Form rendered correctly with unit select dropdown and description textarea. | **PASS** | | |
| `TC-MNT-13` | **Unit dropdown scoped to landlord** | The unit dropdown on `/maintenance/new` shows only units belonging to the logged-in landlord. | Units fetched via Supabase client; server action additionally verifies `buildings.landlord_id === user.id` before inserting. | **PASS** | | |
| `TC-MNT-14` | **New request — empty description** | Submitting the form with an empty description is blocked with a validation error. | Submission blocked by HTML5 `required` attribute; server action also validates and returns error if empty. | **PASS** | | |
| `TC-MNT-15` | **New request — success** | Submitting valid unit + description creates a request with `status = open` and `submitted_by_tenant_id = null`. Redirects to `/maintenance`. | Request created successfully with status `open`. Redirected to list page after submission. | **PASS** | | |
| `TC-MNT-16` | **Detail page — all fields displayed** | `GET /maintenance/:id` shows: description, building, unit, submitted by, reported at, resolved at (if resolved), resolution notes, status badge, days open, and history timeline. | All fields present on the detail page. Resolved At only shown when request is resolved. | **PASS** | | |
| `TC-MNT-17` | **Detail page — stale flag** | A detail page for a request open > 7 days shows a visual stale indicator. | Red warning banner displayed at the top of the detail page showing exact day count when request is open > 7 days. | **PASS** | | |
| `TC-MNT-18` | **Status transition: open → in_progress** | Changing status from `open` to `in_progress` succeeds. The badge updates. `resolved_at` is NOT set. | Status changed to In Progress successfully. Badge updated. `resolved_at` remains null. | **PASS** | | |
| `TC-MNT-19` | **Status transition: open → resolved** | Changing status from `open` to `resolved` succeeds. `resolved_at` is set to the current timestamp. Resolution notes are saved. | Status changed to Resolved. `resolved_at` set to current timestamp. Notes saved. | **PASS** | | |
| `TC-MNT-20` | **Status transition: in_progress → resolved** | Changing status from `in_progress` to `resolved` succeeds. `resolved_at` is set. | Transition succeeded. `resolved_at` set correctly. | **PASS** | | |
| `TC-MNT-21` | **Backward transition: in_progress → open** | Attempting to set status back from `in_progress` to `open` is rejected. Server returns 422. | "Open" not available in dropdown when status is `in_progress`. Programmatic attempt returns 422 with error message. | **PASS** | UI only exposes valid next statuses via state machine. Server also validates. | |
| `TC-MNT-22` | **Backward transition: resolved → any** | Attempting to update a resolved request is rejected. Server returns 422. Update form replaced with read-only message. | Form replaced with read-only panel on resolved requests. Server action returns 422 for any update attempt. | **PASS** | | |
| `TC-MNT-23` | **Resolution notes — add while open** | A landlord can type and save resolution notes on a request with `status = open`. The notes persist after saving. | Notes field available and editable on open requests. Notes persisted after save. | **PASS** | | |
| `TC-MNT-24` | **Resolution notes — add while in_progress** | A landlord can add or update resolution notes when status is `in_progress`. | Notes field available and editable on in-progress requests. Updates saved correctly. | **PASS** | | |
| `TC-MNT-25` | **Resolution notes — read-only when resolved** | On a resolved request the update form is replaced with a read-only panel showing the saved notes. | Update form hidden; read-only panel with saved notes displayed. Server blocks programmatic updates with 422. | **PASS** | | |
| `TC-MNT-26` | **Cross-landlord access — list** | Logged in as landlord B, navigating to `/maintenance` does not show landlord A's requests. | List explicitly scoped: buildings filtered by `landlord_id = user.id`, units by building, requests by unit. Landlord B sees only their own requests. | **PASS** | | |
| `TC-MNT-27` | **Cross-landlord access — detail** | Landlord B directly navigates to `/maintenance/:id` where `:id` belongs to landlord A. Receives 404. | Detail page fetches `buildings.landlord_id` and compares to `user.id`. Mismatch triggers `notFound()`. | **PASS** | Returns 404 to avoid confirming resource existence. | |
| `TC-MNT-28` | **History timeline — reported event** | The timeline always shows a "Reported" entry with the `reported_at` timestamp. | Reported entry always present as the first timeline item. | **PASS** | | |
| `TC-MNT-29` | **History timeline — in_progress event** | When status is `in_progress` or `resolved`, the timeline includes an "In Progress" entry. | In Progress entry appears in timeline when status is not `open`. | **PASS** | | |
| `TC-MNT-30` | **History timeline — resolved event** | When status is `resolved`, the timeline includes a "Resolved" entry with the `resolved_at` timestamp and resolution notes. | Resolved entry shown with correct timestamp and notes when status is resolved. | **PASS** | | |

---

## F7 — Maintenance Requests: Tenant Portal

| ID | Description | Expected Result | Actual Result | Status | Notes | Resolved |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-TEN-01` | **Landlord blocked from tenant portal** | A landlord navigating to `/tenant/maintenance` is redirected to `/unauthorized`. | Server-side layout (`tenant/layout.tsx`) checks `profile.role !== 'tenant'` and redirects to `/unauthorized`. | **PASS** | | |
| `TC-TEN-02` | **Tenant with no active lease — blocked** | A tenant account with no active lease sees an error message when attempting to submit. | Server action returns `"You do not have an active lease."` error displayed on the form. | **PASS** | | |
| `TC-TEN-03` | **Tenant with active lease — form visible** | A tenant with an active lease can see and submit the description form. | Form rendered and submission succeeded for tenant with active lease. | **PASS** | | |
| `TC-TEN-04` | **Tenant submission — unit pre-filled from lease** | The tenant does not select a unit. After submission the created request has `unit_id` equal to the unit from the tenant's active lease. | No unit picker shown. Server action looks up active lease and uses `activeLease.unit_id`. Verified in admin list. | **PASS** | | |
| `TC-TEN-05` | **Tenant submission — submitted_by_tenant_id set** | The created request has `submitted_by_tenant_id` equal to the tenant's ID. The admin detail page shows the tenant's name under "Submitted by". | `submitted_by_tenant_id` set from `profile.tenant_id`. Tenant name visible on admin detail page. | **PASS** | | |
| `TC-TEN-06` | **Tenant submission — empty description blocked** | Submitting an empty description is blocked. | Blocked by HTML5 `required` attribute and server action validation. | **PASS** | | |
| `TC-TEN-07` | **Tenant submission — success message** | A valid submission shows a green success message. The form resets. | Green success banner displayed after submit. Form reset via `e.currentTarget.reset()`. | **PASS** | | |
| `TC-TEN-09` | **Tenant cannot see other tenants' requests** | A tenant cannot access another tenant's maintenance request through the portal. | Tenant portal only shows a submission form; no request browsing exposed to tenants. | **PASS** | | |

---

## F4 — Lease Expiry Dashboard Widget

| ID | Description | Expected Result | Actual Result | Status | Notes | Resolved |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-LEASE-01` | **Dashboard widget exists** | The `/dashboard` page includes an "Expiring Leases" section. | Expiring leases widget present on dashboard, querying leases with `end_date` within 30 days and `status = active`. | **PASS** | | |
| `TC-LEASE-02` | **Lease expiring in 15 days — included** | A lease with `end_date = today + 15` and `status = active` appears in the widget with `days_remaining ≈ 15`. | Lease appeared in widget with correct `days_remaining` value. | **PASS** | | |
| `TC-LEASE-03` | **Lease expiring in 45 days — excluded** | A lease with `end_date = today + 45` does not appear in the widget. | Lease correctly excluded; query filters `end_date <= today + 30`. | **PASS** | | |
| `TC-LEASE-04` | **Expired lease excluded** | A lease with `end_date = today - 1` is not shown. | Past-expiry leases excluded; query filters `end_date >= today`. | **PASS** | | |
| `TC-LEASE-05` | **Terminated lease excluded** | A lease with `status = terminated` and `end_date` within 30 days is not shown. | Query filters `status = active` only. Terminated lease not shown. | **PASS** | | |
| `TC-LEASE-06` | **Results ordered soonest first** | Multiple expiring leases are listed in ascending order of `end_date`. | Results ordered by `end_date` ascending — soonest expiring at top. | **PASS** | | |
| `TC-LEASE-07` | **days_remaining accurate** | The `days_remaining` value matches `end_date - today` on the day of the query. | Computed at query time, not stored. Verified value matches expected day count. | **PASS** | | |
| `TC-LEASE-08` | **Other landlord's leases excluded** | Leases belonging to landlord B do not appear in landlord A's widget. | Query scoped by `leases.landlord_id = user.id`. | **PASS** | | |
| `TC-LEASE-09` | **Widget shows tenant name + unit + building** | Each row displays tenant name, unit floor, building name, `end_date`, and `days_remaining`. | All fields present: tenant full name, floor, building name, end date, days remaining. | **PASS** | | |
| `TC-LEASE-10` | **Empty state — no expiring leases** | When no leases expire within 30 days, widget shows an empty state message. | Empty state message displayed correctly when no qualifying leases exist. | **PASS** | | |
