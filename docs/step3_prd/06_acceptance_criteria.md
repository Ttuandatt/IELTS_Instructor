# ✅ Acceptance Criteria — IELTS Helper (MVP)

> **Mã tài liệu:** PRD-06  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Tham chiếu:** [04_user_stories](04_user_stories.md) | [05_functional_requirements](05_functional_requirements.md)

---

## 1. Quy ước

- **Format:** Gherkin (Given-When-Then) cho mỗi scenario.
- **ID format:** `AC-{story_number}` — matches User Story ID.
- Mỗi AC có thể có nhiều scenarios (happy path, edge cases, error paths).

---

## 2. Authentication & Profile

### AC-101: Đăng ký tài khoản Learner

```gherkin
Feature: User Registration
  Ref: US-101, FR-101

  Scenario: Successful registration
    Given I am on the registration page
    When I enter a valid email "user@example.com" and password "P@ssw0rd!" and confirm password
    Then a new account is created with role "learner"
    And I receive JWT access and refresh tokens
    And I am redirected to the Dashboard

  Scenario: Duplicate email
    Given an account with email "user@example.com" already exists
    When I try to register with the same email
    Then I see error message "Email already registered"
    And no new account is created

  Scenario: Weak password
    Given I am on the registration page
    When I enter email "new@example.com" and password "123"
    Then I see validation error "Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character"

  Scenario: Invalid email format
    Given I am on the registration page
    When I enter email "not-an-email" and a valid password
    Then I see validation error "Please enter a valid email address"
```

---

### AC-102: Đăng nhập

```gherkin
Feature: User Login
  Ref: US-102, FR-102

  Scenario: Successful login
    Given I have a registered account with email "user@example.com"
    When I enter correct email and password
    Then I receive JWT access token (TTL 15 min) and refresh token (TTL 7 days)
    And I am redirected based on my role

  Scenario: Invalid credentials
    Given I am on the login page
    When I enter wrong email or wrong password
    Then I see error "Invalid email or password"
    And no tokens are issued

  Scenario: Role-based redirect
    Given I login as "admin"
    Then I am redirected to Admin CMS
    Given I login as "learner"
    Then I am redirected to Dashboard
```

---

### AC-103: Auto-refresh token

```gherkin
Feature: Token Auto-Refresh
  Ref: US-103, FR-103

  Scenario: Token nearing expiry
    Given my access token expires in less than 2 minutes
    When the frontend interceptor fires
    Then POST /auth/refresh is called with my refresh token
    And I receive a new access token and rotated refresh token
    And my session continues without interruption

  Scenario: Refresh token expired
    Given my refresh token has expired
    When any API call is made
    Then I am redirected to the login page
    And I see message "Session expired. Please log in again."
```

---

### AC-104: Cập nhật profile

```gherkin
Feature: Profile Update
  Ref: US-104, FR-104

  Scenario: Change language
    Given I am on Settings page
    When I change language from "vi" to "en"
    And click Save
    Then the UI switches to English immediately
    And my language preference is persisted

  Scenario: Change theme
    Given I am on Settings page
    When I toggle theme to "dark"
    Then the UI switches to dark mode immediately
    And my theme preference is persisted

  Scenario: Update display name
    Given I am on Settings page
    When I change display_name to "Minh Nguyen"
    And click Save
    Then my display name is updated across the app
```

---

### AC-105: Đăng xuất

```gherkin
Feature: Logout
  Ref: US-105

  Scenario: Successful logout
    Given I am logged in
    When I click Logout
    Then my tokens are removed from local storage
    And I am redirected to the Login page
    And any subsequent API calls return 401
```

---

## 3. Reading Practice

### AC-201: Duyệt danh sách passages

