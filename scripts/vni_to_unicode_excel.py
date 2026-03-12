import win32com.client
import re
import os

# ==========================================
# VNI Windows to Unicode Complete Dictionary
# ==========================================
# Maps standard VNI composed characters to Unicode equivalents.
VNI_WIN = ["AØ", "AÙ", "AÂ", "AÕ", "EØ", "EÙ", "EÂ", "Ì" , "Í" , "OØ",
    "OÙ", "OÂ", "OÕ", "UØ", "UÙ", "YÙ", "aø", "aù", "aâ", "aõ",
    "eø", "eù", "eâ", "ì" , "í" , "oø", "où", "oâ", "oõ", "uø",
    "uù", "yù", "AÊ", "aê", "Ñ" , "ñ" , "Ó" , "ó" , "UÕ", "uõ",
    "Ô" , "ô" , "Ö" , "ö" , "AÏ", "aï", "AÛ", "aû", "AÁ", "aá",
    "AÀ", "aà", "AÅ", "aå", "AÃ", "aã", "AÄ", "aä", "AÉ", "aé",
    "AÈ", "aè", "AÚ", "aú", "AÜ", "aü", "AË", "aë", "EÏ", "eï",
    "EÛ", "eû", "EÕ", "eõ", "EÁ", "eá", "EÀ", "eà", "EÅ", "eå",
    "EÃ", "eã", "EÄ", "eä", "Æ" , "æ" , "Ò" , "ò" , "OÏ", "oï",
    "OÛ", "oû", "OÁ", "oá", "OÀ", "oà", "OÅ", "oå", "OÃ", "oã",
    "OÄ", "oä", "ÔÙ", "ôù", "ÔØ", "ôø", "ÔÛ", "ôû", "ÔÕ", "ôõ",
    "ÔÏ", "ôï", "UÏ", "uï", "UÛ", "uû", "ÖÙ", "öù", "ÖØ", "öø",
    "ÖÛ", "öû", "ÖÕ", "öõ", "ÖÏ", "öï", "YØ", "yø", "Î" , "î" ,
    "YÛ", "yû", "YÕ", "yõ"]

UNICODE = ["À", "Á", "Â", "Ã", "È", "É", "Ê", "Ì", "Í", "Ò",
    "Ó", "Ô", "Õ", "Ù", "Ú", "Ý", "à", "á", "â", "ã",
    "è", "é", "ê", "ì", "í", "ò", "ó", "ô", "õ", "ù",
    "ú", "ý", "Ă", "ă", "Đ", "đ", "Ĩ", "ĩ", "Ũ", "ũ",
    "Ơ", "ơ", "Ư", "ư", "Ạ", "ạ", "Ả", "ả", "Ấ", "ấ",
    "Ầ", "ầ", "Ẩ", "ẩ", "Ẫ", "ẫ", "Ậ", "ậ", "Ắ", "ắ",
    "Ằ", "ằ", "Ẳ", "ẳ", "Ẵ", "ẵ", "Ặ", "ặ", "Ẹ", "ẹ",
    "Ẻ", "ẻ", "Ẽ", "ẽ", "Ế", "ế", "Ề", "ề", "Ể", "ể",
    "Ễ", "ễ", "Ệ", "ệ", "Ỉ", "ỉ", "Ị", "ị", "Ọ", "ọ",
    "Ỏ", "ỏ", "Ố", "ố", "Ồ", "ồ", "Ổ", "ổ", "Ỗ", "ỗ",
    "Ộ", "ộ", "Ớ", "ớ", "Ờ", "ờ", "Ở", "ở", "Ỡ", "ỡ",
    "Ợ", "ợ", "Ụ", "ụ", "Ủ", "ủ", "Ứ", "ứ", "Ừ", "ừ",
    "Ử", "ử", "Ữ", "ữ", "Ự", "ự", "Ỳ", "ỳ", "Ỵ", "ỵ",
    "Ỷ", "ỷ", "Ỹ", "ỹ"]

