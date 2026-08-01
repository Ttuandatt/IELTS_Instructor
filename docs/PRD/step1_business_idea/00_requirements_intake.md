# Business Analysis — Langy
### Nền tảng giao bài, chấm bài AI cho giáo viên IELTS tự do

**Phiên bản:** 1.0 — 04/07/2026
**Phương pháp:** Tổng hợp từ 6 vòng structured elicitation giữa founder và BA, kết hợp phân tích codebase hiện có (repo IELTS_Instructor), post-handoff notes, và nghiên cứu thị trường thứ cấp.
**Trạng thái tài liệu:** Bản nền tảng cho quyết định pilot. Các giả định chưa kiểm chứng được đánh dấu rõ trong Mục 12.

---

## 1. Tóm tắt điều hành

Langy là ứng dụng web giúp giáo viên IELTS tự do (freelance/gia sư) giao bài, thu bài và chấm bài tự động bằng AI trong một hệ thống duy nhất — thay thế workflow thủ công hiện tại (Google Classroom/Zalo + Google Docs + copy-paste từng bài vào ChatGPT + Excel). Điểm khác biệt cốt lõi so với các nền tảng giao bài phổ thông (Azota, SHub Classroom): Langy chuyên sâu một môn, chấm Writing theo 4 tiêu chí band descriptor IELTS, có test player mô phỏng giao diện thi thật, giải thích từng câu Reading, và track tiến bộ theo band.

Chiến lược go-to-market: **teacher-led wedge** — chinh phục giáo viên trước, học sinh vào theo lớp. Khách hàng đầu tiên là chính founder (đang giảng dạy IELTS) và 5 đồng nghiệp trong network cá nhân.

Mô hình doanh thu dự kiến: giáo viên dùng miễn phí, học sinh trả ~50.000đ/tháng, sau giai đoạn pilot miễn phí 8 tuần. Chi phí biên chấm AI ước tính ~120đ/bài (Gemini 2.5 Flash), khiến giá sàn sản phẩm rất thấp và mô hình khả thi về COGS.

**Khuyến nghị chính của BA:** tiến hành pilot 8 tuần với 5 giáo viên theo success/kill metrics đã định nghĩa (Mục 10), sau khi hoàn thành các hạng mục pre-pilot bắt buộc (Mục 14) — trong đó ưu tiên cao nhất là tuân thủ dữ liệu trẻ em (Mục 13) và cơ chế hiển thị band AI là "ước lượng".

---

## 2. Nguồn gốc & chất lượng bằng chứng

| Nguồn | Nội dung | Độ tin cậy |
|---|---|---|
| Founder là user cả hai phía | Vừa tự học IELTS, vừa giảng dạy IELTS/tiếng Anh — trải nghiệm trực tiếp nỗi đau ở cả vai learner và teacher | Cao về chiều sâu, **thấp về đại diện** (n=1, founder biết lập trình — không đại diện cho giáo viên phổ thông) |
| Phỏng vấn có cấu trúc | **Chưa thực hiện.** Câu trả lời "many" ở vòng 1 không được tính là dữ liệu | Không có |
| Bằng chứng chi trả | Con số 50–100k/tháng là **founder tự ước lượng**, chưa có người dùng thật xác nhận | Giả định |
| Nghiên cứu đối thủ | Azota được BA nghiên cứu trong buổi elicitation; founder chưa từng biết đến Azota/SHub trước đó | Trung bình — cần founder tự trải nghiệm Azota trực tiếp |

**Kết luận phần bằng chứng:** Dự án ở trạng thái *solution có trước, validation có sau*. Pilot 8 tuần được thiết kế để chính nó là bước validation — 5 giáo viên đồng nghiệp đóng vai design partner thay cho phỏng vấn thị trường ban đầu.

---

## 3. Vấn đề & Jobs-to-be-done

### 3.1 Nỗi đau của giáo viên (buyer)
Workflow hiện tại được founder mô tả: giao đề qua Google Classroom hoặc link Google Docs gửi qua Zalo/Messenger → học sinh làm bài trên Docs → giáo viên tự chấm tay từng bài, hoặc nếu muốn AI hỗ trợ thì phải **copy-paste từng bài của từng học sinh vào ChatGPT** → báo điểm thủ công qua tin nhắn.

