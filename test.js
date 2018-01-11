const puppeteer = require('puppeteer');
const papaparse = require('papaparse');
const fs = require('fs');

const fast = true;
const delay = 0;

async function main() {


  const browser = await puppeteer.launch(
    {headless: fast, devtools: !fast, slowMo: delay});
  const page = await browser.newPage();
  const max_iterations = 10;
  await page.goto('https://www.opentable.com/promo.aspx?pid=69&m=8');
  // sometimes with devtools there's a race
  await page.bringToFront();
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
        if (delay != 0) r.scrollIntoView()
        row = {};
        row['name'] = r.querySelector('.rest-name').innerText;
        booking = r.querySelector('.booking')
        if (booking != null) {
            row['booking'] = parseInt(booking.innerText.match(/Booked (\d+) times today/)[1]);
        }
        else {
            row['booking'] = 0;
        }
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
      await page.click('.pagination-next');
      await page.waitForSelector('#loading_animation', {hidden: true});
    }
  }
  console.log("Restaurant count: ", all_rows.length);
  all_rows.sort((a,b) => b['booking'] - a['booking']);
  console.log("Top Restaurants: ", all_rows.slice(0, 10));

  fs.writeFile('data.csv', papaparse.unparse(all_rows), function(err) {
    if (err) {
      return console.log(err);
    }
  });

  if (fast) {
    await browser.close();
  }
}

main();
