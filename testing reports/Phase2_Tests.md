# Phase 2 Testing Report


## Tenant Profiles

| ID | Description | Expected Result | Actual Result | Status | Notes | Resolved |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-F2-07` | Incomplete Fields Validation | Form blocked if mandatory fields are missing | Form successfully blocked by HTML5 validation (`required` attribute tooltip shown). | **PASS** | | |
| `TC-F2-01` | Tenant Lifecycle (Create & Edit) | Tenant created and editable | Tenant "Jane Smith" created, unit assigned, and phone number successfully edited & saved. | **PASS** | | |
| `TC-F2-02` | Lease Dates Validation | Form rejects end date < start date | System blocked submission and showed error: *"End date must be after start date."* | **PASS** | | |
| `TC-F2-03` | Unit Occupancy Constraint | Cannot assign to occupied unit | UI prevented double assignment ("No vacant units available"). | **PASS** | | |
| `TC-F2-06` | Create Tenant Login | Generates temporary password | Login generated automatically; UI indicates "Portal Access Enabled". | **PASS** | | |
| `TC-F2-04` | Deactivate Tenant | Status changes to inactive | Tenant successfully changed to 'inactive' after lease termination. | **PASS** | | |
| `TC-F2-08` | Unit Availability Post-Deactivation | Unit becomes vacant | Unit correctly became vacant and available for selection in dropdowns. | **PASS** | | |
| `TC-F2-05` | Inactive Tenant Visibility | Inactive tenants still visible | Tenant is still visible in the list under the "Inactive" filter tab. | **PASS** | | |

## Document Storage

| ID | Description | Expected Result | Actual Result | Status | Notes | Resolved |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-F3-01` | Valid Document Upload | File uploads successfully | `dummy.pdf` uploaded successfully and appeared in the tenant's document list. | **PASS** | | |
| `TC-F3-02` | File Size Validation | Reject files > 10MB | Simulated upload of 11MB file was properly blocked by the system. | **PASS** | | |
| `TC-F3-03` | File Type Validation | Reject invalid MIME types | `dummy.docx` upload was blocked with error: *"Only PDF, JPG, and PNG files are allowed."* | **PASS** | | |
| `TC-F3-05` | Document Download | Downloads successfully | Download action successfully triggered for `dummy.pdf`. | **PASS** | | 
