# 🛒 BlinkIt Product Scraper

**Status:** ✅ Fully functional — tested with 523 products successfully scraped  
**Language:** Node.js  
**Output:** `output.csv` — structured product dataset

---

## 🔍 Overview

This Node.js-based scraper extracts real product data from BlinkIt’s public API across various cities and subcategories.  
It collects prices, inventory, units, brand, availability, and more using category IDs and lat/lon values.

✅ Uses BlinkIt’s `listing_widgets` endpoint  
✅ Handles pagination, rate limits, and retries  
✅ Outputs a clean CSV with full product metadata  

---

## 🚀 Quick Start

1. Clone the repo or extract the zip  
2. Install dependencies:
   ```bash
   npm install
 Note: BlinkIt may return 403 Forbidden if authentication headers (auth_key, device_id, session_uuid) expire.
This script worked during testing and produced valid output (output.csv with 523 products).
>  **Note:** BlinkIt may return `403 Forbidden` if authentication headers (`auth_key`, `device_id`, `session_uuid`) expire.  
> This script worked during testing and produced valid output (`output.csv` with 523 products).


