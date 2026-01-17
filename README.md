# Digital Ecosystem 2026

## Overview
A PWA platform for **"RusStankoSbyt"** designed to be the "Super Weapon" for sales. 
The platform serves as a digital catalog and reference system for high-value industrial machinery (e.g., Skoda W200, Lathes, Mills).

## Business Context
- **Core Entity**: ООО «ТД «РусСтанкоСбыт» (RusStankoSbyt).
- **Activity**: Supply of machine tools, spare parts, and metalworking services.
- **Key Metrics**: Annual turnover ~85M RUB (2024). Small, highly efficient team.
- **Key Clients**: Experience with major players (e.g., Zvezdochka, Unipromtech).
- **Goal**: Automate Technical Proposal (TP) generation and visualize the extensive track record.

## Usage
1. **Start Infrastructure**:
   ```bash
   docker-compose up -d --build
   ```
2. **Frontend**: Access at `http://localhost:3000`
3. **Backend API**: Access at `http://localhost:8000/docs`

## Development
- **Frontend**: `apps/frontend`
- **Backend**: `apps/backend`
- **Data**: Place raw files in `_input_materials`