Nỗi đau được đặt tên: **"vòng lặp copy-paste"** — khoảng trống giữa nơi thu bài và nơi AI chấm bài. Đây là job-to-be-done trung tâm của Langy: *"Khi học sinh nộp bài Writing, tôi muốn AI chấm ngay theo chuẩn IELTS để tôi chỉ cần review và bổ sung, thay vì chấm tay hoặc copy-paste từng bài."*

### 3.2 Nỗi đau của học sinh (end user)
Theo quan sát của founder: (1) tài liệu, bài giảng phân tán nhiều nguồn, mất thời gian tìm lại; (2) phải rời trang để tra từ vựng trên Google; (3) **không nhìn thấy mình tiến bộ hay thụt lùi** — không có nơi tổng hợp kết quả thành biểu đồ trực quan.

### 3.3 Phân loại painkiller/vitamin
Founder tự đánh giá đây là công cụ *facilitate* — tức thuộc nhóm **vitamin**: người dùng vẫn sống ổn nếu không có nó. Hệ quả chiến lược: sản phẩm sống bằng retention và thói quen sử dụng hàng tuần, không sống bằng nỗi đau cấp tính. Success metrics (Mục 10) vì thế đo hành vi lặp lại, không đo lượt đăng ký.

---

## 4. Stakeholders & Personas

### 4.1 Giáo viên IELTS tự do — buyer kiêm kênh phân phối
Tự quyết mọi công cụ cho lớp mình, không cần duyệt qua trung tâm — sales cycle ngắn nhất trong các nhóm giáo viên. Dạy lớp ~10–15 học sinh, thu học phí ước 1,5–3 triệu/học sinh/khóa. Giá trị Langy mang lại: tiết kiệm nhiều giờ chấm bài mỗi tuần, dashboard theo dõi cả lớp, kho đề tập trung. Rào cản chuyển đổi lớn nhất (founder xác nhận): mất công nhập lại kho đề, và ngại công nghệ/quen Zalo.

### 4.2 Học sinh — end user, người trả tiền
Không tự chọn Langy — dùng vì giáo viên yêu cầu. Nghịch lý mô hình: người nhận giá trị nhiều nhất (giáo viên) dùng miễn phí, người trả tiền (học sinh) là người bị "ép" dùng. Điều kiện để mô hình đứng vững: học sinh phải nhận được **giá trị riêng đủ lớn** — feedback AI tức thì thay vì chờ nhiều ngày, biểu đồ tiến bộ band, giải thích đáp án từng câu. Đây là giả định số 1 cần pilot kiểm chứng.

### 4.3 Phụ huynh — người chi trả gián tiếp
Với học sinh phổ thông, phụ huynh là người duyệt chi 50k/tháng. Chưa được phân tích sâu — ghi nhận là stakeholder cần quan sát trong pilot.

### 4.4 Founder — admin, developer, giáo viên đầu tiên
Làm Langy ngoài giờ (có việc chính, buổi tối/cuối tuần). Số giờ/tuần cụ thể **chưa được xác định** — open item. Không có deadline bên ngoài.

---

## 5. Thị trường & giải pháp thay thế

Vì go-to-market là teacher-led, đối thủ được phân tích theo lăng kính "giáo viên đang giải quyết vấn đề này bằng gì hôm nay":

| Giải pháp | Điểm mạnh | Điểm Langy khai thác |
|---|---|---|
| **Azota** (300.000+ giáo viên) | Miễn phí cho GV; upload đề Word/PDF → AI tự bóc tách thành đề online; giám sát chống gian lận (phát hiện chuyển tab); có web + app mobile; chấm trắc nghiệm tự động, thống kê điểm | Generic đa môn — **không hiểu IELTS**: bài tự luận GV vẫn chấm tay; không chấm theo band descriptor; không có test player kiểu IELTS; không track band; không giải thích đáp án Reading |
| **SHub Classroom** | Tương tự Azota, phổ biến trong trường phổ thông | Tương tự — không chuyên IELTS |
| **Google Classroom + Zalo + Docs + Excel** | Miễn phí, quen thuộc, không phải học công cụ mới | Vòng lặp copy-paste khi muốn AI chấm; không có thống kê tiến bộ; thu bài rời rạc |
| **ChatGPT thủ công** | Chấm nhanh, GV đã biết dùng | Không gắn với lớp học; phải copy-paste từng bài; kết quả không lưu, không thành dashboard |
| **Study4 / ielts-online-tests** (gián tiếp) | Kho đề khổng lồ, SEO mạnh, HS tự tìm đến | Là công cụ tự học B2C — không có classroom, GV không giao bài/theo dõi được. Không cạnh tranh trực tiếp trong mô hình teacher-led |