```gherkin
Feature: Reading Catalog
  Ref: US-201, FR-201

  Scenario: Browse all passages
    Given I am a logged-in learner
    When I navigate to Reading Practice
    Then I see a paginated list of published passages
    And each card shows title, level badge, topic tags, question count

  Scenario: Filter by level
    Given I am viewing the passage catalog
    When I select level "B2"
    Then only passages with level B2 are shown

  Scenario: Filter by topic
    Given I am viewing the passage catalog
    When I search topic "environment"
    Then only passages tagged with "environment" are shown

  Scenario: Empty results
    Given I filter by level "C1" and topic "quantum physics"
    When no passages match
    Then I see empty state "No passages found. Try adjusting your filters."
```

---

### AC-202: Xem chi tiết passage

```gherkin
Feature: Reading Detail
  Ref: US-202, FR-202

  Scenario: View passage with questions
    Given I click on a passage from the catalog
    Then I see split view: passage body (left) and questions (right)
    And MCQ questions show radio buttons
    And short answer questions show text input
    And explanations are NOT visible

  Scenario: Passage not found
    Given I navigate to a non-existent passage ID
    Then I see 404 error page
```

---

### AC-203: Timer functionality

```gherkin
Feature: Reading Timer
  Ref: US-203, FR-203, RD-003

  Scenario: Start with default timer
    Given I open a passage detail
    When I click "Start with Timer"
    Then a 20-minute countdown timer appears pinned at top
    And the timer shows mm:ss format

  Scenario: Timer warning
    Given the timer is running
    When less than 3 minutes remain
    Then the timer turns red

  Scenario: Timer expires
    Given the timer is running
    When time reaches 00:00
    Then all answered questions are auto-submitted
    And the submission is flagged as timed_out = true
    And I see my results with "(Timed out)" indicator

  Scenario: Custom timer
    Given I open a passage
    When I select "10 minutes" from timer options
    Then the countdown starts at 10:00

  Scenario: No timer mode
    Given I open a passage
    When I select "No timer"
    Then no countdown is shown
    And I can submit at any time
```

---

### AC-204: Nộp bài Reading

```gherkin
Feature: Reading Submit & Auto-grade
  Ref: US-204, FR-203, RD-001, RD-002

  Scenario: Successful submit (>=80% answered)
    Given a passage has 10 questions
    And I have answered 8 questions
    When I click Submit
    Then the system grades my answers
    And I see score_pct (e.g., 75%)
    And each question shows ✅ or ❌ with explanation

  Scenario: Insufficient answers (<80%)
    Given a passage has 10 questions
    And I have answered only 5 questions
    When I click Submit
    Then I see warning "Please answer at least 3 more questions (5/10 answered)"
    And the submission is NOT processed

  Scenario: MCQ grading
    Given question Q1 is MCQ with answer_key "B"
    And I answered "B"
    Then Q1 is marked ✅ correct

  Scenario: Short answer grading
    Given question Q2 is short answer with answer_key ["carbon dioxide", "CO2"]
    And I answered "Carbon Dioxide"
    Then Q2 is marked ✅ correct (case-insensitive match)

  Scenario: Short answer partial match
    Given question Q3 has answer_key ["photosynthesis"]
    And I answered "the process of photosynthesis in plants"
    Then Q3 is marked ✅ correct (keyword match)

  Scenario: Attempt saved
    Given I successfully submit
    Then the attempt appears in my Reading history
    With passage title, score, duration, and timed_out flag
```

---

### AC-205: Xem lịch sử Reading

```gherkin
Feature: Reading History
  Ref: US-205, FR-204

  Scenario: View history
    Given I have completed 5 reading attempts
    When I navigate to Reading History
    Then I see 5 entries sorted by date (newest first)
    And each entry shows passage title, score_pct, duration, date

  Scenario: Review attempt detail
    Given I click on a history entry
    Then I see the passage, my answers, correct answers, and explanations

  Scenario: No history
    Given I have no reading attempts
    Then I see "No reading history yet. Start your first practice!"
```

---

### AC-206: Làm lại passage

```gherkin
Feature: Retry Reading Passage
  Ref: US-206

  Scenario: Retry creates new attempt
    Given I completed passage "Climate Change" with score 60%
    When I click "Retry"
    Then the passage opens with fresh (unanswered) questions
    And when I submit, a NEW attempt is created
    And the old attempt (60%) is preserved in history
```

