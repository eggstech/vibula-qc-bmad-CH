---
stepsCompleted: ['step-03-risk-and-testability', 'step-04-coverage-plan']
lastStep: 'step-05-generate-output'
lastSaved: '2026-04-07'
workflowType: 'testarch-test-design'
inputDocuments: ['_bmad-output/planning-artifacts/PRD.md', 'repomix-outputs/vlm-api-packed.xml', 'repomix-outputs/vlm-gui-packed.xml']
---

# Test Design for Architecture: Vibula Livestream Management (VLM) Phase 01

**Purpose:** Architectural concerns, testability gaps, and NFR requirements for review by Architecture/Dev teams. 
**Date:** 2026-04-07
**Author:** TEA Master Test Architect
**Status:** Architecture Review Pending
**Project:** VLM-Phase-01
**PRD Reference:** [PRD.md](file:///Users/gryffindor/Desktop/antigra_conversation/bmad-vbl/vlm-testing/_bmad-output/planning-artifacts/PRD.md)
**ADR Reference:** N/A (Included in PRD Section 1.1)

---

## Executive Summary

**Scope:** Hệ thống ERP chuyên biệt quản lý booking livestream từ Planning đến Settlement. Bao gồm 7 module chính: Dashboard, My Bookings, Host Management, Studio Management, Settlements, Audit Trail, Master Data.

**Business Context:**
- **Revenue/Impact:** Tối ưu hóa công suất studio, ngăn chặn 100% lỗi trùng lịch và sai sót thủ công trong quyết toán.
- **Problem:** Rủi ro trùng lịch (phòng/host), khó kiểm soát check-in/out, tốn nhân lực tính toán nghiệm thu thủ công.
- **GA Launch:** Q2 2026 (dự kiến).

**Architecture:**
- **Key Decision 1:** Google OAuth cho Authentication.
- **Key Decision 2:** SignalR cho cập nhật Dashboard Real-time.
- **Key Decision 3:** Stack: Vue 3 (Frontend) + .NET 8 Clean Architecture (Backend) + EF Core.

**Risk Summary:**
- **Total risks**: 4
- **High-priority (≥6)**: 3 risks (Settlements, Conflicts, RBAC Security)
- **Test effort**: ~150-250 tests (~4-6 weeks for 1 QA)

---

## Quick Guide

### 🚨 BLOCKERS - Team Must Decide
**Pre-Implementation Critical Path**:
1. **B1: Google OAuth Bypass/Mocking** - Cần cơ chế đăng nhập giả lập cho test tự động E2E để không phụ thuộc vào Google UI. (Backend/DevOps)
2. **B2: Deterministic Time/Seed Utility** - Cần công cụ để đẩy trạng thái Booking (State Seeding) lên bất kỳ bước nào trong 7 bước vòng đời để test cô lập. (Backend)
3. **B3: SignalR Test Hooks** - Cơ chế xác nhận tin nhắn SignalR đã được gửi thành công từ Backend để Frontend Assert chính xác. (Backend/Frontend)

---

### ⚠️ HIGH PRIORITY - Team Should Validate
1. **R1: Settlement Math Logic** - Khuyến nghị: Unit test 100% cho `SettlementService`. Cần sự phê duyệt của Finance/Lead Dev về bộ test data mẫu.
2. **R2: Concurrency Conflict Detection** - Khuyến nghị: Thực hiện Stress test cho hàm `ValidateBulkAssignHost` để đảm bảo không có race-condition khi nhiều người gán cùng 1 host.

---

### 📋 INFO ONLY - Solutions Provided
1. **Test strategy**: Hybrid (API-first cho logic rủi ro cao, E2E cho hành trình người dùng).
2. **Tooling**: Playwright (API/E2E), xUnit (.NET Unit), Vitest (Vue Unit).
3. **Tiered CI/CD**: PR (Unit/Integration < 10m), Nightly (Full E2E/Stress), Weekly (Security/Regression).

---

## For Architects and Devs - Open Topics 👷

### Risk Assessment

| Risk ID | Category | Description | Prob | Imp | Score | Mitigation | Owner | Timeline |
|---|---|---|---|---|---|---|---|---|
| **R1** | **BUS/DATA** | Sai lệch tính toán trong Settlements (Tiền lương Host) | 2 | 3 | **6** | xUnit tests cho logic + Integration tests cho Rollup. | Dev | Pre-Impl |
| **R2** | **BUS/OPS** | Trùng lịch (Hard Conflict) khi gán Host/Room | 2 | 3 | **6** | Load & Concurrency testing cho hàm Validate API. | Dev/QA | Pre-Impl |
| **R3** | **SEC** | Truy cập trái phép (RBAC failure) | 2 | 3 | **6** | Kiểm thử ma trận quyền cho mọi controller và route. | Dev/QA | Implementation |
| **R4** | **PERF** | Hiệu năng thuật toán Auto-Allocate | 2 | 2 | 4 | Profiling bộ dữ liệu lớn (1000+ bookings). | Dev | Nightly |

---

### Testability Concerns and Architectural Gaps

#### 1. Blockers to Fast Feedback

| Concern | Impact | What Architecture Must Provide | Owner | Timeline |
|---|---|---|---|---|
| **Auth Dependency** | E2E Tests cannot run on CI | Provide a local/bypass JWT generator for test accounts. | DevOps | Setup |
| **SignalR Async** | Flaky Dashboard assertions | Expose a "lastProcessedMessageId" or similar for verification. | Backend | Implementation |

#### 2. Architectural Improvements Needed
1. **Idempotency in Booking Creation**
   - **Current problem:** Gửi yêu cầu 2 lần có thể tạo 2 booking trùng mã.
   - **Required change:** Sử dụng Idempotency-Key hoặc Client-Generated UUID.
   - **Owner:** Backend.

---

### Assumptions and Dependencies

#### Assumptions
1. Môi trường Staging sẽ có cấu hình tài nguyên tương đương Production để test Auto-Allocate.
2. Dữ liệu Master Data (Rooms, Hosts) sẽ được seed trước khi chạy test suite.

#### Dependencies
1. **Common API Client (OpenAPI)** - Cần file Swagger/OpenAPI spec chuẩn để generate test client tự động.

---

**End of Architecture Document**
