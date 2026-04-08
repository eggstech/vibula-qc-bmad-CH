---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: ['_bmad-output/planning-artifacts/PRD.md', '_bmad-output/test-artifacts/test-design-architecture.md']
---

# vlm-testing - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for vlm-testing, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-AUTH-01: Google OAuth Sign-In system with JWT token management locally.
FR-AUTH-02: Role-Based Access Control (RBAC) with User-Level Overrides. Plus route guards based on Data Scope levels (OWN/TEAM/GLOBAL).
FR-DB-01: KPI Cards showing Active Sessions, Pending Audit, Disputed, Est. Occupancy with trend indicators.
FR-DB-02: Session Traffic Chart (Line Chart over Date/Sessions).
FR-DB-03: Operations Bottleneck Progress bars pointing to unassigned tasks.
FR-DB-04: Industry Mix summary grid cards.
FR-DB-05: Top 5 Clients summary grid.
FR-MB-01: Dashboard/List View spanning All State Tabs (Draft->Rejected), with advanced configurable searching/filtering.
FR-MB-02: Table Columns configurable with dynamic badges based on Host status or changes.
FR-MB-03: Booking Creation (Single) via slide-in drawer layout with recursive/dynamic fields.
FR-MB-04: Bulk Create via Extra Large spreadsheet-mode drawer.
FR-MB-05: Booking Detail (View/Edit) providing split slots and status visibility.
FR-MB-06: Assigned Host Detail tracking time logs (Check-in/Out, Live Time) per slot.
FR-MB-07: Additional Booking Fields representing contract mappings and custom needs.
FR-MB-08: Settlement Linkage statuses (PARTIAL/REJECTED badges).
FR-HM-01: Host Management List View with advanced search/filters for Booking coordinators.
FR-HM-02: Host Management Table showing Booking structure details.
FR-HM-03: Inline Host Assignment applying "No Structure"/Single Slot/Multi Slot interface rules.
FR-HM-04: Smart Popover Assignment enabling individual host selection per slot in multi-slot bookings.
FR-HM-05: Confirm Assignment Modal validating cost and API prior to final confirmation.
FR-HM-06: Bulk Assignment floating bar allowing atomic bulk additions to rows.
FR-HM-07: Room Assignment via inline dropdown configuration.
FR-HM-08: Conflict Detection API handling Hard Overlaps vs Warnings limits.
FR-SM-01: Toolbar 2-row filtering mapping to ops details.
FR-SM-02: 3-Bucket Sidebar showing tasks assigned vs unassigned via Drag and Drop mechanics.
FR-SM-03: Weekly Studio Matrix plotting assigned bookings into visual 7-day room matrices.
FR-SM-04: Auto Allocate Rooms providing intelligent blank-space fitting modal preview.
FR-SM-05: Room Assignment modal configurations for Tech Staff / Operator Bulk updating.
FR-SM-06: Tech Staff Assignation API implementations.
FR-SM-07: Mobile Responsive View layout adjustments.
FR-SM-08: Collision Detection rendering soft overlapping vs hard blocks natively.
FR-ST-01: Settlements Statistics dashboard tracking documents.
FR-ST-02: Settlement List tracking with multi-column dynamic values (Status, Dates).
FR-ST-03: Settlement Creation mapping ONLY verified slots mapping logic rules against constraints.
FR-ST-04: Settlement Detail flow with Double Approval Flow verification steps.
FR-ST-05: Settlement Status enum lifecycle processing.
FR-AT-01: Audit Log Table filtering.
FR-AT-02: Backend Audit Log Entity mapping diffs cleanly.
FR-MD-01..07: Master Data core operations for Users, Rooms, Hosts, Configs.

### NonFunctional Requirements

NFR1: Dashboard Load must be < 3s via API Cache.
NFR2: Host Matrix handling 100 bookings load in < 2s.
NFR3: Table Pagination must be server-side handling 10-100 items limit.
NFR4: Lazy Loading fetches enforced across selection dropdown interfaces.
NFR5: Drag and Drop interfaces must be performant.
NFR6: Overlap Tolerance enforced at strictly 0 minutes.
NFR7: Operations must be able to resume gracefully on error UI messages/Toasts.

