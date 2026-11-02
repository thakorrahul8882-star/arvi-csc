# Security Specification for ARVI ONLINE & CSC

## 1. Data Invariants
1. Services catalog (`/services/{serviceId}`) can be read publicly by citizens to view service details, fee, and documents. Writes (create, update, delete) are strictly restricted to verified Admins (`thakorrahul8882@gmail.com`).
2. Government schemes & announcements (`/schemes/{schemeId}`) are publicly viewable. Writes are restricted to verified Admins.
3. Center settings (`/settings/{settingId}`) are publicly viewable for UPI ID, center timing, and announcements. Writes are restricted to verified Admins, with visitorCount increment allowed under strict schema constraints.
4. Applications (`/applications/{applicationId}`):
   - Citizens can create a new application document with a valid alphanumeric ID (`applicationId` matches `^[a-zA-Z0-9_\-]+$`, max 64 chars).
   - Citizen creation must conform to strict key allowlists, valid mobile phone length (<= 15), name length (<= 150), and initial status 'SUBMITTED'.
   - Citizens can get/read their application document if they know the document ID or query by applicationId.
   - Applications can only have their status/paymentStatus modified by verified Admins.
5. Admin verification: `request.auth != null && (request.auth.token.email == "thakorrahul8882@gmail.com" || exists(/databases/$(database)/documents/admins/$(request.auth.uid)))`.

## 2. The Dirty Dozen Payloads (Targeting Exploits)
1. **Ghost Field Injection**: Adding `{ "isAdmin": true }` to an application creation payload. (Blocked by `hasOnly` schema validation).
2. **Status Escalation on Create**: Citizen submitting `{ "status": "COMPLETED" }` during initial submission. (Blocked: must be 'SUBMITTED').
3. **Application ID Poisoning**: Citizen submitting a 2KB garbage string as `applicationId`. (Blocked by `isValidId(applicationId)`).
4. **Service Price Tampering**: Citizen updating the fee on `/services/pan-card`. (Blocked: write requires `isAdmin()`).
5. **Unauthorized Status Modification**: Non-admin user sending update to change `status` from `SUBMITTED` to `COMPLETED`. (Blocked by `isAdmin()`).
6. **Payment Status Self-Verification**: Citizen sending update to mark `paymentStatus: "VERIFIED"` without admin approval. (Blocked: updates to applications require `isAdmin()`).
7. **Notice Banner Hijacking**: Unauthenticated or normal user altering the homepage notice banner in `/settings/general`. (Blocked: write requires `isAdmin()`).
8. **Malicious Scheme Publication**: Non-admin posting fraudulent phishing links under `/schemes`. (Blocked: write requires `isAdmin()`).
9. **Admin Role Self-Assignment**: Non-admin creating a document in `/admins/{uid}`. (Blocked: write requires `isAdmin()`).
10. **Application Deletion by Stranger**: Citizen attempting to delete other citizens' applications. (Blocked: delete requires `isAdmin()`).
11. **Negative Service Fee**: Admin or attacker creating a service with negative fee. (Blocked: fee must be >= 0).
12. **Denial of Wallet Oversized String**: Citizen submitting an application with a 10MB text field. (Blocked: max string size bounds <= 1000).
