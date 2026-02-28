# 📊 Phân tích ieltsonlinetests.com — Reference cho IELTS Instructor

> Phân tích ngày 2026-02-22, dựa trên nội dung scraping từ 5+ trang chính.

---

## 1. Site Structure & Navigation

### Main Navigation (Mega Menu)

```
├── IELTS Exam Library
│   ├── Listening Tests
│   ├── Reading Tests
│   ├── Writing Tests
│   ├── Speaking Tests
│   └── IELTS Test Collection
│
├── IELTS Tips
│   ├── IOT News
│   ├── Listening Tips
│   ├── Reading Tips
│   ├── Speaking Tips
│   ├── Writing Tips
│   ├── IELTS Grammar
│   └── Announcements
│
├── IELTS Prep (Premium)
│   ├── Writing Services
│   │   ├── AI Examiner Evaluation
│   │   ├── Human Examiner Evaluation
│   │   ├── Sample Essays (Academic)
│   │   └── Sample Essays (GT)
│   ├── Speaking Services
│   │   ├── AI Examiner Evaluation
│   │   └── Human Examiner Evaluation
│   ├── Listening Super PDF Pack
│   ├── Reading Super PDF Pack
│   ├── Video Learning
│   ├── Self-Study Course
│   ├── Live Lessons (Recorded)
│   └── Video Courses
│
├── IELTS MasterClass (Courses)
├── IELTS AI Test
├── IELTS Live Lessons
└── Study Abroad
```

> [!IMPORTANT]
> **Key takeaway:** Họ phân chia rõ ràng giữa **Free** (Exam Library) và **Premium** (Prep Services, MasterClass, AI Test). Đây là mô hình freemium rất hiệu quả.

---

## 2. Homepage Design Patterns

### 2.1 Hero Section (Carousel/Slider)
- **3 slides** xoay vòng:
  1. "THE #1 GLOBAL IELTS ONLINE STUDY PLATFORM" — CTA: Start now → Exam Library
  2. "BREAKTHROUGH your band score with SPECIALIZED IELTS courses" → MasterClass
  3. "Where would you like to study abroad?" → Các nước (UK, Australia, Canada, US)
- **Pattern:** Full-width hero slider với gradient overlay, text lớn, CTA buttons nổi bật

### 2.2 Live Lessons Section
- Cards hiển thị upcoming **live lessons** với tiêu đề, speaker, nút "Register"
- Pattern: Horizontal scroll cards, mỗi card có thumbnail, title, speaker info

### 2.3 Mock Test Collection
- "Explore Our Collection of International Standard IELTS Mock Tests"
- CTA đẩy đến Exam Library
- Hiển thị các bộ đề theo năm/tháng

### 2.4 6-Step Learning Path ⭐
Đây là UI rất đáng tham khảo:

| Step | Name | Mô tả |
|------|------|--------|
| 1 | **Placement Test** | Thi đầu vào đánh giá trình độ |
| 2 | **Live Lesson** | Học trực tuyến với giáo viên |
| 3 | **Intensive Course** | Khóa học chuyên sâu |
| 4 | **Free IELTS Mock Test** | Thi thử miễn phí |
| 5 | **Mock Test with AI** | AI chấm bài chi tiết |
| 6 | **Unlock Full Services** | Mở khóa services đầy đủ |

### 2.5 Social Proof Section
- "Millions of positive reviews from learners worldwide"
- Links đến TikTok, Facebook, YouTube
- Partner logos section
- **35 triệu+** students, **120 countries**, **120+ mock tests**

### 2.6 FAQ Section
- Accordion-style FAQ (7 câu hỏi phổ biến)
- Ví dụ: "How to take Writing test?", "Are all tests free?", "How to analyze performance?"

---

## 3. Exam Library (Trang quan trọng nhất)

### 3.1 Tabs & Filters

```
[All Tests]  [Academic Test]  [General Training Test]

Filter by skill: [All Skills] [Listening] [Reading] [Writing] [Speaking]
```

### 3.2 Test Collections
- Sắp xếp theo **năm → tháng** (2025, 2024, 2023, 2022, 2021)
- Mỗi tháng là 1 card hiển thị:
  - Tên: "IELTS Mock Test 2025 January"
  - **Số lượt thi**: "2,256,017 tests taken" ← social proof rất mạnh
  - Link vào collection detail

### 3.3 Collection Detail Page
Mỗi collection chứa **nhiều Practice Tests**, mỗi test có:

```
Practice Test 1
├── Listening  [Take Test]
├── Reading    [Take Test]
├── Writing    [Take Test]
├── Speaking   [Take Test]
└── Full Test  [Start]
```

