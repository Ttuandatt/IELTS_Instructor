import zipfile

path = r"D:\IT\Projects\IELTS_Instructor\docs\cam18_reading_test_1.docx"
with zipfile.ZipFile(path) as zf:
    data = zf.read("word/document.xml").decode("utf-8", errors="ignore")

print(data[:4000])
