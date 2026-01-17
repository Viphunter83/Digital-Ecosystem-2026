# Data Ingestion Plan

Please organize the input materials in `_input_materials` as follows to ensure the ingestion script (to be developed) can process them correctly.

## Structure

### `/products`
Place product-related files here.
- **Heavy Machinery**: `ТП Шкода W200.docx` -> Parse for "Specs" and "Price".
- **Documentation**: `Prezentacija_Zvezdochka.pdf` -> Extract project details.

### `/customers`
- CRM exports or customer lists in Excel/CSV format.

### `/references`
- Place `Справка_референс_*.xlsx` files here.
- **Parsing Rule**:
  - Row 2 (Index 1): Company Info (Name, INN).
  - Column 2 ("Оборот"): Annual Turnover.
  - Column 8 ("Общая сумма"): Total Contract Sum.

### `/knowledge_base`
- General technical documentation, standards (GOST/ISO), and FAQs.

## Naming Convention
- Use English characters and underscores where possible: `lathe_machine_model_x.pdf`.
- Avoid spaces and special characters.

## Automatic Processing
The backend script will:
1. Scan `_input_materials` periodically or on trigger.
2. Parse Excel/PDF files using `pandas` (for tables) and PDF extractors.
3. Generate embeddings for text/specs using `pgvector`.
4. Store structured data in the `products` table and unstructured chunks in the `documents` table.
