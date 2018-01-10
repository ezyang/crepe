const puppeteer = require('puppeteer')

async function main() {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('https://www.opentable.com/promo.aspx?pid=69&m=8');
  //await browser.close();
}

main();