### Additional Requirements

- [Architecture] Infrastructure initialized using Vue 3 + Vite + TailwindCSS on FrontEnd; .NET 8 EF Core on BackEnd.
- [Architecture/Test] Testing Suite defined to use Playwright (API & E2E) + xUnit + Allure Reporter.
- [Architecture/Blockers] API needs Mock endpoints for OAuth, and DB seeding utilities to isolate test states logically before feature implementation progresses.
- [Architecture] Real-Time operations implemented natively via SignalR to map data changes cleanly.

### UX Design Requirements

UX-DR1: Implement Drawer Layout for Booking Creation/Detail providing smooth slide-in/out experiences from the right panel.
UX-DR2: Build Smart Host Popover Widget acting as a fixed independent widget that validates per-slot time matrices intelligently.
UX-DR3: Realize Weekly Studio Matrix implementing accurate drag targets for multi-day overlaps mapping to individual Studio lanes visually.

### FR Coverage Map

FR-AUTH-01: Epic 1 - Identity & Security
FR-AUTH-02: Epic 1 - Identity & Security
FR-MD-01..07: Epic 2 - Master Data
FR-MB-01: Epic 3 - Booking Pipeline
FR-MB-02: Epic 3 - Booking Pipeline
FR-MB-03: Epic 3 - Booking Pipeline
FR-MB-04: Epic 3 - Booking Pipeline
FR-MB-05: Epic 3 - Booking Pipeline
FR-MB-07: Epic 3 - Booking Pipeline
FR-AT-01: Epic 3 - Booking Pipeline
FR-AT-02: Epic 3 - Booking Pipeline
FR-MB-06: Epic 4 - Host Assignment & Verification
FR-HM-01: Epic 4 - Host Assignment & Verification
FR-HM-02: Epic 4 - Host Assignment & Verification
FR-HM-03: Epic 4 - Host Assignment & Verification
FR-HM-04: Epic 4 - Host Assignment & Verification
FR-HM-05: Epic 4 - Host Assignment & Verification
FR-HM-06: Epic 4 - Host Assignment & Verification
FR-HM-08: Epic 4 - Host Assignment & Verification
FR-SM-01: Epic 5 - Studio Matrix & Allocation
FR-SM-02: Epic 5 - Studio Matrix & Allocation
FR-SM-03: Epic 5 - Studio Matrix & Allocation
FR-SM-04: Epic 5 - Studio Matrix & Allocation
FR-SM-05: Epic 5 - Studio Matrix & Allocation
FR-SM-06: Epic 5 - Studio Matrix & Allocation
FR-SM-07: Epic 5 - Studio Matrix & Allocation
FR-SM-08: Epic 5 - Studio Matrix & Allocation
FR-HM-07: Epic 5 - Studio Matrix & Allocation
FR-MB-08: Epic 6 - Financial Settlements
FR-ST-01: Epic 6 - Financial Settlements
FR-ST-02: Epic 6 - Financial Settlements
FR-ST-03: Epic 6 - Financial Settlements
FR-ST-04: Epic 6 - Financial Settlements
FR-ST-05: Epic 6 - Financial Settlements
FR-DB-01: Epic 7 - Executive Analytics
FR-DB-02: Epic 7 - Executive Analytics
FR-DB-03: Epic 7 - Executive Analytics
FR-DB-04: Epic 7 - Executive Analytics
FR-DB-05: Epic 7 - Executive Analytics

## Epic List

### Epic 1: Identity & Security (RBAC)
Người dùng có thể đăng nhập an toàn bằng tài khoản Google. Hệ thống giới hạn quyền truy cập và lọc Dữ liệu (Data Scope) ở dạng cá nhân (OWN), nhóm (TEAM) và toàn quyền (GLOBAL) - Loại bỏ khái niệm Chi nhánh.
**FRs covered:** FR-AUTH-01, FR-AUTH-02

### Epic 2: Master Data Foundation
Admin có cấu trúc quản lý trước các thông số và đối tượng hệ thống như Phòng, Host, Client để làm cơ sở cho Booking hoạt động.
**FRs covered:** FR-MD-01..07

