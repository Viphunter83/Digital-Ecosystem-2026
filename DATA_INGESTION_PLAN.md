# Data Ingestion Plan

Please organize the input materials in `_input_materials` as follows to ensure the ingestion script (to be developed) can process them correctly.

## Structure

### `/products`
Place product-related files here. Create a subfolder for each product category or specific machine if possible, but a flat list is also acceptable if well-named.
- **Excel/CSV**: `metrics.xlsx` or `specs.csv` containing technical specifications.
- **Images**: `*.jpg`, `*.png` (High resolution preferred).
- **PDF**: Manuals, brochures.

### `/customers`
- CRM exports or customer lists in Excel/CSV format.

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