### 3.4 Test Mode Selection ⭐
Khi nhấn "Take Test", hiện modal chọn mode:

| Mode | Mô tả |
|------|--------|
| **Practice Mode** | Chọn part/task muốn luyện + chọn time limit tùy ý |
| **Simulation Mode** | Đúng format thi thật, timer chuẩn, không pause |
| **Full Test** | Bao gồm cả 4 kỹ năng, ~3 giờ |

> [!TIP]
> **Practice Mode vs Simulation Mode** là một feature rất hay mà ta nên áp dụng. Cho phép user linh hoạt giữa "tự do luyện tập" và "giả lập thi thật".

---

## 4. AI Scoring System (IELTS AI Test)

### 4.1 Selling Points
1. **Detailed feedback in just 30 minutes** — cam kết thời gian
2. **Cambridge-standard test sets** — uy tín
3. **Professional AI examiner from 40 million tests** — trained trên data lớn

### 4.2 Scoring Breakdown

#### Writing — 4 tiêu chí IELTS chính thức:
| Criteria | Mô tả |
|----------|--------|
| **Task Achievement (TR)** | Mức độ đáp ứng yêu cầu đề bài, tính thuyết phục |
| **Coherence & Cohesion (CC)** | Liên kết ý tưởng, logic mạch lạc |
| **Lexical Resource (LR)** | Sử dụng từ vựng đa dạng, chính xác |
| **Grammatical Range & Accuracy (GRA)** | Đa dạng và chính xác cấu trúc ngữ pháp |

#### Reading/Listening — 3 phần chính:
1. **Detailed answers for each question** — giải thích từng câu
2. **Question type analysis** — phân loại câu hỏi
3. **Improvement strategies** — chiến lược cải thiện
4. **Track progress and weaknesses** — theo dõi điểm yếu

### 4.3 Feedback Flow
```
Test submit → AI Analysis (30 min) → Results:
  ├── Overall band score
  ├── Score per criteria (TR/CC/LR/GRA for Writing)
  ├── Detailed feedback per section
  ├── Personalized improvement plan
  └── Progress tracking over time
```

> [!NOTE]
> Họ dùng **30 phút** cho AI feedback. So với target **5 phút** của IELTS Instructor (Writing), ta nhanh hơn nhiều. Đây là lợi thế cạnh tranh.

---

## 5. MasterClass (Courses) — Premium Feature

### 5.1 Course Levels (IELTS Band → Course Name)

| Target Band | Course |
|-------------|--------|
| 2.5 → 3.5 | MasterClass 3 |
| 3.5 → 4.5 | MasterClass 4 |
| 4.5 → 5.5 | MasterClass 5 |
| 5.5 | IELTS Exam Ready |
| 6.5 | MasterClass 6 |
| 7.0 | Intensive Speaking & Writing |
| 7.0+ | MasterClass 7 |

### 5.2 Key Features
- Max 14 students/class
- Learning Pyramid + Spaced Repetition methodology
- LMS (Learning Management System) riêng
- Highly qualified teachers (8.0+ IELTS)

---

## 6. Tips & Content Section

- Bài viết chia theo skill: Listening Tips, Reading Tips, Speaking Tips, Writing Tips
- Grammar riêng: IELTS Grammar section
- News & Announcements

> [!TIP]
> Section "Tips" là content marketing rất hiệu quả. Ta có thể tích hợp tính năng tương tự trong IELTS Instructor ở phase sau.

---

## 7. So sánh với IELTS Instructor hiện tại

| Feature | ieltsonlinetests.com | IELTS Instructor (hiện tại) | Gap |
|---------|---------------------|---------------------------|-----|
| **Exam Library** | Theo năm/tháng, Academic/GT tabs, filter by skill | Theo CEFR level, chỉ có Reading + Writing | ⚠️ Thiếu filter giao diện đẹp |
| **Test Modes** | Practice Mode + Simulation Mode + Full Test | Chưa có mode selection | ❌ Cần thêm |
| **AI Scoring** | Writing + Speaking, 30 phút, 4 tiêu chí | Writing only (chưa implement), 5 phút target | 🔄 Sprint 3 |
| **Timer** | Có, chuẩn format thi thật | Chưa implement | ❌ Sprint 4 |
| **Social Proof** | Số lượt thi per test, reviews | Chưa có | 🔜 |
| **Live Lessons** | Real-time với giáo viên | Không có | N/A (out of scope) |
| **Tips/Blog** | Bài viết theo skill | Không có | 🔜 Phase 2 |
| **Multi-language** | EN, ZH, VI, TH | VI, EN | ✅ Tương đương |
| **Placement Test** | Test đầu vào để xác định level | Chưa có | 🔜 |
| **Progress Tracking** | Track weaknesses, progress over time | Dashboard basic | 🔄 |
| **Study Plan** | 6-step pathway | Chưa có | 🔜 |
| **Instructor Role** | Human examiner evaluation | Instructor view submissions | ✅ Có |
| **Admin CMS** | N/A (nội bộ) | Full CRUD | ✅ Có |

