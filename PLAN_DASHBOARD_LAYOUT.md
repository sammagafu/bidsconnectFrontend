# Donezo-Style Dashboard Layout Plan

Apply the Donezo dashboard layout (from reference image) to BidsConnect.

---

## Layout Structure (from Reference)

```
┌─────────────────┬──────────────────────────────────────────────────────────┐
│ LEFT SIDEBAR    │ MAIN CONTENT                                              │
│ (Fixed)         │                                                           │
│                 │  ┌─ Header: Search | Notifications | User (name + email)  │
│ Logo + Brand    │  ├─ Title: "Dashboard" + subtitle                        │
│ Search task     │  ├─ Actions: [Create Tender] [Import Data]                 │
│                 │  ├─ 4 Summary Cards (Total | Ended | Running | Pending)   │
│ Dashboard ●     │  ├─ 3-Column: Analytics Chart | Reminders | Tenders List │
│ Tasks (124)     │  └─ 3-Column: Team | Progress Donut | Time Tracker        │
│ Calendar        │                                                           │
│ Analytics       │                                                           │
│ Team            │                                                           │
│                 │                                                           │
│ ── GENERAL ──   │                                                           │
│ Settings        │                                                           │
│ Help            │                                                           │
│ Logout          │                                                           │
│                 │                                                           │
│ [Download App]  │                                                           │
└─────────────────┴──────────────────────────────────────────────────────────┘
```

---

## 1. Sidebar Updates

**File:** `src/layouts/partials/LeftSideBar.vue`

- Add "Search task" input below logo (placeholder, optional shortcut hint "⌘F")
- Add "GENERAL" section separator before Settings, Help, Logout
- Optional: "Download Mobile App" widget at bottom (BidsConnect branding)
- Active nav item: green background/highlight (match Donezo)
- Ensure fixed sidebar, main content scrolls

---

## 2. TopBar Updates

**File:** `src/layouts/partials/TopBar.vue`

- Keep search, notifications, user profile
- Show user name + email under avatar (e.g. "Totok Michael" / "tmichael20@mail.com")
- Align with Donezo header layout

---

## 3. Dashboard Page Restructure

**File:** `src/views/dashboards/index.vue`

### Page Header
- **Title:** "Dashboard"
- **Subtitle:** "Plan, prioritize, and accomplish your tenders with ease."
- **Actions:** Primary green "Create Tender" button, outline "Import Data"

### Summary Cards (Top Row)
- 4 cards: Total Tenders, Ended, Running, Pending (admin) or Company Users, Documents, Experiences (company)
- Style: white cards, rounded corners (12px), subtle left green border, growth indicator
- Replace or restyle `StatisticsCard.vue`

### Middle Section (3 Columns)
| Left | Center | Right |
|------|--------|-------|
| **Tender Analytics** (bar chart by week) | **Reminders** (upcoming deadlines) | **Tenders** (list with icons, due dates) |

### Bottom Section (3 Columns)
| Left | Center | Right |
|------|--------|-------|
| **Team Collaboration** (users + task status) | **Progress** (donut: Completed / In Progress / Pending) | **Quick Actions** or Time Tracker |

---

## 4. New Components

| Component | Path | Purpose |
|-----------|------|---------|
| DashboardReminders | `src/views/dashboards/components/DashboardReminders.vue` | Upcoming tender deadlines, "Start Meeting" style CTA |
| DashboardTendersList | `src/views/dashboards/components/DashboardTendersList.vue` | Compact list with icon, title, due date |
| DashboardTeamCollaboration | `src/views/dashboards/components/DashboardTeamCollaboration.vue` | Team/company users with status badges |
| DashboardProgressDonut | `src/views/dashboards/components/DashboardProgressDonut.vue` | Donut chart (Completed / In Progress / Pending) |
| DashboardSummaryCard | Update `StatisticsCard.vue` or new | Donezo-style card: left accent, rounded, growth |

---

## 5. Styling (Donezo Aesthetic)

- **Background:** Light grey (#f8f9fa)
- **Cards:** White, rounded (12px), subtle shadow
- **Accent:** Green (#1bb394 or similar)
- **Typography:** Bold titles, muted subtitles
- **Spacing:** Consistent gaps (e.g. gap-4, p-4)

**Files:** `_variables.scss`, `_card.scss`, `_theme-mode.scss`

---

## 6. Execution Order

1. Update `StatisticsCard` / create `DashboardSummaryCard` (Donezo style)
2. Restructure `dashboards/index.vue` layout (header, cards, 3-column sections)
3. Create `DashboardReminders`, `DashboardTendersList`, `DashboardTeamCollaboration`, `DashboardProgressDonut`
4. Update `LeftSideBar` (search, GENERAL section, optional widget)
5. Update `TopBar` (user name + email)
6. Apply color/spacing polish
