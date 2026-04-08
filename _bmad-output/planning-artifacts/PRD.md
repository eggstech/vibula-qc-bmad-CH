---
stepsCompleted: []
classification:
  domain: General Operations
  projectType: web_app
inputDocuments: []
date: '2026-04-04'
---
# Vibula Livestream Management (VLM) - Phase 01
## Product Requirements Document (PRD)

**Product Owner:** Vibula
**Phase:** 01
**Version:** V4 (Enriched from Codebase Analysis — 2026-04-04)
**Modules:** Dashboard • My Bookings • Host Management • Studio Management (Operations Portal) • Settlements • Audit Trail • Master Data

---

## 1. Executive Summary

**Problem Statement:** Việc vận hành số lượng lớn phiên livestream đồng thời đang gặp phải rủi ro trùng lặp lịch (phòng/host), khó kiểm soát thời gian check-in/out, và tốn kém nhân lực để tính toán hợp đồng nghiệm thu thủ công.
**Vision:** VLM (Vibula Livestream Management) cung cấp một hệ thống ERP chuyên biệt, số hóa toàn vẹn quy trình quản lý booking livestream từ lúc lập yêu cầu (planning) đến khi quyết toán (settlement), giúp tự động hóa phân bổ tài nguyên, chống xung đột lịch, và tối ưu công suất khai thác studio.

### 1.1 Tech Stack

#### Frontend (GUI) — `vlm-gui-readonly`
- **Framework:** Vue 3 + Vite + TypeScript
- **Styling:** TailwindCSS + Custom CSS
- **UI Components:** PrimeVue 4.x, FontAwesome, Vue Datepicker, CKEditor 5
- **State Management:** Pinia (stores: `identity`, `app`, `breadcrumb`, `notification`, `pageState`, `seeding`)
- **Routing:** vue-router (auto-routes + generated layouts)
- **API Client:** openapi-client-axios (3 clients: `lopApiClient`, `identityApiClient`, `uploadApiClient`)
- **Real-time:** SignalR (`@microsoft/signalr`)
- **Charting:** Chart.js via `vue-chartjs` (Line charts on Dashboard)
- **Auth:** JWT token management via `jose` library, Google OAuth Sign-In
- **Toast:** `vue3-toastify` & PrimeVue `useToast`
- **Date Utility:** `date-fns`
- **Deployment:** Docker + Nginx reverse proxy