### Epic 3: Booking Request Pipeline (Key Account Flow)
Đội Key Account có thể tạo Booking (Single/Bulk), quản lý vòng đời Booking và ném vào "Hàng đợi" (Queue) một cách độc lập mà không cần quan tâm đến việc ai live và live ở phòng nào.
**FRs covered:** FR-MB-01, FR-MB-02, FR-MB-03, FR-MB-04, FR-MB-05, FR-MB-07, FR-AT-01, FR-AT-02

### Epic 4: Host Assignment & Verification (Host Management Focus)
Đội Host Management lấy Booking từ Queue để tiến hành việc phân bổ và gán Host, check Đụng lịch (Collision) riêng biệt của Host. Cuối luồng, họ xác nhận Check-in/Out, thời gian trễ và các khoản tiền phát sinh để chuyển sang bước kế toán.
**FRs covered:** FR-MB-06, FR-HM-01, FR-HM-02, FR-HM-03, FR-HM-04, FR-HM-05, FR-HM-06, FR-HM-08

### Epic 5: Studio Matrix & Allocation (Operations Focus)
Các Bộ phận Vận hành/Kỹ thuật kéo Booking lên Ma trận tuần (Weekly Matrix), kéo thả để gán phòng, phân bổ máy móc Kỹ thuật tự động (Auto-Allocate) và check Xung đột Phòng. Tách bạch hoàn toàn khỏi quyền của Đội quản lý Host.
**FRs covered:** FR-HM-07, FR-SM-01, FR-SM-02, FR-SM-03, FR-SM-04, FR-SM-05, FR-SM-06, FR-SM-07, FR-SM-08

### Epic 6: Financial Settlements
BP Kế Hoạch / Kế toán tạo Biên bản nghiệm thu dựa trên dữ liệu TRONG SẠCH đã được team Host Management confirm, thực hiện duyệt Double Approval và làm lệnh thanh toán.
**FRs covered:** FR-MB-08, FR-ST-01, FR-ST-02, FR-ST-03, FR-ST-04, FR-ST-05

### Epic 7: Executive Analytics Dashboard
Triển khai biểu đồ thời gian thực, xem lưu lượng truy cập và chỉ ra các Bottleneck trong cả pipeline bằng SignalR sau khi dữ liệu hệ thống đã chạy tốt.
**FRs covered:** FR-DB-01, FR-DB-02, FR-DB-03, FR-DB-04, FR-DB-05

## Epic 1: Identity & Security (RBAC)
Người dùng có thể đăng nhập an toàn bằng tài khoản Google. Hệ thống giới hạn quyền truy cập và lọc Dữ liệu (Data Scope) ở dạng cá nhân (OWN), nhóm (TEAM) và toàn quyền (GLOBAL) - Loại bỏ khái niệm Chi nhánh.

### Story 1.1: Google OAuth Authentication Module

As a System User,
I want to authenticate using my Google Account,
So that I can securely access the system without managing a separate password.

**Acceptance Criteria:**

**Given** an unauthenticated user opens the application
**When** they click the "Sign in with Google" button
**Then** they are redirected to the Google OAuth consent screen
**And** upon successful authorization, the backend verifies the Google payload and issues a secure local JWT token
**And** the Frontend stores the JWT token locally to maintain the active session.

### Story 1.2: Role & Route Constraints (RBAC)

As a System Administrator,
I want to assign specific Roles to users,
So that I can restrict UI route access to authorized personnel only.

**Acceptance Criteria:**

**Given** a user with a specific assigned role (e.g., Host, Admin)
**When** they attempt to access an unauthorized Frontend route
**Then** the Router Guard intervenes and redirects them to an error/unauthorized page
**And** when they access an authorized route, the page loads successfully based on their role setup.

### Story 1.3: Data Scope Filtering (OWN/TEAM/GLOBAL)

As a User with specific Data Scopes,
I want the system to filter my data queries based on my scope (OWN/TEAM/GLOBAL),
So that I only see bookings, settlements, and master data appropriate to my authorization level without needing branch logic.

**Acceptance Criteria:**

