const fs = require('fs');

/**
 * Add delay between requests
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse product data from API response
 */
function parseProductData(product, metadata) {
    try {
        const currentTime = new Date().toISOString();
        
        // BlinkIt API structure handling
        const productId = product.identity?.id || product.product_id || product.id || '';
        const productName = product.name?.text || product.display_name?.text || product.name || product.display_name || '';
        const brandName = product.brand_name?.text || product.brand || '';
        const unit = product.variant?.text || product.unit || '';
        
        // Price extraction from BlinkIt format
        const priceText = product.normal_price?.text || product.price || '';
        const price = extractPrice(priceText);
        
        // Image URL extraction
        const imageUrl = product.image?.url || product.media_container?.items?.[0]?.image?.url || '';
        
        // Inventory/availability
        const inventory = product.inventory || 0;
        const isAvailable = !product.is_sold_out && inventory > 0;
        
        return {
            product_id: productId,
            product_name: productName,
            brand: brandName,
            price: price,
            discounted_price: price, // BlinkIt doesn't seem to separate these in this format
            discount_percentage: 0,
            unit: unit,
            category: metadata.category_name || '',
            subcategory: '',
            availability: isAvailable ? 'In Stock' : 'Out of Stock',
            rating: 0, // Not available in basic product listing
            image_url: imageUrl,
            location_name: metadata.location_name || '',
            latitude: metadata.latitude || 0,
            longitude: metadata.longitude || 0,
            scraped_at: currentTime,
            inventory: inventory
        };
    } catch (error) {
        console.error('Error parsing product data:', error.message);
        console.log('Product data sample:', JSON.stringify(product, null, 2).substring(0, 500));
        return null;
    }
}

/**
 * Extract price from various price formats
 */
function extractPrice(priceData) {
    if (typeof priceData === 'number') {
        return priceData;
    }
    
    if (typeof priceData === 'string') {
        // Remove currency symbols and extract number
        const match = priceData.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
    }
    
    if (typeof priceData === 'object' && priceData !== null) {
        return priceData.amount || priceData.value || priceData.price || 0;
    }
    
    return 0;
}

/**
 * Calculate discount percentage
 */
function calculateDiscountPercentage(product) {
    const originalPrice = extractPrice(product.mrp || product.price);
    const discountedPrice = extractPrice(product.discounted_price || product.offer_price);
    
    if (originalPrice && discountedPrice && originalPrice > discountedPrice) {
        return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
    }
    
    return 0;
}

/**
 * Determine product availability
 */
function determineAvailability(product) {
    if (product.in_stock === false || product.availability === false) {
        return 'Out of Stock';
    }
    
    if (product.in_stock === true || product.availability === true) {
        return 'In Stock';
    }
    
    // Check for stock quantity
    if (product.stock_quantity !== undefined) {
        return product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock';
    }
    
    // Default to available if not specified
    return 'In Stock';
}

/**
 * Extract image URL from various image data formats
 */
function extractImageUrl(imageData) {
    if (typeof imageData === 'string') {
        return imageData;
    }
    
    if (Array.isArray(imageData) && imageData.length > 0) {
        const firstImage = imageData[0];
        if (typeof firstImage === 'string') {
            return firstImage;
        }
        if (typeof firstImage === 'object') {
            return firstImage.url || firstImage.src || firstImage.image_url || '';
        }
    }
    
    if (typeof imageData === 'object' && imageData !== null) {
        return imageData.url || imageData.src || imageData.image_url || '';
    }
    
    return '';
}

/**
 * Log progress during scraping
 */
function logProgress(offset, currentBatch, totalProducts) {
    console.log(`Offset: ${offset} | Current batch: ${currentBatch} products | Total: ${totalProducts} products`);
}

/**
 * Validate input data structure
 */
function validateInputData(inputData) {
    if (!Array.isArray(inputData)) {
        throw new Error('Input data must be an array');
    }
    
    for (let i = 0; i < inputData.length; i++) {
        const item = inputData[i];
        const requiredFields = ['latitude', 'longitude', 'l0_cat', 'l1_cat'];
        
        for (const field of requiredFields) {
            if (!(field in item)) {
                throw new Error(`Missing required field '${field}' in item ${i}`);
            }
        }
        
        // Validate data types
        if (typeof item.latitude !== 'number' || typeof item.longitude !== 'number') {
            throw new Error(`Latitude and longitude must be numbers in item ${i}`);
        }
        
        if (!Number.isInteger(item.l0_cat) || !Number.isInteger(item.l1_cat)) {
            throw new Error(`Category IDs must be integers in item ${i}`);
        }
    }
    
    return true;
}

/**
 * Save data to JSON file
 */
function saveToJson(data, filename) {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filename, jsonData, 'utf8');
    console.log(`Data saved to ${filename}`);
}

/**
 * Load data from JSON file
 */
function loadFromJson(filename) {
    if (!fs.existsSync(filename)) {
        throw new Error(`File not found: ${filename}`);
    }
    
    const jsonData = fs.readFileSync(filename, 'utf8');
    return JSON.parse(jsonData);
}

module.exports = {
    delay,
    parseProductData,
    extractPrice,
    calculateDiscountPercentage,
    determineAvailability,
    extractImageUrl,
    logProgress,
    validateInputData,
    saveToJson,
    loadFromJson
};
