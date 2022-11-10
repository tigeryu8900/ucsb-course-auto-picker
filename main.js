const puppeteer = require('puppeteer');
require('dotenv').config();

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  console.log('Opening puppeteer...');
  let page = await browser.newPage();
  console.log('Signing in...');
  await page.goto('https://my.sa.ucsb.edu/gold/Login.aspx');
  await page.type('input#pageContent_userNameText', process.env.UCSBNETID);
  await page.type('input#pageContent_passwordText', process.env.PASSWORD);
  await Promise.all([page.click('input#pageContent_loginButton'), page.waitForNavigation()]);
  console.log('picking courses...');
  await Promise.all(process.argv.slice(2).map(async course => {
    let page = await browser.newPage();
    await page.goto('https://my.sa.ucsb.edu/gold/StudentSchedule.aspx');
    if (process.env.QUARTER) await page.select('select#ctl00_pageContent_quarterDropDown', process.env.QUARTER);
    await page.waitForSelector('input#ctl00_pageContent_EnrollCodeTextBox');
    await page.type('input#ctl00_pageContent_EnrollCodeTextBox', course);
    await page.waitForSelector('input#ctl00_pageContent_AddCourseButton');
    await Promise.all([page.waitForNavigation(), page.click('input#ctl00_pageContent_AddCourseButton')]);
    let errorMessages = await page.$$('main#content > div.row > main > table > tbody > tr > td');
    if (errorMessages.length)
      errorMessages.forEach(errorMessage => errorMessage.evaluate(e => e.innerText)
          .then(e => console.error(`Failed to pick course ${course}:`, e)));
    else {
      if (page.url() === 'https://my.sa.ucsb.edu/gold/AddStudentSchedule.aspx') {
        try {
          await page.waitForSelector('input#pageContent_AddToScheduleButton', { timeout: 5000 });
          await Promise.all([page.waitForNavigation(), page.click('input#pageContent_AddToScheduleButton')]);
        } catch (e) {}
      }
      console.log(`Successfully picked course ${course}`);
    }
  }));
  await browser.close();
})();
