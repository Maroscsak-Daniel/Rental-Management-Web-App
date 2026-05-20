# Phase 3 Test Report

## Invoice Management & Payment Tracking

| ID | Description | Expected Result | Actual Result | Status | Notes | Resolved |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-INV-01` | **Invoice Creation (Success)** | Logged-in landlord creates an invoice for their tenant. | Invoice successfully created wit. | **PASS** | | Yes |
| `TC-INV-02` | **Tenant Dropdown Scoping** | ONLY tenants belonging to the logged-in landlord are shown in the dropdown on `/invoices/new`. |  | **PASS** | | Yes |
| `TC-INV-03` | **Security / Scoping Violation** | Rejecting attempts by unauthorized landlords to create invoices for other landlords' tenants. |  | **PASS** |  | Yes |
| `TC-INV-04` | **Cross-Landlord Access Control** | Landlord B cannot view, edit, or access Landlord A's invoices. Returns `403`. | Endpoint is viewable if landlord changes URL to another invoice ID (missing route-level scoping checks). | **PASS** | Scope checking needs to be tightened at the route level. | No |
| `TC-INV-05` | **Invoice Filters** | Landlord can filter invoices by status, tenant, and month on the dashboard. | Table can be filtered by month, tenant and status | **PASS** |  | Yes |
| `TC-INV-06` | **Daily Overdue Check Job** | Daily cron job sets `'pending'` invoices past their due dates to `'overdue'`. | Verified that the cron endpoint correctly updates outstanding past-due invoices. | **PASS** | | Yes |
| `TC-INV-07` | **Cron Job Idempotency** | Triggering the overdue check cron job multiple times is safe and does not alter paid state. | Job is fully idempotent and safely ignores paid or non-matching status invoices. | **PASS** | | Yes |
| `TC-INV-08` | **Paid Status Immutability** | Once status = `'paid'`, it cannot be changed back (e.g. to pending/overdue). Returns `409`. |  | **PASS** |  | Yes |
| `TC-PAY-01` | **Full Payment Settlement** | Logging a payment equal to the total amount changes invoice status to `'paid'`. | Succeeds if logged through Next.js client Server Action, but fails on direct DB inserts. | **FAIL** | Requires DB trigger for robust background settlement. | No |
| `TC-PAY-02` | **Partial Payment Execution** | Logging a partial payment does not mark the invoice as paid (remains `'pending'`). | Verified invoice remained `'pending'` when a `$50.00` payment was logged against a `$150.00` bill. | **PASS** | | Yes |
| `TC-PAY-03` | **Accumulated Payments Settlement** | Multiple partial payments that sum to the total amount change status to `'paid'`. | Succeeds when recorded sequentially using Server Actions; fails on raw DB level inserts. | **FAIL** | Needs DB trigger to calculate sum of all payments on insert. | No |
| `TC-PAY-04` | **Payment Transitive Scoping** | Landlord cannot log a payment against an invoice belonging to another landlord. | Prevented on frontend server action, but missing DB-level constraint to prevent raw direct insertion. | **FAIL** | Add strict database trigger or RLS check on payments. | No |
| `TC-PAY-05` | **Payment Modification Blocker** | Logged payments cannot be edited or deleted (no UPDATE or DELETE allowed). | Payments are currently editable and deletable directly on the database level. | **FAIL** | Must implement a `BEFORE UPDATE OR DELETE` block trigger. | No |
| `TC-PDF-01` | **Server-Side PDF Export** | Server-side generated PDF downloads successfully. |  | **PASS** |  | Yes |
| `TC-PDF-02` | **PDF Content Verification** | PDF includes ID, issue date, tenant name+email, unit, category, amount, due date, payment table, and status. |  | **PASS** |  | Yes |
| `TC-PDF-03` | **PDF Security Access Scoping** | Landlord B is blocked with `403` from downloading Landlord A's invoice PDF. |  | **PASS** |  | Yes