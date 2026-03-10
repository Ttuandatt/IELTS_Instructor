import io
import zipfile

import easyocr
import numpy as np
from PIL import Image

DOCX_PATH = r"D:\IT\Projects\IELTS_Instructor\docs\cam18_reading_test_1.docx"

reader = easyocr.Reader(['en'], gpu=False)

with zipfile.ZipFile(DOCX_PATH) as zf:
    image_names = sorted(
        [name for name in zf.namelist() if name.lower().startswith('word/media/') and name.lower().endswith(('.png', '.jpg', '.jpeg'))]
    )
    for name in image_names:
        data = zf.read(name)
        image = Image.open(io.BytesIO(data)).convert('RGB')
        result_lines = reader.readtext(np.array(image), detail=0, paragraph=True)
        print(f"===== {name} =====")
        for line in result_lines:
            print(line)
        print()