**Given** an authenticated user makes an API request to fetch data
**When** their assigned Data Scope is `OWN` (or `TEAM` / `GLOBAL`)
**Then** the Backend automatically appends the correct filtering clause to the query interceptor
**And** Administrative users can apply "User-Level Overrides" to grant granular permissions outside standard Role groups successfully.

## Epic 2: Master Data Foundation
Admin có cấu trúc quản lý trước các thông số và đối tượng hệ thống như Phòng, Host, Client để làm cơ sở cho Booking hoạt động.

### Story 2.1: Client Management (CRUD)

As a System Administrator,
I want to manage Client and Agency records,
So that Booking Coordinators can link bookings to the correct clients accurately.

**Acceptance Criteria:**

**Given** an Administrator is on the Master Data module
**When** they navigate to the "Clients" view
**Then** they see a server-paginated list of all active Client entities
**And** they can Create, Edit, or Soft-Delete a Client record using standard data entry forms.

### Story 2.2: Room & Studio Configuration

As a System Administrator,
I want to manage physical Rooms and their parameters,
So that the Operations Team can subsequently map bookings to available spaces on the Studio Matrix.

**Acceptance Criteria:**

**Given** an Administrator accesses the "Rooms" master table
**When** they create or update a Studio record
**Then** they can define parameters such as Room Name, maximum occupancy, and assigned Tags
**And** any Studio marked as "Active" immediately surfaces on the resource list for future studio matrix configurations.

### Story 2.3: Host Profiles Data Setup

As a System Administrator,
I want to create and manage core Host profiles,
So that the Host Management workflow has reference data to assign slots properly.

**Acceptance Criteria:**

**Given** an Administrator is managing Hosts
**When** they create a new Host profile
**Then** they can enter necessary details like Base Hourly Rate, Skillsets, and Status
**And** only Hosts with "Active" status can be searched or selected in the Host Assignment popover.

### Story 2.4: System Configurations & Preferences

As a System Administrator,
I want to maintain dynamic System Configurations (e.g., constants, dropdown lists),
So that I can adjust core metadata without requiring engineering redeployments.

**Acceptance Criteria:**

**Given** an Administrator accesses the "System Configurations" page
**When** they update generic key-value sets (like Overlap Tolerances, standard conflict rules)
**Then** the changes immediately propagate to dependent features safely
**And** these parameters are loaded globally upon system bootstrap.

## Epic 3: Booking Request Pipeline (Key Account Flow)
Đội Key Account có thể tạo Booking (Single/Bulk), quản lý vòng đời Booking và ném vào "Hàng đợi" (Queue) một cách độc lập mà không cần quan tâm đến việc ai live và live ở phòng nào.

### Story 3.1: Booking Dashboard & Lifecycle Tabs

As a Key Account Manager,
I want a centralized Dashboard with dynamic columns and state tabs,
So that I can monitor and filter Bookings across their entire lifecycle (from Draft to Rejected).

**Acceptance Criteria:**

**Given** I am on the Bookings module
**When** the page loads
**Then** I see layout tabs representing booking states (e.g., Draft, Queue, Assigned, Finished, Rejected)
**And** I can toggle Table Columns configuration to show/hide fields
**And** status columns display dynamic badges (e.g., `PARTIAL`, `REJECTED`)
**And** I can perform advanced searching and filtering logic across the list.

### Story 3.2: Single Booking Creation (UX-DR1)

As a Key Account member,
I want to create a Single Booking using a slide-in drawer layout,
So that I can maintain my context on the dashboard while entering dynamic booking fields.

**Acceptance Criteria:**

**Given** I am viewing the Booking Dashboard
**When** I click the "New Booking" button
**Then** a right-panel drawer smoothly slides in (satisfying UX-DR1)
**And** I can input recursive/dynamic fields and specific Contract Mappings
**And** upon save, the Booking enters the correct initial status queue without requiring immediate Room or Host assignment.

### Story 3.3: Bulk Booking Creation (Spreadsheet Engine)

As a Key Account member,
I want to create multiple Bookings via a spreadsheet-mode interface,
So that I can ingest large weekly/monthly schedules efficiently without doing it one by one.

**Acceptance Criteria:**

