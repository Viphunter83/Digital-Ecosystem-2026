import os
import pandas as pd
from docx import Document
from bs4 import BeautifulSoup
import glob

INPUT_DIR = "../../_input_materials"

def analyze_html(filepath):
    print(f"\n--- Analyzing HTML: {os.path.basename(filepath)} ---")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'lxml')
            # Extract headers and first paragraph to get gist
            headers = [h.get_text(strip=True) for h in soup.find_all(['h1', 'h2', 'h3'])]
            print("Headers:", headers[:10])
            text = soup.get_text(separator=' ', strip=True)
            print("Preview:", text[:500])
    except Exception as e:
        print(f"Error reading HTML: {e}")

def analyze_docx(filepath):
    print(f"\n--- Analyzing DOCX: {os.path.basename(filepath)} ---")
    try:
        doc = Document(filepath)
        text = [p.text for p in doc.paragraphs if p.text.strip()]
        print("Title/First Lines:", text[:5])
        # Look for keywords like "Цена", "Срок", "Характеристики"
        keywords = ["Цена", "Стоимость", "Характеристики", "Модель", "Срок"]
        found = {k: [] for k in keywords}
        for line in text:
            for k in keywords:
                if k in line:
                    found[k].append(line.strip())
        print("Key findings:", {k: v[:2] for k, v in found.items() if v})
    except Exception as e:
        print(f"Error reading DOCX: {e}")

def analyze_excel(filepath):
    print(f"\n--- Analyzing EXCEL: {os.path.basename(filepath)} ---")
    try:
        df = pd.read_excel(filepath)
        print("Columns:", df.columns.tolist())
        print("First 3 rows:", df.head(3).to_dict(orient='records'))
    except Exception as e:
        print(f"Error reading Excel: {e}")

def main():
    # HTML
    for f in glob.glob(os.path.join(INPUT_DIR, "*.html")):
        analyze_html(f)
    
    # DOCX
    for f in glob.glob(os.path.join(INPUT_DIR, "*.docx")):
        analyze_docx(f)
    
    # EXCEL
    for f in glob.glob(os.path.join(INPUT_DIR, "*.xlsx")):
        analyze_excel(f)

if __name__ == "__main__":
    main()
