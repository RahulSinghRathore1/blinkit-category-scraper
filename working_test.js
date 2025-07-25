// This file creates a working demo that exactly matches the curl command that succeeded
const { exec } = require('child_process');
const fs = require('fs');

function runWorkingCurlTest() {
    return new Promise((resolve, reject) => {
        const curlCommand = `curl -s -X POST 'https://blinkit.com/v1/layout/listing_widgets?offset=0&limit=15&exclude_combos=false&l0_cat=14&l1_cat=923&last_snippet_type=product_card_snippet_type_2&last_widget_type=product_container&oos_visibility=true&page_index=0&total_entities_processed=1&total_pagination_items=28' \\
  -H 'accept: */*' \\
  -H 'accept-language: en-US,en;q=0.9' \\
  -H 'access_token: null' \\
  -H 'app_client: consumer_web' \\
  -H 'app_version: 1010101010' \\
  -H 'auth_key: c761ec3633c22afad934fb17a66385c1c06c5472b4898b866b7306186d0bb477' \\
  -H 'content-type: application/json' \\
  -H 'device_id: a2e6f47e-b4f2-438a-a8b6-08670b5d84df' \\
  -H 'lat: 28.3897979' \\
  -H 'lon: 77.27313339999999' \\
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
  -H 'session_uuid: 7d5a3899-d3a3-4c3d-b5d5-68d40a3cb77f' \\
  -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36' \\
  -H 'web_app_version: 1008010016' \\
  -H 'x-age-consent-granted: true' \\
  -b 'gr_1_deviceId=a2e6f47e-b4f2-438a-a8b6-08670b5d84df; gr_1_lat=28.3897979; gr_1_lon=77.27313339999999; gr_1_locality=2071; gr_1_landmark=undefined' \\
  -d '{"applied_filters":null,"is_sr_rail_visible":false,"is_subsequent_page":false,"postback_meta":{"primary_results_group_ids":[],"primary_results_product_ids":[]},"processed_product_ids":null,"processed_rails":{"aspirational_card_rail":{"total_count":0,"processed_count":5,"processed_product_ids":[]},"attribute_rail":{"total_count":0,"processed_count":4,"processed_product_ids":[]},"brand_rail":{"total_count":0,"processed_count":1,"processed_product_ids":[]},"dc_rail":{"total_count":0,"processed_count":1,"processed_product_ids":[]},"priority_dc_rail":{"total_count":0,"processed_count":1,"processed_product_ids":[]}},"shown_product_count":15,"sort":""}'`;

        exec(curlCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Curl command failed:', error);
                reject(error);
                return;
            }
            
            if (stderr) {
                console.error('Curl stderr:', stderr);
            }
            
            try {
                const data = JSON.parse(stdout);
                console.log('SUCCESS! Working curl response received');
                console.log('Response structure:', Object.keys(data));
                
                if (data.response && data.response.snippets) {
                    console.log(`Found ${data.response.snippets.length} products`);
                    
                    // Extract product data to demonstrate the scraper works
                    const products = [];
                    data.response.snippets.forEach(snippet => {
                        if (snippet.data && snippet.widget_type === 'product_card_snippet_type_2') {
                            const product = {
                                id: snippet.data.identity?.id || '',
                                name: snippet.data.name?.text || '',
                                brand: snippet.data.brand_name?.text || '',
                                price: snippet.data.normal_price?.text || '',
                                unit: snippet.data.variant?.text || '',
                                image: snippet.data.image?.url || '',
                                inventory: snippet.data.inventory || 0,
                                available: !snippet.data.is_sold_out
                            };
                            products.push(product);
                        }
                    });
                    
                    console.log('\nExtracted products:');
                    products.forEach((product, index) => {
                        console.log(`${index + 1}. ${product.name} - ${product.price} (${product.unit}) - ${product.brand}`);
                    });
                    
                    // Save the working response for analysis
                    fs.writeFileSync('working_response.json', JSON.stringify(data, null, 2));
                    console.log('\nWorking response saved to working_response.json');
                    
                    resolve(products);
                } else {
                    console.log('No product snippets found in response');
                    resolve([]);
                }
                
            } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                console.log('Raw response:', stdout.substring(0, 500));
                reject(parseError);
            }
        });
    });
}

// Run the test
runWorkingCurlTest()
    .then(products => {
        console.log(`\nTEST COMPLETED: Successfully extracted ${products.length} products using curl`);
        console.log('The BlinkIt API is working - now we need to make the Node.js scraper match this exact behavior');
    })
    .catch(error => {
        console.error('Test failed:', error);
    });