**Given** I need to create a batch of records
**When** I select "Bulk Create"
**Then** an Extra Large drawer opens presenting a spreadsheet-like data grid
**And** I can manually enter or paste multiple rows of booking data
**And** the system validates data types across the batch before final bulk submission.

### Story 3.4: Booking Detail and Split Slots (UX-DR1)

As a Booking Coordinator,
I want to view or edit an existing booking's details within a sliding drawer,
So that I can visualize and manage distinct multi-slot logic (Split slots).

**Acceptance Criteria:**

**Given** an existing Booking record
**When** I click to view its details from the list
**Then** the Slide-in Drawer (UX-DR1) opens presenting the detailed layout
**And** it clearly visualizes any "Split slots" (multi-slot allocations) and their independent status lifecycles natively.

### Story 3.5: Booking Audit Log Tracking

As an Operations Manager,
I want to see the Audit Log history of a Booking Entity,
So that I know exactly who changed what state or field and when.

**Acceptance Criteria:**

**Given** a Booking that has undergone data updates over time
**When** I open its Audit Log table section
**Then** I see clean backend-mapped diffs of entity changes (Old Value vs New Value)
**And** I can apply filtering over the audit table to find specific field modifications easily.

## Epic 4: Host Assignment & Verification (Host Management Focus)
Đội Host Management lấy Booking từ Queue để tiến hành việc phân bổ và gán Host, check Đụng lịch (Collision) riêng biệt của Host. Cuối luồng, họ xác nhận Check-in/Out, thời gian trễ và các khoản tiền phát sinh để chuyển sang bước kế toán.

### Story 4.1: Host Conflict Detection API (Backend logical foundation)

As a System Architect,
I want the backend to expose a robust Conflict Detection API,
So that front-end interfaces can validate host calendar availability accurately against ongoing bookings.

**Acceptance Criteria:**

**Given** a proposed host assignment payload
**When** the API processes the evaluation request
**Then** it evaluates overlapping time allocations against the Host's existing confirmed schedule
**And** it returns either a "Hard Conflict" (blocking the assignment completely) or a "Soft Warning" (e.g., tight transitions) based on configuration limits.

### Story 4.2: Host Management List View

As a Host Manager,
I want a specialized List View with Host-specific columns,
So that I can monitor which bookings in the queue need my immediate assignment action.

**Acceptance Criteria:**

**Given** I access the Host Management module
**When** the module loads
**Then** I see a table uniquely structured for my role, showing Booking structure details and unassigned slots seamlessly
**And** I can toggle advanced search and filters natively (e.g., missing hosts only, specific skillsets needed) without affecting the Key Account view.

### Story 4.3: Smart Host Popover Assignment (UX-DR2)

As a Host Manager,
I want a smart, floating popover to select hosts,
So that I can assign the exact person per slot comprehensively without losing visual context of the table.

**Acceptance Criteria:**

**Given** a booking or specific time slot requiring host assignment
**When** I click the assign action
**Then** a fixed, independent popover widget appears (satisfying UX-DR2)
**And** it directly queries the Conflict Detection API, visually dimming unavailable hosts or showing warning badges for hosts with tight schedules actively
**And** the UI dynamically handles individual selection matrices for multi-slot bookings intelligently.

### Story 4.4: Bulk & Inline Assignment Actions

As a Host Manager,
I want to assign hosts inline quickly or via a bulk action bar,
So that I can clear the queue faster for identical, simple scenarios.

**Acceptance Criteria:**

**Given** a simple, single-slot "no structure" booking
**When** I use Inline Assignment
**Then** I can pick a host from an immediate dropdown and save
**And** for larger queue scenarios, I can select multiple rows and use a Floating Bulk Action Bar to atomically distribute a valid host to all selected rows concurrently.

### Story 4.5: Assigned Host Verification (Time & Cost)

As a Host Manager,
I want to verify real-time operational data outputs post-live (Check-in/out times, extra costs),
So that the Financial Settlement pipeline receives certified, locked data to invoice cleanly.

**Acceptance Criteria:**

**Given** a 'Finished' booking
**When** I review it in the Host Management detail view
**Then** I can explicitly encode precise Check-in/Check-out time logs and identify any extra manual penalty/bonus costs
**And** upon my final confirmation, the slot status effectively locks and transitions cleanly to the Financial Settlements queue.

