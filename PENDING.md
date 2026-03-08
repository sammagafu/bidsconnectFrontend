# Pending Items

Summary of remaining work from project analysis and API alignment.

## Completed (this session)

- **Light/dark mode**: All major `bg-light` panels, table headers, borders, and hardcoded colors have been switched to theme-aware tokens (`bg-body-tertiary`, `var(--bs-border-color)`, `var(--bs-tertiary-bg)`, `var(--bs-secondary-color)`). Inputs and cards already use Bootstrap theme variables.

- **Country field (create company)**: Added dropdown in `src/views/user/create-company.vue` with Tanzania + "Other" option. When "Other" is selected, a free-text input appears for the user to enter their country.

- **Social sign-in (auth)**: Social buttons (Google, Facebook, GitHub) are now hidden by default. Set `VITE_ENABLE_SOCIAL_OAUTH=true` in `.env` when backend OAuth is implemented.

---

## Pending from codebase / product

1. **Views still using `api` by design (migrate to services in a later pass)**  
   - **`bid-for-tender.vue`**: Company qualification POSTs (litigations, sources-of-funds, financial-statements, personnel, annual-turnovers, experiences) and bid litigation/source/financial/turnover/experience/personnel response PATCH/POST. Can be moved into dedicated services when those modules are added.  
   - **`edit-tenders-admin.vue` / `create-tenders-admin.vue`**: Any remaining non-tender, non-agency calls (if present) still use `api` directly.  
   - **Automation, marketplace, qualification views**: Automation views, marketplace (products/RFQs), and qualification views (turnover, source-funds, personnel, etc.) were not changed; move to services when corresponding service modules are added.

2. **API spec / backend contract**  
   - If you have a separate API doc (OpenAPI, Postman, or markdown):  
     - Confirm all endpoints used by the app match (paths, methods, payloads).  
     - List any "planned" endpoints not yet implemented in the frontend.  
   - This file does not replace that document; it only tracks frontend-related pending work.

---

## Optional / polish

- **Logger**: Use `src/utils/logger.ts` (or equivalent) instead of `console.log` in any new or touched code.  
- **Env**: Keep `.env` in sync with `.env.example` and document any new vars.  
- **E2E / integration tests**: Add or extend tests for auth, company creation, and critical bid/tender flows if required by the project.

---

*Last updated from project analysis and light/dark mode pass. Update this file as items are completed or new docs (e.g. API spec) are added.*