---

## 8. Recommendations cho IELTS Instructor — Ưu tiên

### 🔴 Priority 1 — Sprint 3 (Đang đến)

| # | Feature | Tham khảo từ IOT | Áp dụng |
|---|---------|-------------------|---------|
| 1 | **AI Writing Scoring** | 4 tiêu chí (TR/CC/LR/GRA), feedback chi tiết, improvement plan | Implement scoring pipeline đã thiết kế trong context_snapshot |
| 2 | **Score Display UI** | Band score tổng + breakdown theo 4 tiêu chí, progress bars | Score bars UI trên frontend |
| 3 | **Feedback Detail** | Strengths, improvements, personalized suggestions | Structured JSON feedback |

### 🟡 Priority 2 — Sprint 4

| # | Feature | Tham khảo từ IOT | Áp dụng |
|---|---------|-------------------|---------|
| 4 | **Practice vs Simulation Mode** | Chọn mode trước khi bắt đầu test | Modal chọn mode + timer cho Simulation |
| 5 | **Timer System** | Countdown chuẩn IELTS (60 min Reading, 60 min Writing) | Timer component + timed_out flag |
| 6 | **Question Explanations** | Explanation per question sau khi nộp | Hiển thị explanation từ DB |

### 🟢 Priority 3 — Sprint 5+

| # | Feature | Tham khảo | Áp dụng |
|---|---------|-----------|---------|
| 7 | **Test Stats** | "2,256,017 tests taken" per collection | Đếm submissions per passage/prompt |
| 8 | **Filtering UI** | Tabs (Academic/General) + Filter by skill | Enhanced filter chips UI |
| 9 | **Study Path** | 6-step learning journey | Guided onboarding flow |
| 10 | **Placement Test** | Test đầu vào → recommend level | Auto-suggest CEFR level |
| 11 | **Tips/Blog** | Content marketing per skill | Blog module |
| 12 | **Progress Analytics** | Track weaknesses, question type analysis | Enhanced dashboard |

---

## 9. UI/UX Design Patterns đáng học hỏi

### Layout Patterns
1. **Card Grid** — Tests hiển thị dạng card grid responsive với thumbnail, title, stats
2. **Tab Navigation** — Academic/General + Skill filters dạng pills/tabs
3. **Modal Selection** — Practice Mode vs Simulation Mode qua modal overlay
4. **Accordion FAQ** — Collapsible FAQ sections
5. **Mega Menu** — Navigation đa cấp với dropdown categories
6. **Hero Slider** — Full-width carousel với gradient overlays

### Design Tokens (ước lượng từ content analysis)
- **Primary Color:** Blue tông (#1a73e8 hoặc tương tự)
- **Accent:** Orange/Gold cho CTAs
- **Background:** White chính, light gray sections
- **Typography:** Sans-serif, heading lớn, body readable
- **Spacing:** Generous padding, clear visual hierarchy
- **Cards:** Rounded corners, subtle shadows, hover effects

### Social Proof Patterns
- Số lượt thi ngay trên card
- Partner logos strip
- Testimonial slider
- TikTok/FB/YouTube social links

---

## 10. Tổng kết

### Mô hình của ieltsonlinetests.com:
```
Free Layer: Exam Library (mock tests miễn phí, tự chấm)
   ↓ upsell
AI Layer: AI-scored Writing & Speaking (30 min feedback)
   ↓ upsell
Premium Layer: MasterClass + Human Examiner + Live Lessons
```

### Mô hình IELTS Instructor nên nhắm đến:
```
Free Layer: Reading practice (auto-grading) + Writing practice (basic)
   ↓
AI Layer: AI Writing Scoring (5 min feedback - lợi thế về tốc độ!)
   ↓
Instructor Layer: Human review + override AI score + comments
   ↓
Admin Layer: CMS + User management + Analytics
```

> [!IMPORTANT]
> **Lợi thế cạnh tranh chính của IELTS Instructor:**
> 1. **Tốc độ feedback:** 5 phút vs 30 phút của IOT
> 2. **Instructor oversight:** AI + Human hybrid (instructor có thể review/override)
> 3. **CEFR-based content:** Phân loại theo level rõ ràng hơn
> 4. **Self-hosted:** Kiểm soát dữ liệu, customize tùy ý