# Combine into a dictionary
mapping = {}
for i in range(len(VNI_WIN)):
    mapping[VNI_WIN[i]] = UNICODE[i]

# CRITICAL: Sort keys by length DESCENDING. This solves partial replacement bugs.
# E.g., 'öù' (ứ) must be processed before 'ö' (ư) to prevent "ưủng". 
sorted_keys = sorted(mapping.keys(), key=len, reverse=True)

# Compile a single-pass regex to avoid double-replacement loops (CÓ -> CĨ).
pattern = re.compile("|".join(re.escape(k) for k in sorted_keys))

def looks_like_vni(text):
    """Heuristic to check if text contains VNI characters to avoid corrupting standard Unicode."""
    vni_chars = ['ñ', 'Ñ', 'ô', 'Ô', 'ö', 'Ö', 'ù', 'Ù', 'ø', 'Ø', 'û', 'Û', 'õ', 'Õ', 'ï', 'Ï', 'â', 'Â', 'ê', 'Ê', 'á', 'Á', 'à', 'À', 'å', 'Å', 'ã', 'Ã', 'ä', 'Ä', 'é', 'É', 'è', 'È', 'ë', 'Ë', 'æ', 'Æ']
    pure_uni = re.search(r'[ếềệễểợờỡởứừữửựắằẵặẳ]', text, re.IGNORECASE)
    has_vni = any(c in text for c in vni_chars)
    if pure_uni and not has_vni:
        return False
    return has_vni

def convert_vni_to_uni_exact(text):
    """Safely converts a VNI-encoded string to Unicode."""
    if not isinstance(text, str):
        return text
    if not text.strip() or not looks_like_vni(text):
        return text
    # Replace all matches simultaneously through regex lambda
    return pattern.sub(lambda m: mapping[m.group(0)], text)

def fix_excel_file(file_path):
    """Uses COM to open Excel in the background and convert VNI font cells to Unicode."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Cannot find Excel file: {file_path}")

    print(f"Opening {file_path}")
    # Requirement: pywin32
    excel = win32com.client.Dispatch("Excel.Application")
    excel.Visible = False
    excel.DisplayAlerts = False
    
    wb = None
    try:
        wb = excel.Workbooks.Open(file_path)
        for sheet in wb.Sheets:
            print(f"Processing sheet: {sheet.Name}")
            used_range = sheet.UsedRange
            values = used_range.Value
            if not values:
                continue
                
            has_changes = False
            
            # Values come back as tuple of tuples (rows of columns)
            if isinstance(values, (tuple, list)):
                new_values = []
                for row in values:
                    new_row = list(row)
                    for i, cell in enumerate(new_row):
                        if isinstance(cell, str):
                            new_val = convert_vni_to_uni_exact(cell)
                            if new_val != cell:
                                has_changes = True
                            new_row[i] = new_val
                    new_values.append(new_row)
            elif isinstance(values, str):
                new_values = convert_vni_to_uni_exact(values)
                if new_values != values:
                    has_changes = True
            else:
                new_values = values

            if has_changes:
                used_range.Value = new_values

            # Update fonts from old formats to Arial so text displays correctly
            try:
                font_name = used_range.Font.Name
                if isinstance(font_name, str) and ("VNI" in font_name.upper() or "TCVN" in font_name.upper()):
                    used_range.Font.Name = "Arial"
                elif font_name is None: # Mixed fonts
                    used_range.Font.Name = "Arial"
            except Exception as e:
                pass

        print("Saving and closing...")
        wb.Save()
        wb.Close()
        print("Done! All VNI text converted to Unicode successfully.")
        
    except Exception as e:
        print(f"COM Error: {e}")
        if wb:
            try:
                wb.Close(SaveChanges=False)
            except:
                pass
    finally:
        excel.Quit()

if __name__ == "__main__":
    # Example usage:
    # target_file = r"C:\Path\To\Your_VNI_Excel.xlsx"
    # fix_excel_file(target_file)
    print("VNI to Unicode converter script loaded.")
