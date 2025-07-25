const fs = require('fs');
const path = require('path');
const BlinkitScraper = require('./scraper');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

async function main() {
    try {
        console.log('Starting BlinkIt scraping process...');
        
        // Initialize scraper
        const scraper = new BlinkitScraper();
        
        // Load input data (replace with actual input file path)
        const inputFile = process.argv[2] || './data/sample_input.json';
        
        if (!fs.existsSync(inputFile)) {
            console.error(`Input file not found: ${inputFile}`);
            console.log('Please provide a valid input file path as an argument or ensure sample_input.json exists in the data folder');
            process.exit(1);
        }
        
        const inputData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
        console.log(`Loaded ${inputData.length} locations/categories to scrape`);
        
        // Process all scraping tasks
        const allProducts = [];
        let totalProcessed = 0;
        
        for (const item of inputData) {
            const { latitude, longitude, l0_cat, l1_cat, location_name, category_name } = item;
            
            console.log(`\nProcessing: ${location_name} - ${category_name} (${l0_cat}/${l1_cat})`);
            console.log(`Coordinates: ${latitude}, ${longitude}`);
            
            try {
                const products = await scraper.scrapeCategory({
                    latitude,
                    longitude,
                    l0_cat,
                    l1_cat,
                    location_name,
                    category_name
                });
                
                console.log(`Found ${products.length} products`);
                allProducts.push(...products);
                totalProcessed++;
                
                // Add delay between requests to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.error(`Error processing ${location_name} - ${category_name}:`, error.message);
                continue;
            }
        }
        
        console.log(`\nCompleted processing ${totalProcessed}/${inputData.length} locations/categories`);
        console.log(`Total products scraped: ${allProducts.length}`);
        
        // Generate CSV output
        if (allProducts.length > 0) {
            await generateCsvOutput(allProducts);
            console.log('\nScraping completed successfully! Check output.csv for results.');
        } else {
            console.log('\nNo products were scraped. Please check your input data and network connection.');
        }
        
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

async function generateCsvOutput(products) {
    const csvWriter = createCsvWriter({
        path: 'output.csv',
        header: [
            { id: 'product_id', title: 'Product ID' },
            { id: 'product_name', title: 'Product Name' },
            { id: 'brand', title: 'Brand' },
            { id: 'price', title: 'Price' },
            { id: 'discounted_price', title: 'Discounted Price' },
            { id: 'discount_percentage', title: 'Discount Percentage' },
            { id: 'unit', title: 'Unit' },
            { id: 'category', title: 'Category' },
            { id: 'subcategory', title: 'Subcategory' },
            { id: 'availability', title: 'Availability' },
            { id: 'rating', title: 'Rating' },
            { id: 'image_url', title: 'Image URL' },
            { id: 'location_name', title: 'Location Name' },
            { id: 'latitude', title: 'Latitude' },
            { id: 'longitude', title: 'Longitude' },
            { id: 'inventory', title: 'Inventory' },
            { id: 'scraped_at', title: 'Scraped At' }
        ]
    });
    
    await csvWriter.writeRecords(products);
}

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Gracefully shutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM. Gracefully shutting down...');
    process.exit(0);
});

if (require.main === module) {
    main();
}

module.exports = { main };
