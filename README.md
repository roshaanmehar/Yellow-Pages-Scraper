# Yellow Pages Business Scraper  
A robust, stealth-powered web scraper that efficiently extracts business information from Yellow Pages while mimicking human browsing behavior. Built using Puppeteer and the Stealth plugin, this project ensures ethical and respectful web scraping practices. The data is saved in structured JSON files for easy use and analysis.

---

## Features  
- Stealth mode to evade detection by websites.  
- Random scrolling and delays to mimic human-like interactions.  
- Resumable scraping by maintaining logs and avoiding duplicate entries.  
- Configurable page limits and output options.  
- Simple JSON data storage for business records.  

---

## Prerequisites  
- Node.js (v14 or higher)  
- NPM or Yarn installed  
- An internet connection  

### **Installation Steps**
1. Clone this repository:
    ```bash
    git clone https://github.com/your-username/yellow-pages-scraper.git
    cd yellow-pages-scraper
    ```
2. Install the required dependencies:
    ```bash
    npm install
    ```
3. Update configurations in the `config` object if needed.  

4. Run the scraper:
    ```bash
    node index.js
    ```

---

## Configuration  
To customize the scraping behavior, update the `config` object inside the script:  
- `pageLimit`: Limit the number of pages to scrape (set to `null` for unlimited).  
- `delayBetweenPages`: Set minimum and maximum delay between pages to mimic real user interactions.  
- `outputFileName`: Specify the name of the output JSON file.  
- `logFileName`: Specify the name of the log file for tracking scraped pages.

---

## Output  
The extracted data is stored in `yellow_pages_scraped_data.json` in the following format:
```json
[
  {
    "name": "Business Name",
    "rating": "4.5 Stars",
    "address": "123 Main St, New York, NY",
    "phone": "(123) 456-7890",
    "website": "https://www.example.com"
  }
]
````
- This is an image of the data format:
- <br>
  <img src="https://github.com/roshaanmehar/Yellow-Pages-Scraper/blob/main/Screenshot%202025-02-08%20195850.png" height="300">

- This is an image of the script while running:
  <img src="https://github.com/roshaanmehar/Yellow-Pages-Scraper/blob/main/Screenshot%202025-02-08%20195603.png" height="400">