**Hai bài học bắt buộc từ Azota** (table stakes thị trường đã thiết lập kỳ vọng):
1. **Import đề từ Word/PDF tự động** — founder đã cam kết đưa vào MVP; repo có sẵn pipeline docx parser làm nền.
2. **Học sinh thao tác được trên điện thoại** — Langy hiện desktop-first; tối thiểu cần responsive tốt cho luồng làm bài của học sinh (không cần app native — đã cắt khỏi scope).

---

## 6. Định vị & Value Proposition

**Câu định vị (một hơi thở):**
> *"Langy giúp giáo viên IELTS tự do giao bài và để AI chấm Writing theo đúng band descriptor — việc mà Azota và Google Classroom bắt họ chấm tay từng bài."*

**Killer feature cho demo 60 giây:** AI chấm Writing theo 4 tiêu chí IELTS (Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range), giáo viên chỉ review và chốt điểm. Lý do chọn: xóa trực tiếp vòng lặp copy-paste (nỗi đau sống động nhất founder mô tả), và là thứ duy nhất trong bộ tính năng mà **không đối thủ nào trong bảng trên làm được**.

Các tính năng hỗ trợ (không phải mũi nhọn pitch): Reading tự chấm + giải thích từng câu, dashboard tiến độ band từng học sinh, kho đề + import docx.

**Nguyên tắc hiển thị điểm AI (cam kết từ vòng 6):** band AI luôn hiển thị là *"ước lượng"* — điểm cuối cùng là của giáo viên. Nguyên tắc này vừa quản trị rủi ro sai lệch band, vừa giữ giáo viên ở vị trí trung tâm (AI là trợ lý, không thay thế).

---

## 7. Phạm vi MVP (6 tháng)

### Trong phạm vi
- Luồng giáo viên: tạo lớp, mời học sinh, giao bài Reading/Writing, review bài AI đã chấm, chốt điểm, dashboard lớp
- AI chấm Writing 4 tiêu chí + feedback chi tiết (đã có backend, cần hoàn thiện review flow)
- Reading tự chấm + giải thích từng câu (đã có)
- Import đề từ file Word/PDF (cam kết MVP — table stakes)
- Dashboard tiến độ học sinh (thay số liệu mock bằng endpoint thật)
- Responsive mobile-web cho luồng làm bài của học sinh
- Rate limiting cho endpoint chấm AI (chống spam chi phí)

### Ngoài phạm vi 6 tháng (founder xác nhận cắt)
Mobile app native · Gamification · Migrate backend sang Spring Boot · Đa ngôn ngữ ngoài Việt/Anh

### Khuyến nghị BA cắt thêm (founder chưa xác nhận — cần chốt)
**Listening, Speaking, word lookup trên màn hình.** Lý do: nguồn lực một người làm ngoài giờ không đủ cho ba hạng mục này song song với MVP + pilot + go-to-market. Đề xuất trạng thái: *deferred — xét lại sau khi pilot đạt success metric.* Đây là điểm bất đồng còn mở giữa BA và founder.

---

## 8. Mô hình kinh doanh & Unit Economics

### 8.1 Dòng tiền
- **Giai đoạn pilot (8 tuần):** miễn phí hoàn toàn. **Có ngày hết hạn cụ thể** — điều kiện bắt buộc để "thu sau" không thành "không bao giờ thu".
- **Sau pilot:** giáo viên miễn phí, học sinh 50.000đ/tháng (mức giá là giả định của founder, chưa validate — sẽ kiểm chứng bằng conversion thật khi hết pilot).
- Chiến lược "lấy số lượng bù giá thấp" chỉ đứng vững khi có cỗ máy tạo số lượng — xem rủi ro Growth loop (Mục 11).

### 8.2 Chi phí biên chấm AI (tính theo giá 07/2026)
Code hiện dùng `gemini-2.5-flash` (đường Google) — giá $0,30/triệu token input, $2,50/triệu token output.

