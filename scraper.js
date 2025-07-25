const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const BlinkitConfig = require('./config');
const { delay, parseProductData, logProgress } = require('./utils');

class BlinkitScraper {
    constructor() {
        this.config = new BlinkitConfig();
        this.rateLimitDelay = 1000; // 1 second between requests
        this.maxRetries = 3;
    }
    
    async scrapeCategory({ latitude, longitude, l0_cat, l1_cat, location_name, category_name }) {
        const allProducts = [];
        let offset = 0;
        const limit = 15;
        let hasMoreData = true;
        let processedProductIds = [];
        
        console.log(`Starting to scrape category ${l0_cat}/${l1_cat} at ${latitude}, ${longitude}`);
        
        while (hasMoreData) {
            try {
                const response = await this.makeApiRequest({
                    latitude,
                    longitude,
                    l0_cat,
                    l1_cat,
                    offset,
                    limit,
                    processedProductIds
                });
                
                if (!response || !response.data) {
                    console.log('No more data available');
                    break;
                }
                
                const products = this.extractProducts(response.data, {
                    location_name,
                    category_name,
                    latitude,
                    longitude
                });
                
                if (products.length === 0) {
                    console.log('No products found in response, ending pagination');
                    break;
                }
                
                allProducts.push(...products);
                processedProductIds.push(...products.map(p => p.product_id));
                
                logProgress(offset, products.length, allProducts.length);
                
                // Check if we should continue pagination
                const hasNextPage = this.shouldContinuePagination(response.data, products.length, limit);
                if (!hasNextPage) {
                    hasMoreData = false;
                } else {
                    offset += limit;
                }
                
                // Rate limiting
                await delay(this.rateLimitDelay);
                
            } catch (error) {
                console.error(`Error at offset ${offset}:`, error.message);
                
                if (error.response && error.response.status === 429) {
                    console.log('Rate limited, waiting longer...');
                    await delay(5000); // Wait 5 seconds for rate limit
                    continue;
                }
                
                // If we have some products, continue with next offset
                if (allProducts.length > 0) {
                    offset += limit;
                    continue;
                } else {
                    throw error;
                }
            }
        }
        
        console.log(`Completed scraping. Found ${allProducts.length} total products`);
        return allProducts;
    }
    
    async makeApiRequest({ latitude, longitude, l0_cat, l1_cat, offset, limit, processedProductIds }) {
        const params = this.config.getRequestParams(offset, limit, l0_cat, l1_cat);
        const data = this.config.getRequestBody(processedProductIds);
        
        let lastError;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`Making API request (attempt ${attempt}/${this.maxRetries}): offset=${offset}, limit=${limit}`);
                
                // Build curl command that matches the working version
                const curlCommand = this.buildCurlCommand(params, data, latitude, longitude);
                
                const { stdout, stderr } = await execAsync(curlCommand);
                
                if (stderr) {
                    console.log('Curl stderr:', stderr);
                }
                
                try {
                    const responseData = JSON.parse(stdout);
                    console.log(`Success! Got response with ${responseData.response?.snippets?.length || 0} snippets`);
                    return { data: responseData };
                } catch (parseError) {
                    throw new Error(`Failed to parse JSON response: ${parseError.message}`);
                }
                
            } catch (error) {
                lastError = error;
                console.log(`Attempt ${attempt} failed:`, error.message);
                
                if (attempt < this.maxRetries) {
                    const backoffDelay = Math.pow(2, attempt) * 1000; // Exponential backoff
                    console.log(`Retrying in ${backoffDelay}ms...`);
                    await delay(backoffDelay);
                }
            }
        }
        
        throw lastError;
    }
    
    buildCurlCommand(params, data, latitude, longitude) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = `${this.config.getApiUrl()}?${queryString}`;
        const dataString = JSON.stringify(data).replace(/"/g, '\\"');
        const cookies = this.config.getCookies(latitude, longitude);
        
        return `curl -s -X POST '${fullUrl}' \\
  -H 'accept: */*' \\
  -H 'accept-language: en-US,en;q=0.9' \\
  -H 'access_token: null' \\
  -H 'app_client: consumer_web' \\
  -H 'app_version: 1010101010' \\
  -H 'auth_key: ${this.config.authKey}' \\
  -H 'content-type: application/json' \\
  -H 'device_id: ${this.config.deviceId}' \\
  -H 'lat: ${latitude}' \\
  -H 'lon: ${longitude}' \\
  -H 'origin: https://blinkit.com' \\
  -H 'platform: mobile_web' \\
  -H 'priority: u=1, i' \\
  -H 'referer: https://blinkit.com/cn/dairy-breakfast/paneer-tofu/cid/14/923' \\
  -H 'rn_bundle_version: 1009003012' \\
  -H 'sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"' \\
  -H 'sec-ch-ua-mobile: ?0' \\
  -H 'sec-ch-ua-platform: "Windows"' \\
  -H 'sec-fetch-dest: empty' \\
  -H 'sec-fetch-mode: cors' \\
  -H 'sec-fetch-site: same-origin' \\
  -H 'session_uuid: ${this.config.sessionUuid}' \\
  -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36' \\
  -H 'web_app_version: 1008010016' \\
  -H 'x-age-consent-granted: true' \\
  -b '${cookies}' \\
  -d '${dataString}'`;
    }
    
    extractProducts(apiResponse, metadata) {
        const products = [];
        
        try {
            console.log('API Response structure:', Object.keys(apiResponse));
            
            // BlinkIt uses 'response.snippets' structure  
            if (apiResponse.response && apiResponse.response.snippets) {
                console.log(`Found ${apiResponse.response.snippets.length} snippets`);
                for (const snippet of apiResponse.response.snippets) {
                    if (snippet.data && snippet.widget_type === 'product_card_snippet_type_2') {
                        const parsedProduct = parseProductData(snippet.data, metadata);
                        if (parsedProduct) {
                            products.push(parsedProduct);
                        }
                    }
                }
            }
            
            // Legacy support for other API structures
            if (apiResponse.widgets) {
                for (const widget of apiResponse.widgets) {
                    if (widget.data && widget.data.products) {
                        for (const product of widget.data.products) {
                            const parsedProduct = parseProductData(product, metadata);
                            if (parsedProduct) {
                                products.push(parsedProduct);
                            }
                        }
                    }
                }
            }
            
        } catch (error) {
            console.error('Error extracting products from response:', error.message);
            console.log('Response sample:', JSON.stringify(apiResponse, null, 2).substring(0, 1000));
        }
        
        return products;
    }
    
    shouldContinuePagination(response, currentProductCount, limit) {
        // Continue if we got a full page of results
        if (currentProductCount >= limit) {
            return true;
        }
        
        // Check if API indicates more pages
        if (response.has_more || response.hasMore) {
            return true;
        }
        
        // If we got fewer products than the limit, probably no more data
        return false;
    }
}

module.exports = BlinkitScraper;
