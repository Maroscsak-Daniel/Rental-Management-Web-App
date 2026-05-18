# Test Report

This document contains the execution log for the Rental Management Web App tests.

## Authentication & Routing Tests

| ID | Description | Expected Result | Actual Result | Status | Notes | Resolved |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-AUTH-01` | Unauthenticated Access Redirect | Redirect to `/login` or unauthorized page when accessing `/dashboard` | Redirected to `/login` | **PASS** | | |
| `TC-AUTH-02` | Registration (Edge Cases) | Invalid email blocked by validation | Blocked with browser HTML5 validation `"Please include an '@' in the email address."` | **PASS** | | |
| `TC-AUTH-03` | Registration (Success) | Weak password rejected, valid password succeeds | `1234` rejected with `"Password must be at least 6 characters long"`. `123456` accepted and redirected to `/login` | **PASS** | Account created with password `123456` | |
| `TC-AUTH-04` | Login (Edge Cases) | Wrong password displays invalid credentials error | Displayed `"Invalid login credentials"` | **PASS** | Used password `wrongpass` | |
| `TC-AUTH-05` | Login (Success - `steficz@yahoo.com`) | Log in and redirect to dashboard | Logged in and redirected to `/dashboard` successfully | **PASS** | Manual confirmation resolved blocker | |
| `TC-BLD-01` | Create Building (Edge Cases) | Empty name triggers validation | Form prevented from submitting due to HTML5 validation | **PASS** | | |
| `TC-BLD-02` | Create Building (Success) | Valid name creates building | "Automated Test Building" created and appears in list | **PASS** | | |
| `TC-BLD-03` | Duplicate Building Error | Duplicate name rejected | Error displayed: "You already have a building with this name." | **PASS** | | |
| `TC-BLD-04` | Update Building | Name changes are saved | Renamed to "Automated Test Building - Updated" | **PASS** | | |
| `TC-BLD-05` | Delete Building (Without Units) | Building is removed | Building deleted. (Note: minor UI bug on redirect to 404, but DB deletion successful) | **PASS** | | |
| `TC-UNT-01` | Setup Building | Create building for unit tests | "Test Building For Units" successfully created | **PASS** | | |
| `TC-UNT-02` | Create Unit (Edge Cases) | Form rejects negative numbers for rent and size | Saved unit with `-50` size and `$-100` rent | **FAIL** | **CRITICAL BUG**: Missing input validation for negative values on frontend and backend. | No |
| `TC-UNT-03` | Create Unit (Success) | Valid data creates unit | Unit created successfully with valid positive numbers | **PASS** | | |
| `TC-UNT-04` | Constraint Test (Delete Building with Units) | Cannot delete building with units; UI shows error | Deletion blocked by database, but failed silently on UI (no error shown) | **FAIL** | **UI BUG**: Silent failure. Need to catch constraint error in Server Action and display it in UI. | No |
| `TC-UNT-05` | Update Unit | Edits to rent and status persist | Unit updated to `$1500` and `occupied` | **PASS** | | |
| `TC-UNT-06` | Cleanup | Delete unit then delete building | Both deleted successfully | **PASS** | | |
