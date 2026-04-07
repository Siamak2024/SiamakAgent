# APQC Source Files

## Required File

Place your APQC Process Classification Framework Excel file here:

**Expected Filename:**
```
K016808_APQC Process Classification Framework (PCF) - Cross-Industry - Excel Version 8.xlsx
```

**Where to get it:**
1. Download from APQC website: https://www.apqc.org/
2. Ensure you have the Cross-Industry version (Excel format)
3. Version 8.0 or later recommended

## After Placing File

Run the converter:
```bash
node scripts/convert_apqc_to_json.js
```

This will generate the JSON files needed for platform integration.

## File Structure Expected

The converter expects columns such as:
- ID / Code (hierarchy identifier like "1.0", "1.1", "1.1.1")
- Name / Process / Category
- Description
- Level indicators

*Note: The converter script auto-detects hierarchy based on ID format. Adjust column mappings in `convert_apqc_to_json.js` if your Excel structure differs.*