---

## 4. Writing Practice

### AC-301: Duyệt prompts

```gherkin
Feature: Writing Prompt Catalog
  Ref: US-301, FR-301

  Scenario: Browse prompts
    Given I am a logged-in learner
    When I navigate to Writing Practice
    Then I see paginated list of published prompts
    And each card shows title, task_type badge, level, topic tags

  Scenario: Filter by task type
    When I select "Task 2"
    Then only Task 2 prompts are shown
```

---

### AC-302: Essay editor

```gherkin
Feature: Writing Editor
  Ref: US-302, FR-302

  Scenario: Word count display
    Given I am writing an essay
    When I type in the editor
    Then the word count updates in real-time

  Scenario: Low word count warning
    Given the prompt is Task 2 (min 250 words)
    When my word count is 180
    Then the word count label turns red
    And tooltip shows "Minimum recommended: 250 words"

  Scenario: Submit still allowed with low word count
    Given my word count is below minimum
    When I click Submit
    Then the essay is submitted (WR-001: warn but don't block)
    And feedback includes low word count note
```

---

### AC-303: Nộp essay và nhận score

```gherkin
Feature: Writing Submit & Scoring
  Ref: US-303, FR-302, WR-001..WR-005

  Scenario: Successful async submission
    Given I have written an essay
    When I click Submit
    Then I see loading state "Scoring your essay..."
    And the API returns {processing_status: "pending", submission_id}
    And the frontend polls every 3 seconds

  Scenario: Scoring completes
    Given my submission is being processed
    When processing finishes successfully
    Then polling returns {processing_status: "done"}
    And I see scores: TR=6.0, CC=5.5, LR=6.0, GRA=5.5, Overall=5.75
    And I see feedback: summary, strengths (bullet list), improvements (bullet list)

  Scenario: Scoring fails after retries
    Given the LLM call fails twice (retries exhausted)
    When I poll the submission
    Then processing_status = "failed"
    And I see "Scoring failed. Please try again later." with retry button

  Scenario: Rate limit exceeded
    Given I have submitted 10 essays today (daily limit)
    When I try to submit another
    Then I see 429 error "Daily submission limit reached (10/10)"
    And the submit button is disabled

  Scenario: Word count below minimum
    Given my essay has 120 words for Task 2
    When scored
    Then feedback includes "Word count (120) is below the recommended minimum of 250 words"
    And TR score may be penalized
```

---

### AC-304: Feedback display

```gherkin
Feature: Writing Feedback Detail
  Ref: US-304, FR-303

  Scenario: View detailed feedback
    Given my submission scoring is done
    Then I see 4 score bars with values (TR, CC, LR, GRA)
    And overall score is displayed prominently
    And color coding: red (<5), yellow (5-6), green (>6)
    And summary paragraph is shown
    And strengths are listed as bullet points
    And improvements are listed as bullet points with suggestions
```

---

### AC-305: Resubmit essay

```gherkin
Feature: Writing Resubmit
  Ref: US-305

  Scenario: Write again for same prompt
    Given I received feedback for prompt "Task 2: Climate"
    When I click "Write Again"
    Then a new editor opens (blank or with copy of previous essay — user choice)
    And when submitted, a NEW submission record is created
    And both attempts appear in my Writing history
```

---

### AC-306: Model tier selection

```gherkin
Feature: Model Tier Selection
  Ref: US-306, WR-003

  Scenario: Default tier
    Given I open the submit form
    Then "Standard" scoring is selected by default

  Scenario: Premium tier
    Given premium scoring is enabled in config
    When I select "Premium" tier
    And submit my essay
    Then the essay is scored using the premium model
    And model_tier = "premium" in the submission record
```

---

### AC-307: Writing history

```gherkin
Feature: Writing History
  Ref: US-307, FR-304

  Scenario: View history
    Given I have submitted 3 essays
    When I navigate to Writing History
    Then I see 3 entries with prompt title, task_type, overall score, status, date

  Scenario: Pending submission in history
    Given I have a pending submission
    Then it appears in history with loading icon
    And auto-refreshes until done/failed
```