| Thành phần | Ước lượng token | Chi phí |
|---|---|---|
| Input: rubric prompt + đề + essay 300 từ | ~2.500 | $0,00075 |
| Output: JSON feedback 4 tiêu chí | ~1.500 | $0,00375 |
| **Tổng mỗi bài chấm** | | **~$0,0045 ≈ 120đ** |

Kịch bản 1 lớp: 15 HS × 2 bài/tuần × 4 tuần = 120 lượt chấm ≈ **15.000đ/tháng/lớp**. Một học sinh trả 50k/tháng phải nộp ~400 bài mới chạm hòa vốn riêng phần API — không xảy ra thực tế. **Kết luận: COGS không phải rào cản của mô hình giá 50k.**

Tối ưu sẵn có: Batch API Google giảm 50%; context caching giảm ~90% chi phí phần input lặp lại (rubric prompt giống hệt nhau mỗi lần chấm — ứng viên caching hoàn hảo). Điều kiện an toàn chi phí: rate limit per-user trên endpoint submit (Redis sẵn có, chưa cấu hình).

Lưu ý kỹ thuật phát hiện khi audit: nhánh Google trong `llm-client.service.ts` dùng `gemini-2.5-flash` cho **cả hai tier** cheap và premium (placeholder chưa sửa) — cần chốt model premium thật nếu muốn phân tier.

---

## 9. Go-to-market

**Giai đoạn 0 (ngay):** lớp của chính founder — design partner số 0, dùng để làm phẳng mọi lỗi luồng trước khi mời người ngoài.

**Giai đoạn 1 (pilot):** 5 đồng nghiệp giảng dạy trong network cá nhân + lớp của họ. Đây là toàn bộ kênh phân phối hiện có.

**Giai đoạn 2 (sau pilot):** **CHƯA CÓ KẾ HOẠCH** — founder trả lời "để sau". Ghi nhận là open item mức HIGH: giáo viên thứ 6 trở đi đến từ đâu (referral loop? group Facebook giáo viên IELTS? nội dung marketing?) phải được trả lời **trước khi** pilot kết thúc, vì nếu pilot thành công mà không có kênh mở rộng, thành công đó không nhân bản được.

---

## 10. Success metrics & Kill criteria (pilot 8 tuần, 5 giáo viên)

**TIẾP TỤC đầu tư nếu:** ≥3/5 giáo viên tự giao ít nhất 1 bài/tuần ở tuần 7–8 **mà không cần founder nhắc**. (Hành vi giao bài là tín hiệu thật; đăng nhập là tín hiệu rỗng.)

**DỪNG LẠI VÀ NGHĨ LẠI nếu:** ≤1/5 giáo viên còn giao bài ở tuần 8, **hoặc** không có học sinh nào tự quay lại làm bài ngoài giờ bị giao trong suốt pilot.

Metrics phụ cần thu thập trong pilot (không phải điều kiện go/no-go nhưng nuôi các quyết định sau): tỷ lệ giáo viên sửa điểm AI và mức sửa trung bình (calibration data), thời gian giáo viên hoàn thành review 1 bài, tỷ lệ học sinh mở feedback AI, tỷ lệ đề được import từ docx vs dùng kho có sẵn.

---

## 11. Sổ rủi ro

