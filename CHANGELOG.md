# Changelog

## 2026-03-08 – Backend API alignment

Aligns frontend with backend changes from [bidsconnect CHANGELOG](../bidsconnect/docs/CHANGELOG.md).

### Bid submit validation

- **Bid submit errors:** When `POST /bids/{id}/submit/` returns 400 with `{"detail": "...", "errors": ["..."]}`, the frontend now displays both the summary and the full `errors` list to users.
- **parseApiError:** Updated to include `errors` array in the displayed message when present.

### Tender notifications

- **Tender notifications service:** Added `tenderNotificationsService` for `GET/PATCH /tenders/tender-notifications/`.
- **Mark as read:** `notificationsService.markAsRead(id, notificationType)` now routes tender notifications to `PATCH /tenders/tender-notifications/{id}/` when `notification_type === 'tender'`; marketplace notifications use `PATCH /notifications/{id}/`.
- **TopBar:** Passes `notification_type` when marking notifications as read so the correct endpoint is used.

### Invitation accept

- **403 (wrong email):** When the API returns 403 with "This invitation was sent to a different email address.", the UI now appends: "Please log in with the invited email address."
- **400 (company limit):** The API detail "Company user limit reached." is shown via `parseApiError`.

### Bid creation

- **Duplicate bid:** When creating a bid returns 400 with `{"detail": "Your company already has a bid for this tender."}`, the message is displayed via `parseApiError` in the save-draft flow.

### Other

- **Save draft errors:** Bid-for-tender save-draft now uses `parseApiError` for consistent error display (including duplicate bid and validation errors).