#### Backend (API) — `vlm-api-readonly`
- **Framework:** .NET (C#) Clean Architecture
  - `Domain` — Entities, Constants, Types, Exceptions
  - `Application` — Services, DTOs, Interfaces, Helpers
  - `Infrastructure` — Data Context, External Integrations
  - `WebApi` — Controllers (Admins / Apps / Commons), Hangfire background jobs
- **ORM:** Entity Framework Core (StrongEntity base class, Fluent Configuration)
- **API Documentation:** Swagger (Swashbuckle annotations)
- **Authentication:** JWT-based + Google Sign-In integration
- **DI Container:** Autofac
- **Background Jobs:** Hangfire
- **CI/CD:** Bitbucket Pipelines
- **Deployment:** Docker + Docker Compose

### 1.2 Application Pages (Routes)

| Route | Page | Module |
|---|---|---|
| `/` | Redirect → Dashboard | — |
| `/login` | Login page (Google OAuth) | Auth |
| `/google/auth/callback` | Google auth callback | Auth |
| `/dashboard` | KPI Dashboard | Dashboard |
| `/my-booking` | Booking Management | My Bookings |
| `/host-scheduling` | Host Management | Host Management |
| `/operations-portal` | Studio Management | Studio Management |
| `/settlements` | Quản lý Hợp đồng & Nghiệm thu | Settlements |
| `/master-data` | Master Data (7 tabs) | Master Data |
| `/audit-trail` | System Audit Trail | Audit Trail |
| `[...path]` | 404 Error Page | — |

### 1.3 Target Personas & User Roles

Để đáp ứng tiêu chuẩn Test Architecture, dưới đây là các chân dung người dùng (Personas) tương tác chính với hệ thống VLM:

| Persona (Role) | Chức năng chính (Key Activities) | Mức độ ảnh hưởng (Data Scope) |
|---|---|---|
| **Admin / System Manager** | Quản lý toàn hệ thống, thiết lập Master Data (Rooms, Hosts, Users), phê duyệt cuối cùng, xem Audit Log. | `GLOBAL` (Toàn quyền hệ thống) |
| **Booking Agent / KA** | Tạo Booking, theo dõi Booking Lifecycle, thương lượng, gửi yêu cầu thanh toán. | `OWN` hoặc `TEAM` |
| **Host Coordinator** | Quản lý lịch Host, xử lý xung đột lịch, thương lượng chi phí với Host. | `BRANCH` hoặc `GLOBAL` |
| **Studio / Ops Manager** | Quản lý Studio Matrix, kéo thả phòng, gán nhân sự, Auto-Allocate. | `BRANCH` |

---

## 2. Success Criteria

Để đo lường sự thành công của VLM Phase 01, các mục tiêu (KPIs) sau được thiết lập:
- **Ngăn chặn 100%** lỗi trùng lịch (Hard Conflict) trong cùng một khung giờ đối với Phòng Studio và Host.
- **Giảm thiểu overtime / lost time** thông qua cơ chế tự động ghi nhận tracking Check-in/Check-out của Host so với giờ booked.
- **Tăng tỷ lệ Fill Rate (Occupancy):** Tối ưu hóa việc lấp chỗ trống của Studio thông qua sơ đồ Matrix và Auto-Allocate.
- **Loại bỏ 100% lỗi sai sót thủ công** trong việc tính toán số liệu và xuất Report cho Hợp đồng Nghiệm thu (Settlement).

---

## 3. Product Scope

**In-Scope:**
- Quản lý Master Data (Users, Teams, Rooms, Hosts, Customers).
- Vòng đời Booking từ DRAFT tới SETTLED.
- Công cụ xếp lịch Host (Inline & Bulk) với tính năng Validate Conflict.
- Công cụ xếp lịch Studio (Scheduler, Matrix) với tính năng Auto-Allocate.
- Ghi nhận Check-in/Check-out của Host và thời lượng Live thực tế.
- Khởi tạo và theo dõi Trạng thái Hợp đồng Nghiệm thu (BBNT).
- Dashboard KPIs Overview.

**Out-of-Scope (Phase 01):**
- Tích hợp cổng thanh toán trực tiếp (Momo, VNPay...) cho Host.
- Tích hợp Livestream Streaming System (hệ thống chỉ quản lý thời gian/nhân sự, không stream video trực tiếp).
- Mobile App cho End User (Chỉ support responsive web view cho Operator).

---

## 4. User Journeys

Dưới đây là các luồng hành trình người dùng nòng cốt (Core Flows):

**Journey 1: Tạo Booking và Đẩy lên Review (Booking Agent/KA)**
- KA truy cập `My Bookings` -> Tạo mới Single hoặc Bulk Booking.
- Điền các thông tin: Brand, Slot time, Thời lượng, Tags.
- Ở Booking Detail, KA có thể chia slot (split slots).
- KA ấn "Submit Request" để đẩy Booking từ WIP sang `REVIEW`, chờ Quản lý duyệt.
- `[UI Mockup: Figma Link]`

**Journey 2: Phân bổ Room & Auto Allocate (Studio/Ops Manager)**
- Ops truy cập `Operations Portal`, kiểm tra màn hình Inbox/My Tasks.
- Ops ấn nút **Auto Allocate Rooms** để hệ thống chạy thuật toán chèn phòng trống.
- Đối với booking phức tạp, Ops kéo - thả (drag & drop) thẻ Booking lên Weekly Studio Matrix để gán phòng và gán Tech Staff vận hành.
- `[UI Mockup: Figma Link]`

**Journey 3: Phân bổ Host và Resolve Xung đột (Host Coordinator)**
- Coordinator truy cập `Host Scheduling`, click "N-Slots" Popover trên 1 booking row.
- Tìm kiếm tài năng phù hợp -> Form **Confirm Assignment** nảy lên.
- Hệ thống gọi hàm API `ValidateBulkAssignHost`. Nếu đỏ (Hard Conflict), Coordinator phải chọn Host khác hoặc lùi giờ. Nếu xanh, chốt **Agreed Buying Cost** và confirm (Trạng thái Host: Draft -> Final).
- `[UI Mockup: Figma Link]`

**Journey 4: Quản lý Vận hành Booking - Check-in/Out Host (Ops / Coordinator)**
- Khi đến thời gian Booking (Live), nhân sự vận hành vào Booking Detail.
- Cập nhật thời gian thực (Time Log): Check-in Time, Start Live Time, End Live Time.
- Upload hình ảnh bằng chứng (Evidence Photos) vào slot của Host.
- Hệ thống tự động tính toán số phút `overtimeTime` hoặc `lostTime` trên nền background.
- Update status Booking sang Complete (đi vào luồng Verify).
- `[UI Mockup: Figma Link]`

**Journey 5: Tổng hợp Hợp đồng & Nghiệm thu (Admin / KA)**
- Hàng tháng, Admin vào `Settlements` -> Create BBNT cho 1 Host.
- Hệ thống tự động rollup tất cả các buổi Live (VERIFIED) thuộc về Host đó, quy đổi số phút thành `Total Payable` (Dựa trên Base Rate và overtime).
- KA duyệt vòng 1 -> Admin duyệt vòng 2 -> Tiền được đánh dấu PAID.
- `[UI Mockup: Figma Link]`

---

## 5. Functional Requirements

### 5.1 Authentication & Authorization

#### 5.1.1 Authentication

#### FR-AUTH-01: Google OAuth Sign-In
- **Mô tả:** Hệ thống sử dụng Google OAuth làm phương thức đăng nhập chính
- **Endpoints:**
  - `POST /Commons/GoogleSignIn` — Đăng nhập bằng Google
  - `POST /Commons/GoogleSignIn/LoginGoogleWithAccess` — Đăng nhập với site/session context
- **Token Management:** JWT access token + refresh token, lưu trữ cục bộ (Local persist).
- **Token Validation:** Giải mã phần payload của JWT token phía giao diện, kiểm tra expiration
- **Auto-redirect:** Redirect to `/login` khi token expired hoặc không tồn tại

#### FR-AUTH-02: Role-Based Access Control (RBAC) with User-Level Overrides
- **Mô tả:** Hệ thống sử dụng RBAC. Mỗi User được gán một Role mặc định (chứa tập hợp quyền). Cấp quản lý có thể phân bổ thêm hoặc thu hồi từng quyền nhỏ (Permission Code) trên từng cá nhân (User-Level Override) mà không làm ảnh hưởng đến bộ quyền chuẩn của Role đó.
- **Roles:** Admin, Staff (2 system roles defined in backend)
- **Permission Groups (Backend):** Customer, AuditLog, Order, Wallet, Dashboard
- **Permission Codes (Frontend - from booking types):**

| Permission Code | Mô tả |
|---|---|
| `VIEW_FULL_DASHBOARD` | Xem dashboard tổng quan |
| `CREATE_BOOKING` | Tạo booking mới |
| `APPROVE_BOOKING` | Duyệt booking |
| `COMPLETE_SESSION` | Hoàn thành phiên |
| `VIEW_HOST_MATRIX` | Xem matrix host (read-only) |
| `UPDATE_HOST_ALLOCATION` | Gán/cập nhật host |
| `UPDATE_ROOM_ALLOCATION` | Gán/cập nhật phòng |
| `VIEW_QUEUE_HOST` | Xem hàng đợi host |
| `VIEW_QUEUE_ROOM` | Xem hàng đợi phòng |
| `VIEW_FINANCE_DASHBOARD` | Xem dashboard tài chính |
| `VIEW_AUDIT_LOG` | Xem audit log |
| `MANAGE_MASTER_DATA` | Quản lý master data |

- **Route Guard:** Router `beforeEach` kiểm tra `requireAuth` meta + permission code bằng `PermissionComponent[method](code)`
- **Data Scope Levels:** OWN → TEAM → BRANCH → GLOBAL

> **⚠️ Lưu ý Dev Mode:** Hiện tại router guard đang bị bypass (`return` statement trước auth check) cho mục đích phát triển. TODO: Re-enable khi authentication/authorization sẵn sàng.

---

### 5.2 Module 1: Dashboard

### 3.1 Business Objective
Cung cấp cái nhìn tổng quan (Overview) về hiệu suất vận hành, công suất phòng studio, và các bottleneck trong pipeline booking.

### 3.2 Key Features

#### FR-DB-01: KPI Cards (4 thẻ)
| KPI | Mô tả | Tính toán |
|---|---|---|
| **Active Sessions** | Tổng booking đang active (pipeline) | Count bookings WHERE status NOT IN (CANCELLED, SETTLED, DRAFT) |
| **Pending Audit** | Booking chờ KA review/audit | Count bookings WHERE status = COMPLETED |
| **Disputed / Returned** | Booking có feedback/dispute | Count WHERE (CONFIRMED or WIP) AND feedback exists |
| **Est. Occupancy** | Tỷ lệ sử dụng phòng studio (%) | Room utilization calculation |

- **Trend Indicators:** % thay đổi so với tháng trước (up/down arrows)
- **Time Range Toggle:** 7 Days / 30 Days (ảnh hưởng tất cả KPI)

#### FR-DB-02: Session Traffic Chart
- **Loại:** Biểu đồ đường phân tích (Line chart)
- **Trục X:** Ngày (dd/MM format)
- **Trục Y:** Số lượng sessions
- **Data Source:** Active bookings grouped by `startDate`
- **Responsive:** Fill container, smooth tension 0.3

#### FR-DB-03: Operations Bottlenecks
- **KA Review:** Bookings đang ở trạng thái REVIEW
- **Host Allocation:** Bookings ở WIP với bookingTask = PENDING
- **Room Allocation:** Bookings ở WIP với onsiteTask = PENDING
- **Hiển thị:** Progress bars với tỷ lệ % so với total active

#### FR-DB-04: Industry Mix
- **Mô tả:** Phân bổ booking theo ngành: BEAUTY, TECH, LIFESTYLE, FMCG, FASHION
- **Hiển thị:** Grid cards với % và icon tương ứng (💄📱✨🛒👗)

#### FR-DB-05: Top Clients
- **Mô tả:** Top 5 khách hàng theo volume booking
- **Hiển thị:** Grid 5 cards với avatar, tên, số booking, ranking badge (#1 gold)

---

### 5.3 Module 2: My Bookings (Booking Management)

### 4.1 Business Objective
Cung cấp trung tâm quản lý booking cho Booking Agent / KA / Operator, theo dõi booking lifecycle từ draft/creation đến settlement và billing.

### 4.2 Booking Lifecycle (State Machine)

```
DRAFT(1) → WIP(2) → REVIEW(3) → CONFIRMED(4) → COMPLETED(5) → VERIFIED(6) → SETTLED(7)
                                                                                 ↓
                                                                          CANCELLED(-1)
```

**Status Mapping (API Number → Status String):**

| API Code | Status | Display Label | Tab Label |
|---|---|---|---|
| 1 | DRAFT | Drafts | Drafts |
| 2 | WIP | WIP | WIP (Plan) |
| 3 | REVIEW | Review | Review (Review) |
| 4 | CONFIRMED | Confirmed | Confirmed (Live) |
| 5 | COMPLETED | Completed | To Verify (Audit) |
| 6 | VERIFIED | Verified | Verified (Bill) |
| 7 | SETTLED | Settled | — |
| -1 | CANCELLED | Cancelled | Rejected |

### 4.3 Key Features

#### FR-MB-01: Dashboard/List View
- **Status Tabs:** ALL (Active All), Drafts, WIP (Plan), Review, Confirmed (Live), To Verify (Audit), Verified (Bill), Rejected
- **Badge Count:** Hiển thị số lượng booking theo từng tab
- **Search:** Full-text search across rooms, contract code, host names
- **Advanced Filtering:**
  - Booking Date (date range picker)
  - Customer (dropdown với search)
  - Brand (dropdown với search, lazy-load on open)
  - Slot Time (HH:mm time picker range)
- **Toggle Filters:** Show/hide individual filter controls (lưu trữ tùy chọn cục bộ)
- **Configurable Columns:** Toggle visibility of Status, Booking Info, Creator, Contract Code, Resources & Tasks, Schedule, Duration (lưu trữ tùy chọn cục bộ)

#### FR-MB-02: Table Columns (Data Display)
| Column | Content |
|---|---|
| Status | BookingStatusBadge + Change Request badge + Settlement Rejection badge + Partial badge |
| Booking Info | Industry icon (emoji) + Brand name + Customer name + Code (monospace) |
| Creator | Account name |
| Contract Code | Contract code (emerald text) |
| Resources & Tasks | ResourceStatusCell component (host/room allocation status) |
| Schedule | ScheduleCell: Start date + Start time → End time (minutes from midnight) |
| Duration | Duration in minutes (Xm / Xh Ym) + Total hosts count |

#### FR-MB-03: Booking Creation (Single)
- **Drawer Layout:** Resizable drawer (820px–1200px), slide-in from right
- **Form Component:** `BookingForm` với fields:
  - Customer selection
  - Brand selection (filtered by customer, lazy-load)
  - Session Type (CRUD, dynamic creation)
  - Platform selection
  - Duration, time slots
  - Tags (required tags)
- **Actions:**
  - **Save Draft** — Lưu nháp không submit
  - **Submit Request** — Submit cho review pipeline

#### FR-MB-04: Bulk Create (Spreadsheet Mode)
- **Wizard Interface:** `BulkCreationWizard` component
- **Drawer:** Extra large (1400px–1920px), resizable
- **Data Input:** Spreadsheet-style bulk entry
- **Batch Fields:** Customer, Brand, Platform, Session Type
- **Validation:** Atomic submission (all or nothing)

#### FR-MB-05: Booking Detail (View/Edit)
- **Drawer Component:** `BookingDetailDrawer` — Full booking detail view
- **Features:**
  - Edit booking fields
  - View/manage session structure (slots)
  - Host assignment status per slot
  - Room assignment
  - Activity logs
  - **Duplicate Booking** — Clone existing booking
  - **Slots Pagination** — Load more slots for large bookings
  - **Update Progress Indicator** — Loading state during save
- **Slot Management:**
  - Auto-split mechanism
  - Parent-child slot hierarchy (`parentSlotId`, `childSlots`)
  - Per-slot: Duration, Target Buying Cost, Start Time, Role

#### FR-MB-06: Assigned Host Detail
- Per slot tracking:
  - Host name, ID, buying cost, base rate, tier
  - **Host Confirm Status:** Draft(1) / Final(2)
  - **Time Log:** Check-in time, Start Live time, End Live time (minutes from midnight)
  - **Overtime / Lost Time:** `overtimeTime`, `lostTime`
  - **Evidence:** Check-in photo, Check-out photo
  - **Rejection:** `isRejectHostFinal`, rejection reason

#### FR-MB-07: Additional Booking Fields
| Field | Type | Description |
|---|---|---|
| `code` | string | Auto-generated booking code |
| `contractCode` | string | Contract reference |
| `issueAt` | Unix timestamp | Issue/schedule date |
| `durationMinutes` | number | Total duration |
| `startTimeMinutes` | number | Minutes from midnight (e.g., 840 = 14:00) |
| `endTimeMinutes` | number | Minutes from midnight |
| `requiresSetDesign` | boolean | Cần thiết kế bối cảnh |
| `setDesignStartTime` / `setDesignEndTime` | Date | Thời gian setup bối cảnh |
| `talentBrief` | string | Brief cho host |
| `gmvTarget` | number | Mục tiêu GMV |
| `sessionType` | string | Loại phiên |
| `rundown` | string | Kịch bản chạy |
| `conditionReport` | string | Báo cáo tình trạng |
| `notes` | string | Ghi chú |
| `isCrossBranch` | boolean | Booking cross-branch |
| `isAutoAllocated` | boolean | Phòng tự động phân bổ |
| `isChangeRequest` | boolean | Yêu cầu thay đổi |

#### FR-MB-08: Settlement Linkage
- Booking có thể link với Settlement ID
- Hiển thị badge `PARTIAL` nếu có settlementId nhưng chưa SETTLED
- Hiển thị badge `REJECTED` nếu có `settlementRejectionReason`

---

### 5.4 Module 3: Host Management (Host Scheduling)

### 5.1 Business Objective
Cung cấp công cụ cho Booking Coordinator / Operation Manager theo dõi, lọc và gán Host vào booking slots, quản lý xung đột, chi phí và hiệu quả vận hành.

### 5.2 Key Features

#### FR-HM-01: List View with Advanced Filtering
- **Search:** Full-text search across rooms, contract code, host names
- **Filters (toggleable, saved locally):**
  - Booking Date (date range picker)
  - Customer (searchable dropdown, lazy-load)
  - Brand (searchable dropdown, lazy-load)
  - Platform (searchable dropdown, lazy-load)
  - Slot Time (HH:mm range picker)
  - Room (searchable dropdown, lazy-load)
- **Filter/Column Settings:** Dropdown toggles for filter visibility and column visibility
- **Status Tabs:** Giống My Bookings — ALL, và per-status filtering
- **Export:** Export to Excel button

#### FR-HM-02: Table Columns
| Column | Content |
|---|---|
| Select (checkbox) | Multi-select cho bulk actions, chỉ enabled khi Status = Plan AND hasStructure |
| Code | Booking code (clickable → view detail) |
| Date | Date label + time range badge |
| Customer | Customer name |
| Brand | Brand name |
| Platform | Platform badge |
| Status | BookingStatusBadge |
| Slot Start | Monospace time label |
| Slot End | Monospace time label |
| Host | Host assignment control (dynamic) |
| Room | Room assignment dropdown |
| Total Payable | Currency (emerald, monospace) |

#### FR-HM-03: Inline Host Assignment (3 Rules)
1. **R01 — No Structure:** Hiển thị "No Structure" (disabled, italic)
2. **R02 — Status = Plan, 1 Slot:** Inline `CustomSelect` dropdown để chọn host, với:
   - Host confirm status indicator (✅ Final / 🕐 Draft)
   - Edit Assignment button (pencil icon, hover)
   - Remove Host button (X icon, hover)
3. **R02 — Status = Plan, >1 Slots:** Nút `[N] Slots` mở **Smart Popover** để gán host từng slot
4. **R03 — Status != Plan:** Read-only, chỉ hiển thị tên Host

#### FR-HM-04: Smart Host Assignment Popover
- **Mô tả:** Fixed popover (widget độc lập bề mặt) cho multi-slot booking
- **Per Slot:** Time range + Assignment status (Assigned/Unassigned) + Host dropdown + Edit button
- **Visual Indicators:**
  - 🟢 Assigned badge (emerald)
  - ⚪ Unassigned badge (slate)
  - ✅ Final confirm icon / 🕐 Draft clock icon

#### FR-HM-05: Confirm Assignment Modal
- **Host Info Card:** Avatar (2-letter initials), Name, Base Rate (VND/hr)
- **Duration & Tags:** Duration in minutes + Industry tags (violet badges)
- **Agreed Buying Cost Input:** Large monospace input with VND currency, số hiển thị formatted
- **Standard Cost Reference:** So sánh với standard cost
- **Validation:** API call `ValidateBulkAssignHost` trước khi confirm
  - Error display (red): Errors list with booking code
  - Warning display (amber): Warning list with booking code
- **Assignment Status Toggle:** Draft / Confirmed (radio buttons)

#### FR-HM-06: Bulk Assignment
- **Trigger:** Floating action bar khi có items selected (fixed bottom-center)
- **Selection Counter:** Badge với số lượng selected
- **Bulk Modal:** `Assign Host` button → Modal:
  - Host selection (searchable dropdown)
  - **Pre-validation:** Tự động validate tất cả slots khi chọn host
  - **Slot-level Pricing:** Input giá (Agreed Buying Cost) cho từng slot khi validation pass
  - **Atomic Submission:** All-or-nothing

#### FR-HM-07: Room Assignment
- Inline `CustomSelect` dropdown cho mỗi booking row
- Loading spinner overlay khi đang assign
- Lazy-load room options on dropdown open

#### FR-HM-08: Conflict Detection (via API)
- **Validation Endpoint:** `ValidateBulkAssignHost`
- **Response Structure:** `{ valid: boolean, errors: [{bookingCode, message}], warnings: [{bookingCode, message}] }`
- Conflict types inferred:
  - **Hard Conflict:** Overlap > 1 phút → blocked
  - **Overload Warning:** Tổng thời gian hàng ngày > 480 phút
  - **Back-to-Back Warning:** Khoảng cách giữa slots < hostBuffer

### 5.3 Roles & Permissions
| Permission | Description |
|---|---|
| VIEW_HOST_MATRIX | Xem danh sách booking và lịch host (read-only) |
| UPDATE_HOST_ALLOCATION | Thực hiện inline/bulk assignments |
| ADMIN | Full access, bypass restrictions |

### 5.4 Non-functional Requirements
- **Pagination:** Server-side pagination (page sizes: 10, 15, 30, 50, 100)
- **Validation:** Real-time conflict checking via API
- **Platform:** Desktop only (mobile/tablet không phải priority cho V3)

---

### 5.5 Module 4: Studio Management (Operations Portal)

### 6.1 Business Objective
Cung cấp công cụ trực quan cho Studio Manager / Ops Manager phân bổ phòng studio và nhân sự kỹ thuật, tối ưu hóa việc sử dụng phòng, và tự động hóa phân bổ khi có thể.

### 6.2 Key Features

#### FR-SM-01: Toolbar (2-Row Filter)
**Row 1:**
| Filter | Type | Description |
|---|---|---|
| Search | Text input | Search bookings, host, technician |
| Slot Time | Time range picker (HH:mm) | Filter by booking timeslot |
| Booking Date | Date range picker | Default: current month start–end |
| Booking Detail Status | Dropdown | Plan / Review / Live / Audit / Bill |

**Row 2:**
| Filter | Type | Description |
|---|---|---|
| Customer | Searchable dropdown (lazy) | Filter by customer |
| Brand | Searchable dropdown (lazy) | Filter by brand |
| Tech Staff | Searchable dropdown (lazy) | Filter by assigned operator |
| Room | Searchable dropdown (lazy) | Filter by room |

#### FR-SM-02: 3-Bucket Sidebar (`OperationsSchedulerSidebar`)
| Bucket | Description | Filter Logic |
|---|---|---|
| **My Tasks** | Bookings assigned to current user | `onsiteTaskAssigneeId` OR `opsId` OR `accountOperatorOwnerId` matches current user |
| **Unassigned (Inbox)** | Bookings WIP chưa có operator | Count via `inboxCount` |
| **All** | Tất cả bookings (không filter by owner) | — |

- **Drag & Drop:** Start drag from sidebar card → drop onto Weekly Matrix

#### FR-SM-03: Weekly Studio Matrix (`OperationsWeeklyStudioMatrix`)
- **Trục Y:** Rooms (studio rooms)
- **Trục X:** 7 ngày trong tuần (Navigate: Prev/Next Week)
- **Booking Cards:** Hiển thị trên matrix theo room + date
- **Drag & Drop Targets:** Drop zones per room/date cell
- **Matrix Loading:** Separate API call (`fetchBookingsForMatrix`) with week date range
- **Filters:** Matrix only uses calendar week; toolbar filters chỉ áp dụng cho sidebar

#### FR-SM-04: Auto Allocate Rooms (`AutoAllocateRoomsModal`)
- **Trigger:** Button trong sidebar
- **Preview:** Modal hiển thị kết quả trước khi áp dụng:
  - **Valid Items:** Bookings có thể auto-allocate
  - **Invalid Items:** Bookings không thể allocate (conflict)
- **Loading States:** `isAutoAllocateLoading` (calculating) + `isAutoAllocateApplying` (saving)
- **Eligibility:** Chỉ bookings owned by current user; non-leader phải trùng opsId

#### FR-SM-05: Room Assignment (Inline)
- Dropdown room selection per booking
- **Assign Room Modal (Bulk):** Select room + optional Tech Staff
- **Error Handling:** `assignRoomError` modal hiển thị chi tiết lỗi

#### FR-SM-06: Tech Staff Assignment
- **Assign Operator:** API `AdminBookingAssignOperator({ bookingId, operatorId })`
- **Bulk Assign Tech Only:** Separate modal cho chỉ gán tech staff
- **Sidebar Assignee Change:** Direct assignee change từ sidebar cards

#### FR-SM-07: Mobile Responsive View
- **Detection:** Tự động phát hiện kích báo Viewport hiển thị mobile → `OperationsMobileOpsView`
- **Mobile View:** Full replacement layout, khác hoàn toàn desktop

#### FR-SM-08: Collision Detection
- **Core Time:** Hard blocks — ngăn chặn hoàn toàn khi trùng
- **Setup/Cleanup Buffers:** Soft warnings — cảnh báo khi chồng lấn thời gian chuẩn bị

### 6.3 Booking Detail (Shared)
- Sử dụng chung `BookingDetailDrawer` component giống My Bookings
- Open từ sidebar click hoặc matrix click
- API: `AdminBookingGetDetail({ id })`

### 6.4 Roles & Permissions
| Permission | Description |
|---|---|
| VIEW_STUDIO_MATRIX | Xem queue và lịch phòng |
| UPDATE_ROOM_ALLOCATION | Cập nhật phân bổ phòng (required cho leader/admin actions) |
| RUN_AUTO_ALLOCATE | Chạy auto-allocate |
| TECH_STAFF_ACCESS | Truy cập quản lý nhân sự kỹ thuật |

### 6.5 Business Rules
- **Audit Log:** Bắt buộc ghi log cho mọi thay đổi Room ID, Room Name, Assigned Operator
- **Concurrency Control:** Optimistic updates/locking
- **Performance:** Drag-and-drop mượt mà trên matrix UI
- **Date Range Default:** Current month (start to end)

---

### 5.6 Module 5: Settlements (Quản lý Hợp đồng & Nghiệm thu)

### 7.1 Business Objective
Quản lý Phụ lục Hợp đồng (PL) và Biên bản Nghiệm thu (BBNT) theo Host/Tháng, theo dõi quy trình xét duyệt và thanh toán.

### 7.2 Key Features

#### FR-ST-01: Statistics Dashboard (3 Cards)
| Card | Mô tả |
|---|---|
| Tổng văn bản | Total count of settlements |
| Đang chờ xử lý (Pending) | Count WHERE status != PAID |
| Đã thanh toán (Paid) | Count WHERE status = PAID |

#### FR-ST-02: Settlement List
- **Search:** Host name, PL code
- **Status Filter:** Tất cả / Đang chờ xử lý / Đã thanh toán
- **Month Filter:** Last 6 months (MM/YYYY)
- **Table Columns:**

| Column | Content |
|---|---|
| BBNT / PL CODE | Settlement ID + PL Số |
| HOST / MONTH | Host avatar + name + period (MM/YYYY) |
| GIÁ TRỊ NGHIỆM THU | Total amount (VND formatted) |
| HDNT STATUS | Chưa upload / Thiếu dữ liệu / Thành công |
| MAIN & REVIEW STATUS | Booking approval status + Admin approval status |
| LAST UPDATED | Booking update datetime + Admin update datetime |
| ACTIONS | View Details button |

#### FR-ST-03: Settlement Creation (BBNT)
- **Modal:** Select Host (dropdown) + Select Month (dropdown)
- **Validation Rules:**
  - Chỉ bookings có status = VERIFIED
  - Host phải được gán cho booking (via `assignedHosts` hoặc `hostId`)
  - Booking date phải trong tháng đã chọn
  - Không cho phép duplicate (same host + same month)
- **Auto-calculation:**
  - Duration = endTime - startTime (minutes)
  - Total Amount = (duration / 60) × host.baseRate
  - Tự động tạo `SettlementItem` cho mỗi verified booking

#### FR-ST-04: Settlement Detail View
- **Component:** `SettlementDetail`
- **Features:** View items, update settlement, release bookings, escalation messages
- **Dual Approval Flow:**
  - Booking team review/approve
  - Admin KA review/approve

#### FR-ST-05: Settlement Status Flow
```
DRAFT → PENDING_BOOKING_REVIEW → PENDING_KA_REVIEW → APPROVED → PAID
                                                    ↓
                                              NEEDS_CORRECTION
```

### 7.3 Settlement Data Model

```typescript
interface Settlement {
  id: string
  hostId: string
  hostName: string
  period: { start: Date; end: Date }
  totalAmount: number
  itemCount: number
  status: SettlementStatus // DRAFT | NEEDS_CORRECTION | PAID
  createdAt: Date
  createdBy: string
  items: SettlementItem[]
  bookingUpdate?: { at: Date; by: string }
  adminUpdate?: { at: Date; by: string }
}

interface SettlementItem {
  id: string
  settlementId: string
  bookingId: string
  snapshotBrandName: string
  snapshotDate: Date
  snapshotDuration: number
  snapshotOtMinutes: number
  snapshotRate: number
  snapshotTotalAmount: number
  isCrossBranch: boolean
  chargeToBranchId?: string
  status: string
}
```

---

### 5.7 Module 6: Audit Trail

### 8.1 Business Objective
Cung cấp bản ghi bất biến (immutable record) của tất cả hoạt động hệ thống, phục vụ compliance và traceability.

### 8.2 Key Features

#### FR-AT-01: Audit Log Table
- **Columns:** Timestamp, Actor (User/SYSTEM), Action, Details, Ref ID (booking ID truncated)
- **Search:** Filter theo action, details, bookingId, actor
- **Sorting:** Clickable column headers (asc/desc toggle), default sort by timestamp desc
- **Pagination:** Client-side pagination (20 records/page)

#### FR-AT-02: Backend Audit Log Entity
- **Fields:**
  - `Code`, `Function` (enum: AuditLogFunctions), `Action` (enum: AuditLogActions)
  - `Source` (enum: AuditLogSources)
  - `AccountId` → FK to Account
  - `ObjectId` + `ObjectType` — Polymorphic reference
  - `OldData` / `NewData` — JSON diffs
  - `IpAddress`, `UserAgent`
  - `Content` (HTML format), `SubContent`
  - `ExpireAt` — Auto-expire logs

### 8.3 Audit Log Backend (API)
- **Controller:** `AuditLogController` (Admin)
- **Service:** `AuditLogService` (24KB — rich logging logic)

---

### 5.8 Module 7: Master Data

### 9.1 Business Objective
Quản lý tất cả dữ liệu nền tảng (foundation data) của hệ thống: tổ chức, người dùng, phòng, host, khách hàng, và cấu hình hệ thống.

### 9.2 Tabs (7 sub-modules)

#### FR-MD-01: Organization (`OrganizationTab`)
- Quản lý cấu trúc tổ chức (Org Units)
- **OrgUnitType:** HQ, BRANCH
- **Team Management:** Team list + membership
- **User Assignment:** Assign users to org units

#### FR-MD-02: Roles & Access (`RolesAccessTab`)
- Quản lý system roles (Admin, Staff)
- Permission assignment per role
- **SystemRole Model:** code, name, description, color, isSystem, defaultPermissions, scopeConfig

#### FR-MD-03: Users (`UsersTab`)
- CRUD users
- **Employment Model:** userId, orgUnitId, jobGradeId, role, isPrimary, jobTitle, grantedPermissions, revokedPermissions
- **Membership Model:** userId, teamId, isLeader

#### FR-MD-04: Rooms (`RoomsTab`)
- CRUD rooms/studios
- **Room Model:** id, branchId, name, building, floor, tags, capacity, status, setupBuffer, area, address

#### FR-MD-05: Hosts & KOLs (`HostsTab`)
- CRUD hosts/talent
- **Host Model:** id, name, rating, tier (NANO/MICRO/MACRO/MEGA), location (HN/HCM/Other), categories (Industry[]), platforms (Platform[]), settlementFrequency, baseRate, avatar
- **Platforms:** TIKTOK, FACEBOOK, YOUTUBE, SHOPEE

#### FR-MD-06: Clients (`ClientsTab`)
- **Customer Entity:** Code (unique), Name, Phone, Email, Birthday, Gender, Note
- **Brand Model:** id, customerId, name, logo, industry
- **Industries:** BEAUTY, TECH, LIFESTYLE, FMCG, FASHION
- **Database Indexes:** Code (unique), Name, Phone, Email

#### FR-MD-07: Settings (`SettingsTab`)
- **System Settings (SystemSettings interface):**

| Setting | Type | Description |
|---|---|---|
| `setupTime` | number | Thời gian setup phòng (phút) |
| `cleanupTime` | number | Thời gian dọn dẹp phòng (phút) |
| `hostBuffer` | number | Buffer giữa các slot host (phút) |
| `requiredArrivalTime` | number | Thời gian bắt buộc đến (phút trước giờ live) |
| `latenessBuffer` | number | Dung sai trễ (phút) |
| `departureBuffer` | number | Buffer sau khi kết thúc (phút) |
| `overtimeThreshold` | number | Ngưỡng tính OT (phút) |

---

## 6. Non-Functional Requirements (Cross-cutting)

### 10.1 Performance
- Dashboard load: < 3 giây (cache KPIs) - Phương pháp đo: Giám sát bằng APM hoặc Lighthouse (Môi trường mạng giả lập 4G).
- Host Matrix: Load 100 bookings trong < 2 giây - Phương pháp đo: APM / Network logging.
- Table pagination: Server-side (configurable page sizes)
- Lazy loading: Trì hoãn API calls cho đến khi người dùng mở dropdown (`Lazy fetch` pattern)
- Studio Matrix: Separate data fetch, independent from sidebar filters

### 10.2 State Persistence
- Filter preferences được lưu trữ trạng thái hiển thị cục bộ (Local persistence) per page
- Column visibility được lưu trữ trạng thái hiển thị cục bộ per page
- Token storage lưu trữ cục bộ bảo mật (accessToken, refreshToken)

### 10.3 Error Handling
- Toast notifications (Sử dụng UI Toast widget)
- Modal error dialogs (e.g., Room Assignment Failed)
- Validation error/warning lists from API

### 10.4 UI/UX Standards
- **Design System:** TailwindCSS + Custom utility classes
- **Animations:** Transition fade/scale on dropdowns, slide-in drawers
- **Responsive:** Desktop-first, specific mobile view for Operations Portal
- **Drag & Drop:** Sidebar → Matrix (Operations Portal)
- **Drawer Pattern:** Resizable right-side drawers (min/max width constraints)
- **Currency Formatting:** VND with `formatCurrency` utility

### 10.5 API Architecture
- **3 API Clients:**
  - `lopApiClient` — Main business API (bookings, rooms, hosts, etc.)
  - `identityApiClient` — Authentication & user management
  - `uploadApiClient` — File upload service
- **Request Pattern:** `lopApiClient.request((c) => c.OperationName(params))`

---

## 7. Data Model Summary

### 11.1 Core Entities (Backend — Domain)
| Entity | Description | Key Fields |
|---|---|---|
| `Account` | User account | Username (unique), Password, Email (unique), Name, RoleCode, AvatarLink |
| `Customer` | Client/Customer | Code (unique), Name, Phone, Email, Birthday, Gender, Note |
| `AuditLog` | Audit trail | Code, Function, Action, Source, AccountId, ObjectId, ObjectType, OldData, NewData, IpAddress, UserAgent, ExpireAt, Content |
| `Workflow` | Business workflow | Code (unique), Name, TargetType → WorkflowStates |
| `WorkflowState` | Workflow step | Code (unique), Name, TargetType, IsCompleteState, IsHideFromAdmin, Position, WorkflowId |

### 11.2 Business Enums
| Enum | Values |
|---|---|
| BookingStatus | DRAFT, WIP, REVIEW, CONFIRMED, COMPLETED, VERIFIED, SETTLED, CANCELLED |
| BookingTaskStatus | IDLE, PENDING, PLANNING, PROPOSED, APPROVED, REJECTED |
| OnsiteTaskStatus | IDLE, PENDING, ASSIGNED, APPROVED, REJECTED |
| BookingAction | SUBMIT, SUBMIT_FOR_REVIEW, APPROVE, REJECT, CANCEL, COMPLETE, REQUEST_CHANGE, VERIFY, DISPUTE |
| BookingRole | ADMIN, KEY_ACCOUNT, BOOKING, STUDIO |
| HostStatus | PENDING, ARRIVED, ON_AIR, PENDING_CONFIRMATION, COMPLETED |
| HostTier | NANO, MICRO, MACRO, MEGA |
| HostLocation | HN, HCM, Other |
| Industry | BEAUTY, TECH, LIFESTYLE, FMCG, FASHION |
| Platform | TIKTOK, FACEBOOK, YOUTUBE, SHOPEE |
| SettlementFrequency | PER_BOOKING, MONTHLY |
| SettlementStatus | DRAFT, PENDING_BOOKING_REVIEW, PENDING_KA_REVIEW, APPROVED, NEEDS_CORRECTION, PAID |
| DataScopeLevel | OWN, TEAM, BRANCH, GLOBAL |

---

## 8. Priority & Risk Assessment (RBT)

Để phục vụ cho Test Design (Risk-Based Testing), các module được phân loại rủi ro dựa trên tác động Business Impact và Complexity:

| Module / Feature Area | Risk Level | Priority | Lý do / Tác động nếu lỗi (Impact) |
|---|---|---|---|
| **Module 5: Settlements** | **HIGH** | P1 | Liên quan đến tài chính, trả lương Host. Sai duration/rate gây thiệt hại trực tiếp. |
| **Module 3: Host Assignment** | **HIGH** | P1 | Trùng lịch (Hard Conflict) làm rớt phiên Live, ảnh hưởng uy tín với Client. |
| **Module 4: Studio Auto-Allocate**| **HIGH** | P1 | Thuật toán xếp phòng sai sẽ làm hỏng toàn bộ lịch trong ngày của chi nhánh. |
| **Module 2: Booking Lifecycle** | **MEDIUM** | P2 | Lỗi state machine làm kẹt luồng duyệt, nhưng Admin có thể xử lý thủ công. |
| **Module 1: Dashboard** | **LOW** | P3 | Lỗi report/chart không làm sập flow chính. |
| **Module 6/7: Master Data** | **LOW** | P3 | Thao tác CRUD cơ bản, rủi ro thấp nếu không xóa nhầm dữ liệu đang dùng. |

---

## 9. System Constraints, Error Standards & Edge Cases

### 13.1 Boundary Limits & Constraints (NFRs)
- **Time Overlap Tolerance:** 0 phút (Hard block khi overlap đoạn Start Live → End Live).
- **Session Duration:** 15 phút (Min) — 1440 phút (Max/24h).
- **Bulk Limit:** Max 100 bookings/lần Bulk Create.
- **Token Config:** Access Token 60 mins, Refresh Token 7 days.
- **Data Pagination:** Mặc định `pageSize` = 10, tối đa `pageSize` = 100.

### 13.2 Error Code Mapping (Standard Response)
- `400 Bad Request`: Validation Form lỗi (Thiếu required fields, giờ sai).
- `409 Conflict`: Overlap Host/Phòng (Trả về `errors[ {bookingCode, message} ]`).
- `403 Forbidden`: Vi phạm Data Scope (`OWN/TEAM`).
- `422 Unprocessable Entity`: Chuyển State sai (VD: `DRAFT` qua thẳng `COMPLETED`).

### 13.3 Explicit Edge Cases (Test Focus)
1. **Cross-day Booking:** Booking từ 23:00 đến 02:00 sáng. Kiểm tra matrix vắt qua 2 ngày.
2. **Short Notice Setup:** Booking tạo sát giờ (lead time < 7 ngày). Xác nhận chặn hay cảnh báo.
3. **Double Booking Race Condition:** 2 Agent cùng giành phòng tại 1 millisecond.
4. **Time Zone:** FE lưu timezone +7, gọi API theo UTC unix timestamp.

---

## 10. UAT Checklist (Tham khảo)

### Part A: Happy Path (Core Business Flow)
- Validate CRUD operations cơ bản.
- Host/Studio allocation success via Auto/Bulk.
- State transition: Draft → WIP → Review → Confirmed → Completed → Verified → Settled.

### Part B: Alternative & Exception Paths
- Short Notice rules verification.
- Host validation errors (409 Conflict overlaps, 480 mins/day warning).
- Studio collisions (core time hard block, buffer soft warning).
- Attendance edge cases (OT/UT calculations).
- Settlement rejection loop (NEEDS_CORRECTION → PENDING).

### Part C: System Behaviors
- Route Guards & Permissions.
- Task routing (My Tasks vs Inbox).
- Excel exports format.

---

## 11. Source Documents
- [Studio Management FRS V3](https://docs.google.com/document/d/1YrVUjOo4P8rDj6JVugGCr5DORXfA__eW/edit)
- [Host Management FRS V3](https://docs.google.com/document/d/17ytcYWZWwXxoDuuD0URwrrYAGBVaXwdr/edit)
- [My Bookings FRS V3](https://docs.google.com/document/d/10c2AsUuWfBRI2ds7n3nGM2kh2jTmFNQo/edit)
- [UAT Checklist](https://docs.google.com/document/d/10BXJs9klsP2qRv-u6Z6utc5iBROeO5xFANoYNkUZ3P0/edit)
- **Codebase Analysis (2026-04-04):** `vlm-api`, `vlm-gui`, `repomix-outputs`