| # | Rủi ro | Mức | Giảm thiểu |
|---|---|---|---|
| R1 | **Dữ liệu cá nhân trẻ em** — phần lớn end user dưới 18 tuổi (nhiều em dưới 16 = trẻ em theo luật VN); essay có thể chứa thông tin riêng tư, được gửi qua API Google/OpenAI (xuyên biên giới). Luật BVDLCN 91/2025/QH15 đã có hiệu lực từ 01/01/2026 | **CAO** | Checklist tuân thủ Mục 13 — bắt buộc hoàn thành các mục tối thiểu trước pilot |
| R2 | **Growth loop chưa tồn tại** — sau 5 đồng nghiệp không có kênh mở rộng | **CAO** | Deadline: trả lời trước tuần 6 của pilot; thiết kế cơ chế referral GV-mời-GV ngay trong sản phẩm |
| R3 | **Founder solo, ngoài giờ, không deadline** — số giờ/tuần chưa xác định; "không có gì khiến tôi bỏ cuộc" là câu trả lời của mọi founder trước khi bỏ cuộc. Không deadline = không nhịp | TRUNG BÌNH–CAO | Tự đặt deadline pilot cụ thể (Mục 14); khai báo số giờ/tuần; nguyên tắc "pilot trước, feature sau" |
| R4 | **AI chấm lệch band** → mất niềm tin cả GV lẫn HS | TRUNG BÌNH | Band AI = "ước lượng", GV chốt (đã cam kết); **bổ sung:** lưu cặp điểm (AI, GV chốt) từ ngày đầu pilot để đo độ lệch — dữ liệu này là tài sản quý nhất của Langy; test bộ essay có điểm examiner thật trước launch trả phí |
| R5 | **Bản quyền nội dung** — mô hình "GV tự upload, GV chịu trách nhiệm" cần được luật hóa; kho đề seed hiện tại có nguồn sưu tầm (bao gồm đề Cambridge trong repo) | TRUNG BÌNH | Điều khoản sử dụng: GV cam kết có quyền với nội dung upload + quy trình gỡ khi có khiếu nại (takedown); **không seed đề Cambridge vào bản trả phí**; kho đề chính thức: tự viết/AI sinh + founder review |
| R6 | **Giá 50k chưa validate** — người trả (HS) không phải người chọn (GV) | TRUNG BÌNH | Pilot đo giá trị riêng cho HS (mở feedback, tự luyện thêm); khảo sát willingness-to-pay ở tuần 6–8 trước khi bật thu phí |
| R7 | **Desktop-only vs chuẩn thị trường mobile** (Azota đã dạy HS nộp bài trên điện thoại) | TRUNG BÌNH | Responsive mobile-web cho luồng làm bài HS trong MVP |
| R8 | Kỹ thuật tồn đọng ảnh hưởng pilot: instructor/admin dashboard còn mock, endpoint `GET /reading/attempts/:id` chưa có (HS không xem lại bài cũ), timer chấm giờ phía client, bug model tier Gemini | TRUNG BÌNH | Đưa vào hạng mục pre-pilot bắt buộc (Mục 14) — ưu tiên các luồng GV/HS chạm trong pilot, bỏ qua admin |

---

## 12. Sổ giả định cần kiểm chứng

| # | Giả định | Cách kiểm chứng trong pilot |
|---|---|---|
| A1 | Giáo viên (không biết code) chịu đổi workflow Zalo/Docs sang Langy | 5 đồng nghiệp onboard không cần founder ngồi cạnh quá buổi đầu; đo tuần giao bài liên tục |
| A2 | Học sinh cảm nhận giá trị riêng (không chỉ "bị thầy bắt dùng") | Tỷ lệ HS mở feedback AI; số HS tự làm bài ngoài giờ giao |
| A3 | Học sinh/phụ huynh chịu trả 50k/tháng | Khảo sát tuần 6–8 + conversion thật khi hết free |
| A4 | AI chấm đủ sát điểm giáo viên | Độ lệch trung bình giữa band AI và band GV chốt ≤0,5 |
| A5 | Import docx hoạt động với đề thật của giáo viên (định dạng lộn xộn) | Đo tỷ lệ import thành công không cần sửa tay trên đề do 5 GV cung cấp |
| A6 | Network 5 giáo viên đủ làm bàn đạp | Ít nhất 1 GV pilot chủ động giới thiệu GV khác mà không được nhờ |

---

## 13. Tuân thủ dữ liệu cá nhân (consult theo yêu cầu founder)

*Lưu ý: đây là phân tích của BA, không phải tư vấn pháp lý. Trước khi thu phí chính thức, nên tham vấn luật sư.*

**Khung pháp lý áp dụng:** Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 (hiệu lực 01/01/2026) và Nghị định 356/2025/NĐ-CP hướng dẫn thi hành (thay thế Nghị định 13/2023). Các điểm chạm trực tiếp đến Langy:

