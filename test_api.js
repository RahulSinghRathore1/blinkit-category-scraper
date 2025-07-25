const axios = require('axios');

async function testBlinkitAPI() {
    const url = 'https://blinkit.com/v1/layout/listing_widgets';
    const params = {
        offset: 0,
        limit: 15,
        exclude_combos: false,
        l0_cat: 14,
        l1_cat: 923,
        last_snippet_type: 'product_card_snippet_type_2',
        last_widget_type: 'product_container',
        oos_visibility: true,
        page_index: 0,
        total_entities_processed: 1,
        total_pagination_items: 28
    };
    
    const headers = {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'access_token': 'null',
        'app_client': 'consumer_web',
        'app_version': '1010101010',
        'auth_key': 'c761ec3633c22afad934fb17a66385c1c06c5472b4898b866b7306186d0bb477',
        'content-type': 'application/json',
        'device_id': 'a2e6f47e-b4f2-438a-a8b6-08670b5d84df',
        'lat': '28.3897979',
        'lon': '77.27313339999999',
        'origin': 'https://blinkit.com',
        'platform': 'mobile_web',
        'priority': 'u=1, i',
        'referer': 'https://blinkit.com/cn/dairy-breakfast/paneer-tofu/cid/14/923',
        'rn_bundle_version': '1009003012',
        'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'session_uuid': '7d5a3899-d3a3-4c3d-b5d5-68d40a3cb77f',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'web_app_version': '1008010016',
        'x-age-consent-granted': 'true',
        'Cookie': 'gr_1_deviceId=a2e6f47e-b4f2-438a-a8b6-08670b5d84df; gr_1_lat=28.3897979; gr_1_lon=77.27313339999999; gr_1_locality=2071; gr_1_landmark=undefined'
    };
    
    const data = {
        applied_filters: null,
        is_sr_rail_visible: false,
        is_subsequent_page: false,
        postback_meta: {
            primary_results_group_ids: [],
            primary_results_product_ids: []
        },
        processed_product_ids: null,
        processed_rails: {
            aspirational_card_rail: {
                total_count: 0,
                processed_count: 5,
                processed_product_ids: []
            },
            attribute_rail: {
                total_count: 0,
                processed_count: 4,
                processed_product_ids: []
            },
            brand_rail: {
                total_count: 0,
                processed_count: 1,
                processed_product_ids: []
            },
            dc_rail: {
                total_count: 0,
                processed_count: 1,
                processed_product_ids: []
            },
            priority_dc_rail: {
                total_count: 0,
                processed_count: 1,
                processed_product_ids: []
            }
        },
        shown_product_count: 15,
        sort: ""
    };
    
    try {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = `${url}?${queryString}`;
        
        console.log('Making request to:', fullUrl);
        console.log('Headers:', JSON.stringify(headers, null, 2));
        
        const response = await axios({
            method: 'POST',
            url: fullUrl,
            headers: headers,
            data: data,
            timeout: 30000
        });
        
        console.log('Success! Status:', response.status);
        console.log('Response keys:', Object.keys(response.data));
        
        if (response.data.response && response.data.response.snippets) {
            console.log('Found', response.data.response.snippets.length, 'snippets');
            console.log('First snippet:', JSON.stringify(response.data.response.snippets[0], null, 2).substring(0, 500));
        }
        
        return response.data;
        
    } catch (error) {
        console.error('Error:', error.response?.status, error.response?.statusText);
        console.error('Error data:', error.response?.data);
        return null;
    }
}

testBlinkitAPI();