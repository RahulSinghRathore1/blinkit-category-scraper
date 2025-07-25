BLINKIT PRODUCT SCRAPER
========================

STATUS: ✅ Fully functional and tested with 523 products successfully scraped

OVERVIEW:
This Node.js application successfully extracts real product information from Blinkit's API 
across different locations and categories. It bypasses Cloudflare protection using curl-based 
HTTP requests to collect comprehensive product data.

QUICK START:
1. Extract the archive
2. Run: npm install
3. Run: node index.js

KEY FILES:
- index.js: Main application entry point
- scraper.js: Core scraping engine with Cloudflare bypass
- config.js: API configuration and authentication
- utils.js: Data processing utilities
- data/sample_input.json: Input configuration for locations/categories
- output.csv: Latest scraped results (523 products)
- sample_output.csv: Sample data format

RECENT ACHIEVEMENTS:
✅ API Discovery: Found /v1/layout/listing_widgets endpoint
✅ Cloudflare Bypass: Implemented curl-based requests
✅ Multi-location Scraping: Tested across Gurgaon, Delhi, Mumbai
✅ Large-scale Extraction: 523 total products scraped
✅ CSV Output: Structured data with all product metadata
✅ Pagination Handling: Automatic processing of all products

TECHNICAL FEATURES:
- Real-time product data with prices, inventory, ratings
- Location-based filtering with latitude/longitude
- Category and subcategory targeting
- Rate limiting to avoid API blocking
- Robust error handling with retries
- Professional CSV export for analysis

For detailed documentation, see replit.md