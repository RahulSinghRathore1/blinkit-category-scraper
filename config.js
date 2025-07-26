const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

class BlinkitConfig {
  constructor() {
    this.baseUrl = "https://blinkit.com";
    this.apiVersion = "v1";
    this.deviceId =
      process.env.DEVICE_ID || "a2e6f47e-b4f2-438a-a8b6-08670b5d84df";
    this.sessionUuid =
      process.env.SESSION_UUID || "7d5a3899-d3a3-4c3d-b5d5-68d40a3cb77f";
    this.authKey =
      process.env.AUTH_KEY ||
      "c761ec3633c22afad934fb17a66385c1c06c5472b4898b866b7306186d0bb477";
  }

  generateDeviceId() {
    return uuidv4();
  }

  getHeaders(latitude, longitude) {
    return {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      access_token: "null",
      app_client: "consumer_web",
      app_version: "1010101010",
      auth_key: this.authKey,
      "content-type": "application/json",
      device_id: this.deviceId,
      lat: latitude.toString(),
      lon: longitude.toString(),
      origin: "https://blinkit.com",
      platform: "mobile_web",
      priority: "u=1, i",
      referer: `https://blinkit.com/cn/dairy-breakfast/paneer-tofu/cid/14/923`,
      rn_bundle_version: "1009003012",
      "sec-ch-ua":
        '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      session_uuid: this.sessionUuid,
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      web_app_version: "1008010016",
      "x-age-consent-granted": "true",
    };
  }

  getApiUrl() {
    return `${this.baseUrl}/${this.apiVersion}/layout/listing_widgets`;
  }

  getRequestParams(offset = 0, limit = 15, l0_cat, l1_cat) {
    return {
      offset,
      limit,
      exclude_combos: false,
      l0_cat: l0_cat.toString(),
      l1_cat: l1_cat.toString(),
      last_snippet_type: "product_card_snippet_type_2",
      last_widget_type: "product_container",
      oos_visibility: true,
      page_index: Math.floor(offset / limit),
      total_entities_processed: 1,
      total_pagination_items: 28,
    };
  }

  getRequestBody(processedProductIds = null) {
    return {
      applied_filters: null,
      is_sr_rail_visible: false,
      is_subsequent_page: false,
      postback_meta: {
        primary_results_group_ids: processedProductIds || [],
        primary_results_product_ids: processedProductIds || [],
      },
      processed_product_ids: processedProductIds,
      processed_rails: {
        aspirational_card_rail: {
          total_count: 0,
          processed_count: 5,
          processed_product_ids: [],
        },
        attribute_rail: {
          total_count: 0,
          processed_count: 4,
          processed_product_ids: [],
        },
        brand_rail: {
          total_count: 0,
          processed_count: 1,
          processed_product_ids: [],
        },
        dc_rail: {
          total_count: 0,
          processed_count: 1,
          processed_product_ids: [],
        },
        priority_dc_rail: {
          total_count: 0,
          processed_count: 1,
          processed_product_ids: [],
        },
      },
      shown_product_count: 15,
      sort: "",
    };
  }

  getCookies(latitude, longitude) {
    return `gr_1_deviceId=${this.deviceId}; _gcl_au=1.1.1204347791.1753095422; _fbp=fb.1.1753095422131.474850057552113379; gr_1_lat=${latitude}; gr_1_lon=${longitude}; gr_1_locality=2071; gr_1_landmark=undefined; __cf_bm=jUE4CSdjyqKiQLrR6zBAO1gPjlUY.1wdYXUHoYQEfXE-1753467903-1.0.1.1-YBer9NPLtfBIayPxNI2lWMgDpauIkqqD2ijVS7q5iOqW_IffX_eC8Deu9KHIGM4lrYsCGHxQyYkqFlwhevuaB8IMGKfvoP8sO31BqroUvZQ; __cfruid=43946b484ca6bdea7fba67c5c2f8df5df294039b-1753467903; _cfuvid=1XP9iw4C7Fl.R9ABRo5jWM33XLA.MD1H2Y5_3Q.UcJw-1753467903972-0.0.1.1-604800000`;
  }
}

module.exports = BlinkitConfig;
