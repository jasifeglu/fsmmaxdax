# MAXDAX FSM — Master Enhancement Roadmap

Source: uploaded "MAXDAX FSM — COMPLETE UNIFIED MASTER ENHANCEMENT PROMPT".
Rules: reuse existing tables/modules, backward-compatible migrations, backend-enforced rules, no fake data, every control functional.

## Stage 1 — Travel Management module (IN PROGRESS)
- [x] `travel_journeys` table (journey types, status, origin/destination, GPS/road/odometer distance, return_of_journey_id self-reference, reimbursement flag) + RLS + grants
- [x] Duplicate-safe "one active journey per user" enforced by partial unique index
- [x] `staff_locations.journey_id` column — reuse existing GPS point table for journey breadcrumbs
- [x] Travel page: Start Travel, Active Journey, End Travel, Start Return Journey, Journey History, daily totals
- [x] GPS recording while a journey is active (50 m accuracy filter, 30 s / 40 m throttle)
- [x] Route + sidebar entry for all roles
- [ ] Mileage Review (admin/manager sets approved reimbursement distance per journey)
- [ ] Weekly/monthly mileage reports + CSV export
- [ ] Saved locations & travel settings (admin-configurable journey types)

## Stage 2 — Multi-visit tickets & scheduling
- [ ] `ticket_visits` table (ticket_id, visit_number, scheduled_at, status, findings, outcome, materials) + RLS
- [ ] Multi-technician per visit (reuse `ticket_technicians` pattern, add visit_id)
- [ ] Independent per-visit check-in/out per technician (extend staff_attendance with visit_id)
- [ ] Visit completion does NOT auto-close ticket
- [ ] Reschedule + conflict detection + notification on assignment
- [ ] Schedule board updates (SchedulePage)

## Stage 3 — Expenses & mileage integration
- [ ] Link completed journeys to the expense form (journey_id on travel_expenses)
- [ ] Prefill distance from configured reimbursement source; prevent duplicate reimbursement per journey
- [ ] Mileage review stage feeding approved_amount (reuse guard trigger pattern)

## Stage 4 — Project visits & task outcomes
- [ ] Project visit type in schedule + task outcome values (completed/partial/blocked/waiting/follow-up)
- [ ] Local outcomes stay separate from Zoho task status; show sync status
- [ ] Zoho import (CSV now, API later) — Zoho sync record table when credentials arrive

## Stage 5 — Reusable inventory rotation & repair
- [ ] Serialized asset table (serial/EID/IMEI, ownership, custody, current location) on top of existing inventory
- [ ] Issue → install → swap → collect → return → repair → test → reuse lifecycle with audit events
- [ ] Atomic stock movements (RPC), no negative stock, no conflicting custody
- [ ] Repair queue, inspection/testing, approve-for-reuse, overdue returns

## Stage 6 — Reports, notifications, realtime polish, offline
- [ ] Realtime subscriptions for new tables (journeys, visits, assets)
- [ ] Audit entries for corrections/overrides
- [ ] Offline queue for GPS/attendance with idempotent retries (web best-effort)

Deferred pending user inputs: Zoho OAuth credentials, routing provider key (road distance stays "unavailable" until then), push notifications provider.
