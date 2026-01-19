
import json
import logging
import os
from collections import Counter
import sys

# Add project root
sys.path.append(os.getcwd())

INPUT_FILE = "scraped_data_v1.json"

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

def analyze():
    if not os.path.exists(INPUT_FILE):
        logger.error("File not found.")
        return

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    total_items = len(data)
    types_count = Counter()
    sources_count = Counter()
    specs_keys = Counter()
    images_count = 0
    missing_desc = 0

    for item in data:
        types_count[item.get("type", "unknown")] += 1
        sources_count[item.get("source_url", "").split("/")[2]] += 1
        
        if not item.get("description") or len(item["description"]) < 10:
            missing_desc += 1
        
        imgs = item.get("images", [])
        images_count += len(imgs)

        # Specs analysis
        specs = item.get("specs", {})
        if isinstance(specs, dict):
            for k in specs.keys():
                specs_keys[k] += 1
        else:
             logger.warning(f"Specs not dict for {item.get('name')}")

    print("="*40)
    print(f"📊 DATA ANALYSIS REPORT")
    print("="*40)
    print(f"Total Items:       {total_items}")
    print(f"Total Images:      {images_count}")
    print(f"Avg Images/Item:   {images_count/total_items:.1f}" if total_items else "0")
    print("-" * 20)
    print(f"Types:")
    for t, c in types_count.items():
        print(f"  - {t}: {c}")
    print("-" * 20)
    print(f"Sources:")
    for s, c in sources_count.items():
        print(f"  - {s}: {c}")
    print("-" * 20)
    print(f"Quality Issues:")
    print(f"  - Missing Description: {missing_desc}")
    print("-" * 20)
    print(f"Top 10 Specs Keys:")
    for k, c in specs_keys.most_common(10):
        print(f"  - {k}: {c}")
    print("="*40)

if __name__ == "__main__":
    analyze()