## Epic 5: Studio Matrix & Allocation (Operations Focus)
Các Bộ phận Vận hành/Kỹ thuật kéo Booking lên Ma trận tuần (Weekly Matrix), kéo thả để gán phòng, phân bổ máy móc Kỹ thuật tự động (Auto-Allocate) và check Xung đột Phòng. Tách bạch hoàn toàn khỏi quyền của Đội quản lý Host.

### Story 5.1: 3-Bucket Sidebar & Task Toolbar

As an Operations Coordinator,
I want a Toolbar and a 3-Bucket Sidebar,
So that I can easily filter operations details and see exactly which bookings remain unassigned vs assigned.

**Acceptance Criteria:**

**Given** I am on the Studio Matrix module
**When** I interact with the UI
**Then** the Top Toolbar provides a 2-row filtering mechanism mapping to specific operational details
**And** the Sidebar displays Bookings categorized into 3 distinct state buckets for Drag and Drop mechanics
**And** lazy loading is enforced across assignment dropdown operations natively.

### Story 5.2: Weekly Studio Matrix UI & Drag/Drop (UX-DR3)

As an Operations Coordinator,
I want a 7-day Weekly Studio Matrix,
So that I can visually plot bookings across physical rooms via drag-and-drop.

**Acceptance Criteria:**

**Given** the Studio Matrix is loaded with active Studios
**When** I drag an unassigned booking from the sidebar
**Then** I can drop it onto the matrix, which provides accurate drag targets mapping to individual Studio lanes visually (UX-DR3)
**And** alternatively, I can assign a Room via an inline setup dropdown natively for quick actions
**And** the component maintains sub-2-second UX performance.

### Story 5.3: Room Collision & Auto-Allocate Engine

As an Operations Manager,
I want the system to calculate room availability mathematically,
So that I can auto-fit unassigned bookings without risking physical room double-booking.

**Acceptance Criteria:**

**Given** a busy weekly matrix with random gaps
**When** I trigger "Auto Allocate Rooms"
**Then** the Engine calculates intelligent blank-space fitting and displays a modal preview of proposed assignments before saving
**And** it renders collision detection natively (preventing soft overlapping bounds vs hard blocking constraints at precisely 0 minutes tolerance).

### Story 5.4: Tech Staff & Equipment Assignment Modals

As a Technical Manager,
I want to assign specific operators and equipment to a room,
So that the booked session has the exact technical requirements fulfilled.

**Acceptance Criteria:**

**Given** a Booking that is already assigned to a Room
**When** I open the Tech Staff / Operator configuration modal
**Then** I can use specific API implementations to assign resources
**And** I can apply bulk assignment updates to multiple sessions seamlessly.

### Story 5.5: Mobile Layout Adjustments

As an on-floor Coordinator,
I want to view the Studio Matrix on my mobile device,
So that I can verify room statuses physically while walking the studio floor.

**Acceptance Criteria:**

**Given** I access the Studio Matrix via a mobile layout
**Then** the heavy Matrix UI gracefully degrades into a mobile-responsive list/timeline view prioritizing current day schedules.

## Epic 6: Financial Settlements
BP Kế Hoạch / Kế toán tạo Biên bản nghiệm thu dựa trên dữ liệu TRONG SẠCH đã được team Host Management confirm, thực hiện duyệt Double Approval và làm lệnh thanh toán.

### Story 6.1: Settlements List & Statistics Dashboard

As an Accounting Manager,
I want a Statistics dashboard and List view of settlements,
So that I can track financial documents via multi-column dynamic values based on document status and dates.

**Acceptance Criteria:**

**Given** I am on the Financial Settlements module
**When** the page loads
**Then** I see a top-level statistics dashboard tracking current document numbers (e.g., Draft, Pending, Approved)
**And** below it, a List tracking table displays specific multi-column dynamic values including Settlement Status and associated active dates logically.

### Story 6.2: Verified Settlement Creation Engine

As an Accounting User,
I want to create a Settlement record using only strictly verified data,
So that I skip any unverified or disputed slots seamlessly to enforce invoice accuracy.