1. **Dữ liệu trẻ em cần bảo vệ ở mức cao hơn** — xử lý dữ liệu cá nhân của trẻ em (dưới 16 tuổi theo Luật Trẻ em) phải có sự đồng ý của người đại diện theo pháp luật; với người dưới 18 nói chung vẫn nên áp dụng chuẩn thận trọng tương đương.
2. **Quyền của chủ thể dữ liệu** — được biết, đồng ý/rút lại đồng ý, truy cập, chỉnh sửa, yêu cầu xóa dữ liệu. Hệ thống cần chức năng xóa tài khoản + dữ liệu bài làm theo yêu cầu.
3. **Chuyển dữ liệu xuyên biên giới** — essay gửi tới API Google/OpenAI (server ngoài VN) thuộc phạm vi quy định về chuyển dữ liệu cá nhân xuyên biên giới; luật có các trường hợp miễn đánh giá tác động cho doanh nghiệp nhỏ/khởi nghiệp — cần xác nhận điều kiện miễn với luật sư khi thương mại hóa.

**Checklist hành động tối thiểu trước pilot:**
- [ ] Privacy policy + Điều khoản sử dụng công khai, viết bằng tiếng Việt dễ hiểu, nêu rõ: dữ liệu nào được thu, bài essay được gửi tới nhà cung cấp AI nào, mục đích, thời gian lưu
- [ ] Luồng đăng ký học sinh dưới 16 tuổi: thu đồng ý của phụ huynh/người giám hộ (trong pilot với lớp quen, có thể qua form + xác nhận của giáo viên với phụ huynh)
- [ ] **Data minimization trước khi gọi API:** chỉ gửi nội dung essay + đề bài; tuyệt đối không gửi tên, email, số điện thoại, tên lớp của học sinh trong prompt
- [ ] **Dùng paid tier của API, không dùng free tier** — free tier của Gemini API cho phép Google dùng dữ liệu để cải thiện model; paid tier thì không. Essay học sinh đi qua free tier là vi phạm tinh thần bảo vệ dữ liệu ngay cả khi có consent
- [ ] Chức năng xóa tài khoản + toàn bộ bài làm theo yêu cầu (quyền yêu cầu xóa đã được luật hóa)
- [ ] Thông báo cho người dùng nếu xảy ra rò rỉ dữ liệu (nghĩa vụ theo luật mới)

---

## 14. Lộ trình khuyến nghị

**Giai đoạn Pre-pilot (4–6 tuần):** hoàn thiện đúng và chỉ những gì pilot cần chạm — luồng instructor (giao bài, review AI, chốt điểm, dashboard lớp thay mock), endpoint xem lại bài cũ của học sinh, import docx end-to-end với đề thật, responsive mobile-web luồng làm bài, rate limit + chuyển paid tier API, band AI gắn nhãn "ước lượng", privacy policy + consent flow, sửa bug model tier. Bỏ qua trong giai đoạn này: admin panel hoàn chỉnh, notifications, mọi thứ trong danh sách cắt.

**Giai đoạn Pilot (8 tuần):** tuần 1–2 chạy với lớp của founder; tuần 3 onboard 5 đồng nghiệp; đo metrics Mục 10 hàng tuần; tuần 6 bắt đầu khảo sát willingness-to-pay và thiết kế growth loop; tuần 8 chốt số liệu.

**Decision gate (kết thúc pilot):** so số liệu với success/kill criteria. Nếu GO: bật thu phí học sinh, triển khai growth loop, mở lại thảo luận Listening. Nếu NO-GO: quay về Vòng 1 với dữ liệu thật trong tay — lúc đó phỏng vấn giáo viên không còn là "không cần" nữa.

**Founder cần tự chốt trong tuần này:** (1) số giờ/tuần cam kết cho Langy; (2) ngày bắt đầu pilot cụ thể — vì "không có deadline" là rủi ro R3, không phải sự tự do.

---

## 15. Các mục còn mở

1. Số giờ/tuần founder dành cho Langy — chưa trả lời
2. Growth loop sau 5 giáo viên — "để sau", deadline trả lời: tuần 6 pilot
3. Xác nhận cắt Listening / Speaking / word lookup khỏi scope 6 tháng — BA khuyến nghị cắt, founder chưa chốt
4. Kiểm tra tên "Langy" (trùng thương hiệu, domain khả dụng)
5. Điều kiện miễn đánh giá tác động chuyển dữ liệu xuyên biên giới cho doanh nghiệp nhỏ — cần tham vấn luật sư trước khi thu phí