---

## 5. Dashboard

### AC-401: Progress summary

```gherkin
Feature: Dashboard Progress
  Ref: US-401, FR-401

  Scenario: View progress
    Given I have completed reading and writing submissions
    When I visit Dashboard
    Then I see Reading card (avg score, completion rate, total attempts)
    And Writing card (avg scores per criterion, total submissions)
    And Recent submissions list (10 items)

  Scenario: Empty state
    Given I am a new learner with no submissions
    Then I see "Welcome! Start your first practice" with CTA buttons
```

---

### AC-402: Recent submissions

```gherkin
Feature: Recent Submissions
  Ref: US-402, FR-401

  Scenario: View recent
    Given I have mixed Reading and Writing submissions
    Then recent list shows 10 latest
    And each item has type icon (📖 or ✍️), title, score, date
    And clicking navigates to detail view
```

---

### AC-403: Trend charts

```gherkin
Feature: Trend Charts
  Ref: US-403, FR-402

  Scenario: View weekly trends
    Given I have data spanning 4 weeks
    When I view trend chart
    Then I see two lines: Reading avg score and Writing avg overall
    And X-axis shows weeks, Y-axis shows score

  Scenario: No data
    Given I have no submissions
    Then chart shows empty state with message
```

---

## 6. Admin CMS

### AC-501: Quản lý passages

```gherkin
Feature: Admin Passage Management
  Ref: US-501, FR-501

  Scenario: Create passage
    Given I am logged in as admin
    When I fill in title, body, level "B2", tags ["science"]
    And click Save
    Then a new passage is created with status "draft"

  Scenario: Edit passage
    Given passage "Climate Change" exists
    When I update the body text
    And click Save
    Then the passage is updated
    And a content_version record is created

  Scenario: Delete passage
    Given passage "Old Article" has 0 submissions
    When I click Delete and confirm
    Then the passage is removed

  Scenario: Validation errors
    Given I create a passage without title
    Then I see "Title is required"
```

---

### AC-504: Publish/Unpublish

```gherkin
Feature: Content Publishing
  Ref: US-504, FR-502, ADM-001

  Scenario: Publish passage
    Given a draft passage exists
    When I click Publish
    Then status changes to "published"
    And the passage appears in learner catalog
    And a content_version is recorded

  Scenario: Unpublish passage
    Given a published passage exists
    When I click Unpublish
    Then status changes to "draft"
    And the passage is hidden from learners
    And existing submissions remain intact
```

---

## 7. NotebookLM Import

### AC-601: Import source

```gherkin
Feature: NotebookLM Source Import
  Ref: US-601, FR-601, SY-001..SY-003

  Scenario: Successful import
    Given I am logged in as admin
    When I enter NotebookLM URL and click Import
    Then the system fetches content and extracts snippets
    And a source record is created with provenance
    And I see list of imported snippets

  Scenario: HTML sanitization
    Given the source content contains HTML tags
    When imported
    Then HTML is stripped and plain text is stored
    And source URL is preserved for reference

  Scenario: Import failure
    Given the URL is unreachable
    When I click Import
    Then I see error "Could not fetch content from this URL"

  Scenario: Cached import
    Given I imported this URL 10 minutes ago
    When I try to import again
    Then the cached result is returned (no re-fetch)
```

---

### AC-602: Attach source to content

```gherkin
Feature: Source Attachment
  Ref: US-602, FR-602, ADM-002

  Scenario: Attach source to passage
    Given source "NotebookLM Climate" exists
    When I edit passage and search for source
    And select and save
    Then the source is linked to the passage
    And provenance shows on passage detail

  Scenario: Required source (ADM-002)
    Given a passage was created from NotebookLM import
    When I try to publish without any attached source
    Then I see warning "Content from NotebookLM must have at least one source attached"
```

---

> **Tham chiếu:** [05_functional_requirements](05_functional_requirements.md) | [11_business_rules](11_business_rules.md) | [09_api_specifications](09_api_specifications.md)
