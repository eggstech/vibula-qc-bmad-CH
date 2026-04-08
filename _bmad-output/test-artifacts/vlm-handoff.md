---
title: 'TEA Test Design → BMAD Handoff Document'
version: '1.0'
workflowType: 'testarch-test-design-handoff'
inputDocuments: ['_bmad-output/test-artifacts/test-design-architecture.md', '_bmad-output/test-artifacts/test-design-qa.md']
sourceWorkflow: 'testarch-test-design'
generatedBy: 'TEA Master Test Architect'
generatedAt: '2026-04-07'
projectName: 'VLM-Phase-01'
---

# TEA → BMAD Integration Handoff

## Purpose
Tài liệu này kết nối kết quả thiết kế kiểm thử (TEA) với quy trình tạo Epic/Story của BMAD. Nó cung cấp các hướng dẫn về chất lượng, rủi ro và các kịch bản kiểm thử trọng yếu (P0/P1) để đưa vào tiêu chí nghiệm thu (Acceptance Criteria).

## TEA Artifacts Inventory

| Artifact | Path | BMAD Integration Point |
|---|---|---|
| Architecture Doc | `_bmad-output/test-artifacts/test-design-architecture.md` | Epic quality requirements, blockers |
| QA Test Design | `_bmad-output/test-artifacts/test-design-qa.md` | Story acceptance criteria |

## Epic-Level Integration Guidance

### Risk References
- **R1 (Financial Accuracy):** Mọi Epic liên quan đến Settlements phải có bước kiểm tra logic tính toán (Unit test) đạt 100% pass trước khi merge.
- **R2 (Conflict Prevention):** Mọi Epic thay đổi logic Booking/Scheduling phải vượt qua bài Stress test về trùng lịch.

### Quality Gates
- **Phase 3 (Solutioning) → Phase 4 (Implementation):** 100% P0 risks phải có kịch bản giảm thiểu (Mitigation) được phê duyệt.
- **Phase 4 (Implementation) → Release:** 100% P0/P1 tests phải PASS.

## Story-Level Integration Guidance

### P0/P1 Test Scenarios → Story Acceptance Criteria
1. **Story: Host Assignment**
   - [ ] AC: Hệ thống phải báo lỗi 409 khi gán Host vào slot đã có lịch (Hard Conflict).
   - [ ] AC: Hệ thống phải cảnh báo khi khoảng cách giữa 2 phiên live < `hostBuffer`.
2. **Story: Settlement Creation**
   - [ ] AC: Biên bản nghiệm thu phải khớp 100% với đơn giá (`baseRate`) và thời lượng thực tế (`duration`).
   - [ ] AC: Phải ghi nhận Audit Log khi Admin thay đổi trạng thái Settlement sang PAID.

## Risk-to-Story Mapping

| Risk ID | Category | P×I | Recommended Epic | Test Level |
|---|---|---|---|---|
| R1 | BUS/DATA | 6 | Epic: Settlements & Billing | Unit/Integration |
| R2 | BUS/OPS | 6 | Epic: Smart Scheduling Logic | API/Integration |
| R3 | SEC | 6 | Epic: RBAC & Identity | API/E2E |

---
**Tài liệu này sẵn sàng để được sử dụng bởi lệnh `/bmad CE` (Create Epics and Stories).**
