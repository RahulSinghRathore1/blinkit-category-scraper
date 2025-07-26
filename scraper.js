const axios = require("axios");
const BlinkitConfig = require("./config");
const { delay, parseProductData, logProgress } = require("./utils");

class BlinkitScraper {
  constructor() {
    this.config = new BlinkitConfig();
    this.rateLimitDelay = 1000; // 1 second between requests
    this.maxRetries = 3;
  }

  async scrapeCategory({
    latitude,
    longitude,
    l0_cat,
    l1_cat,
    location_name,
    category_name,
  }) {
    const allProducts = [];
    let offset = 0;
    const limit = 15;
    let hasMoreData = true;
    let processedProductIds = [];

    console.log(
      `Starting to scrape category ${l0_cat}/${l1_cat} at ${latitude}, ${longitude}`
    );

    while (hasMoreData) {
      try {
        const response = await this.makeApiRequest({
          latitude,
          longitude,
          l0_cat,
          l1_cat,
          offset,
          limit,
          processedProductIds,
        });

        if (!response || !response.data) {
          console.log("No more data available");
          break;
        }

        const products = this.extractProducts(response.data, {
          location_name,
          category_name,
          latitude,
          longitude,
        });

        if (products.length === 0) {
          console.log("No products found in response, ending pagination");
          break;
        }

        allProducts.push(...products);
        processedProductIds.push(...products.map((p) => p.product_id));

        logProgress(offset, products.length, allProducts.length);

        const hasNextPage = this.shouldContinuePagination(
          response.data,
          products.length,
          limit
        );
        if (!hasNextPage) {
          hasMoreData = false;
        } else {
          offset += limit;
        }

        await delay(this.rateLimitDelay);
      } catch (error) {
        console.error(`Error at offset ${offset}:`, error.message);

        if (error.response && error.response.status === 429) {
          console.log("Rate limited, waiting longer...");
          await delay(5000);
          continue;
        }

        if (allProducts.length > 0) {
          offset += limit;
          continue;
        } else {
          throw error;
        }
      }
    }

    console.log(
      `Completed scraping. Found ${allProducts.length} total products`
    );
    return allProducts;
  }

  async makeApiRequest({
    latitude,
    longitude,
    l0_cat,
    l1_cat,
    offset,
    limit,
    processedProductIds,
  }) {
    const params = this.config.getRequestParams(offset, limit, l0_cat, l1_cat);
    const data = this.config.getRequestBody(processedProductIds);
    const headers = this.config.getHeaders(latitude, longitude);
    headers["cookie"] = this.config.getCookies(latitude, longitude);

    const url = this.config.getApiUrl();

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(
          `Making API request (attempt ${attempt}/${this.maxRetries}): offset=${offset}, limit=${limit}`
        );
        const response = await axios.post(url, data, { headers, params });

        console.log(
          `Success! Got response with ${
            response.data.response?.snippets?.length || 0
          } snippets`
        );
        return { data: response.data };
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);

        if (attempt < this.maxRetries) {
          const backoffDelay = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${backoffDelay}ms...`);
          await delay(backoffDelay);
        } else {
          throw error;
        }
      }
    }
  }

  extractProducts(apiResponse, metadata) {
    const products = [];

    try {
      console.log("API Response structure:", Object.keys(apiResponse));

      if (apiResponse.response && apiResponse.response.snippets) {
        console.log(`Found ${apiResponse.response.snippets.length} snippets`);
        for (const snippet of apiResponse.response.snippets) {
          if (
            snippet.data &&
            snippet.widget_type === "product_card_snippet_type_2"
          ) {
            const parsedProduct = parseProductData(snippet.data, metadata);
            if (parsedProduct) {
              products.push(parsedProduct);
            }
          }
        }
      }

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
      console.error("Error extracting products from response:", error.message);
      console.log(
        "Response sample:",
        JSON.stringify(apiResponse, null, 2).substring(0, 1000)
      );
    }

    return products;
  }

  shouldContinuePagination(response, currentProductCount, limit) {
    if (currentProductCount >= limit) return true;
    if (response.has_more || response.hasMore) return true;
    return false;
  }
}

module.exports = BlinkitScraper;
