const puppeteer = require('puppeteer')
const delay = 20;

async function main() {
  const browser = await puppeteer.launch({headless: false, devtools: true, slowMo: delay});
  const page = await browser.newPage();
  const max_iterations = 10;
  await page.goto('https://www.opentable.com/promo.aspx?pid=69&m=8');
  let all_rows = []
  for (let i = 0; i < max_iterations; i++) {
    console.log("Iteration ", i);
    let rows = await page.$$eval('.result', async (results, delay) => {
      function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      rows = [];
      // document.my_results = results; // DEBUG
      for (r of results) {
        r.scrollIntoView()
        row = {};
        row['name'] = r.querySelector('.rest-name').innerText;
        rows.push(row);
        await sleep(delay);
      }
      return rows;
    }, delay);
    console.log(rows);
    all_rows.push.apply(all_rows, rows);
    let no_more = await page.$eval('.pagination-next', (n) => {
      return n.classList.contains('pagination-unavailable');
    });
    if (no_more) {
      break;
    } else {
      //var waiter = page.waitForNavigation(['networkidle0', 'load', 'domcontentloaded']);
      await page.click('.pagination-next');
      //await waiter;
      await page.waitFor(2000); // THIS IS SO DUMB
      //page.evaluate(() => document.querySelector('.pagination-next').click());
      //await page.waitForNavigation({waitUntil:'networkidle0'});
    }
  }
  console.log("Restaurant count: ", all_rows.length);

  //await browser.close();
}

main();
