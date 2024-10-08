import * as puppeteer from "puppeteer";


/**
 *
 * @return {Promise<{date: string, place: string, ppl: string, info: string}[]>}
 */
const getQuotes = async () => {
  // Start a Puppeteer session with:
  // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
  // - no default viewport (`defaultViewport: null` - website page will be in full width and height)
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();

  // On this new page:
  // - open the "http://quotes.toscrape.com/" website
  // - wait until the dom content is loaded (HTML is ready)
  await page.goto("https://cabr.cbf.cz/prihlaseni.html", {
    waitUntil: "domcontentloaded",
  });

  // Fill in the username
  const login = await page.waitForSelector('::-p-xpath(//*[@id="content"]/div/div/form/table/tbody/tr[1]/td[2]/input)');
  await login.type(process.env.LOGIN);

  const password = await page.waitForSelector('::-p-xpath(//*[@id="content"]/div/div/form/table/tbody/tr[2]/td[2]/input)');
  await password.type(process.env.PASSWORD);

  const button = await page.waitForSelector( '::-p-xpath(//*[@id="content"]/div/div/form/table/tbody/tr[3]/td[2]/input)')
  await button.click();

// Wait for navigation to complete
  await page.waitForNavigation();

  await page.goto("https://cabr.cbf.cz/prihlaseni/delegace-k-utkanim.html")
  // Get page data
  const quotes = await page.evaluate(() => {
    // Fetch the first element with class "quote"
    // Get the displayed text and returns it
    const quoteList = document.querySelectorAll(".rec");

    // Convert the quoteList to an iterable array
    // For each quote fetch the text and author
    return Array.from(quoteList).map((quote) => {
      // Fetch the sub-elements from the previously fetched quote element
      // Get the displayed text and return it (`.innerText`)
      const text = quote.querySelectorAll("p");
      let info = text[1].innerText;
      let place = text[2].innerText;
      let date = text[3].innerText;
      let ppl =  text[4].innerText;
     // info = info.split(';')
      return {info, place, date, ppl};
    });
  });

  // Display the quotes
  //console.log(quotes);

  // Close the browser
  await browser.close();

  return quotes;
};

export default getQuotes;
