console.time("Execution Time"); // Start the timer
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";

// Use Puppeteer Stealth Plugin
puppeteer.use(StealthPlugin());

// Function to introduce a random delay between actions
const randomDelay = (min, max) =>
  new Promise((resolve) =>
    setTimeout(resolve, Math.random() * (max - min) + min)
  );

// Function to randomize scrolling on the page
const randomScroll = async (page) => {
  await page.evaluate(() => {
    const scrollHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    window.scrollBy(0, Math.random() * (scrollHeight / 3));
  });
  await randomDelay(1000, 3000); // Wait between 1 and 3 seconds
};

// Configuration
const config = {
  pageLimit: 5, // Number of pages to scrape; set to null for unlimited
  delayBetweenPages: [2000, 5000], // Min and max delay between pages
  outputFileName: "yellow_pages_scraped_data.json", // Output JSON file
  logFileName: "yellow_pages_scraped_pages.json", // Log file to track scraped pages
};

// Function to check if a record already exists in the dataset
const isDuplicate = (record1, record2) => {
  return (
    record1.name === record2.name &&
    record1.address === record2.address &&
    record1.phone === record2.phone &&
    record1.rating === record2.rating &&
    record1.website === record2.website
  );
};

(async () => {
  // Load previously scraped data and log of pages
  let scrapedPages = [];
  let existingData = [];
  if (fs.existsSync(config.logFileName)) {
    scrapedPages = JSON.parse(fs.readFileSync(config.logFileName, "utf-8"));
  }
  if (fs.existsSync(config.outputFileName)) {
    existingData = JSON.parse(fs.readFileSync(config.outputFileName, "utf-8"));
  }

  // Launch the browser
  const browser = await puppeteer.launch({
    headless: false, // Set to false to open a browser window
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Set a user agent to mimic a real browser
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  );

  // Go to YellowPages URL for plumbing businesses in New York
  await page.goto(
    "https://www.yellowpages.com/search?search_terms=plumbing&geo_location_terms=Georgia",
    {
      waitUntil: "domcontentloaded", // Wait for the page content to load
    }
  );

  // Variable to hold all the scraped results
  let newRecords = [];
  let currentPage = 1;

  // Function to scrape data from a page
  const scrapePage = async () => {
    const data = await page.evaluate(() => {
      const results = [];
      const businesses = document.querySelectorAll(".result");

      businesses.forEach((business) => {
        const name = business.querySelector("h2")
          ? business.querySelector("h2").innerText.trim()
          : "No Name";

        const rating = business.querySelector(".ratings")
          ? business.querySelector(".ratings").innerText.trim()
          : "No Rating";

        const address = business.querySelector(".street-address")
          ? business.querySelector(".street-address").innerText.trim()
          : "No Address";

        const phone = business.querySelector(".phone")
          ? business.querySelector(".phone").innerText.trim()
          : "No Phone";

        const website = business.querySelector('a[href^="http"]')
          ? business.querySelector('a[href^="http"]').href.trim()
          : null;

        results.push({ name, rating, address, phone, website });
      });

      return results;
    });

    return data;
  };

  // Scrape the first page if it hasn't been scraped
  const firstPageUrl = page.url();
  if (!scrapedPages.includes(firstPageUrl)) {
    const pageData = await scrapePage();
    newRecords.push(...pageData);
    scrapedPages.push(firstPageUrl);
  }

  // Loop to handle pagination
  let hasNextPage = true;
  while (hasNextPage) {
    // Stop scraping if page limit is reached
    if (config.pageLimit && currentPage >= config.pageLimit) break;

    // Wait a random delay between pages
    await randomDelay(...config.delayBetweenPages);

    // Perform random scrolling to mimic user behavior
    await randomScroll(page);

    // Check if the "Next" button exists
    const nextButton = await page.$("a.next");

    if (nextButton) {
      // Click the "Next" button to navigate to the next page
      await nextButton.click();
      await page.waitForNavigation({ waitUntil: "domcontentloaded" });

      // Increment the page counter
      currentPage++;

      // Check if the page has been scraped
      const currentUrl = page.url();
      if (!scrapedPages.includes(currentUrl)) {
        const pageData = await scrapePage();
        newRecords.push(...pageData);
        scrapedPages.push(currentUrl);
      }
    } else {
      // No "Next" button found, stop the loop
      hasNextPage = false;
    }
  }

  // Filter out duplicates by comparing full records
  const combinedData = [...existingData];
  const uniqueNewRecords = newRecords.filter((newRecord) => {
    return !combinedData.some((existingRecord) =>
      isDuplicate(existingRecord, newRecord)
    );
  });

  // Append unique new records to the existing data
  combinedData.push(...uniqueNewRecords);

  // Write the updated data to the JSON file
  fs.writeFileSync(
    config.outputFileName,
    JSON.stringify(combinedData, null, 2),
    "utf-8"
  );
  console.log(
    `Data has been saved to ${config.outputFileName}. Total records: ${combinedData.length}`
  );

  // Update the log file with the scraped pages
  fs.writeFileSync(
    config.logFileName,
    JSON.stringify(scrapedPages, null, 2),
    "utf-8"
  );

  // Print summary
  console.log("Summary:");
  console.log(`Pages scraped: ${currentPage}`);
  console.log(`Records collected this session: ${newRecords.length}`);
  console.log(
    `New records written: ${uniqueNewRecords.length} (existing: ${
      existingData.length
    })`
  );
  console.log(`Total records: ${combinedData.length}`);

  // Close the browser
  await browser.close();
  console.timeEnd("Execution Time");
})();