**Acceptance Criteria:**

**Given** I initiate a new Settlement Creation process
**When** the system retrieves available booking data to map
**Then** it ONLY surfaces and maps verified slots against logic constraints, strictly ignoring any 'Unverified', 'Draft', or 'Disputed' booking slots natively.

### Story 6.3: Double Approval Verification Flow

As an Accounting Head / Director,
I want a Double Approval Flow enforced on finalized settlements,
So that I can structurally verify accuracy before issuing the Final Payment Command.

**Acceptance Criteria:**

**Given** a Settlement document is drafted and initially submitted
**When** I review it within the Settlement Detail flow
**Then** the UI blocks further execution and requires a strict Two-Step (Double Approval) verification process
**And** only upon receiving both digital signatures/approvals does the document transition to the full 'Approved' status.

### Story 6.4: Cross-Module Linkage & Enum Sync

As a System Integration Engine,
I want to synchronize the Settlement enum lifecycle directly back to the original Booking record,
So that Key Account Managers immediately see PARTIAL or REJECTED flags natively if accounting finds errors.

**Acceptance Criteria:**

**Given** a Settlement document's enum lifecycle status updates (e.g., changes to Rejected or Paid)
**When** the backend writes the state change
**Then** the cross-module Linkage logic immediately propagates the update to the parent Booking record
**And** Key Account Managers see the corresponding dynamic badges (like `PARTIAL` or `REJECTED`) surface automatically on the Booking Dashboard.

## Epic 7: Executive Analytics Dashboard
Triển khai biểu đồ thời gian thực, xem lưu lượng truy cập và chỉ ra các Bottleneck trong cả pipeline bằng SignalR sau khi dữ liệu hệ thống đã chạy tốt.

### Story 7.1: Executive KPI Cards & Trend Indicators

As an Executive User,
I want to see vital KPI Grid Cards initially,
So that I immediately understand system health and key metrics like Active Sessions or Est. Occupancy.

**Acceptance Criteria:**

**Given** I am on the Executive Dashboard
**When** the page loads
**Then** I see KPI Grid Cards showing specific aggregations (Active Sessions, Pending Audit, Disputed, Est. Occupancy)
**And** they display comparative trend indicators (e.g., red/green arrows) mapping against the previous period natively.

### Story 7.2: Session Traffic Line Chart

As an Executive User,
I want to view a Session Traffic Chart,
So that I can analyze booking volume trajectories over specific dates or session blocks.

**Acceptance Criteria:**

**Given** the Dashboard is visible
**When** I look at the main chart area
**Then** I see a responsive Line Chart accurately plotting session volumes over Dates
**And** tooltip interactions display precise data details upon hover natively.

### Story 7.3: Operations Bottleneck Progress bars

As an Operations Manager,
I want to see Bottleneck Progress bars natively,
So that I know exactly where the pipeline is stuck (e.g., Unassigned Hosts vs Unassigned Rooms).

**Acceptance Criteria:**

**Given** the Dashboard is visible
**When** I check the Bottleneck widget area
**Then** specifically colored Progress Bars clearly point to unassigned tasks
**And** they highlight critical queue blockages accurately based on real-time task counts.

### Story 7.4: Industry Mix & Top Client Grids

As a Key Account Director,
I want summary grids of the Industry Mix and Top 5 Clients natively,
So that I can analyze revenue sources and VIP partner usage easily.

**Acceptance Criteria:**

**Given** the Dashboard is visible
**When** I scroll to the summary section
**Then** two separate grid cards cleanly display the Industry Mix distribution (e.g., pie/doughnut logic) and rank the Top 5 Clients dynamically based on booking volume natively.

### Story 7.5: SignalR Real-Time Infrastructure

As a Frontend Client,
I want to receive live data updates,
So that dashboard statistics automatically refresh without manual page reloading.

**Acceptance Criteria:**

**Given** the Dashboard is active on my screen
**When** underlying data (e.g., a booking status or host assignment) changes in the backend via another user
**Then** the backend SignalR hub pushes the differential delta to the connected Frontend automatically
**And** the KPI Cards and Charts seamlessly animate/refresh to reflect the latest system state cleanly.

