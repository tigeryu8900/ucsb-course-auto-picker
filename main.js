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
  await page.click('input#pageContent_loginButton');
  console.log('Going to schedule page...');
  await page.goto('https://my.sa.ucsb.edu/gold/StudentSchedule.aspx');
  console.log('picking courses...');
  await page.exposeFunction("console_log", console.log);
  await page.exposeFunction("console_error", console.error);
  await page.exposeFunction("browser_close", () => setTimeout(() => browser.close(), 0));
  await page.evaluate((courses, quarter) => {
    const domParser = new DOMParser();
    console_log('puppeteer script running...');
    const form = {
      __EVENTTARGET: document.querySelector('input#__EVENTTARGET').value,
      __EVENTARGUMENT: document.querySelector('input#__EVENTARGUMENT').value,
      __LASTFOCUS: document.querySelector('input#__LASTFOCUS').value,
      __VIEWSTATE: document.querySelector('input#__VIEWSTATE').value,
      __VIEWSTATEGENERATOR: document.querySelector('input#__VIEWSTATEGENERATOR').value,
      'ctl00$pageContent$quarterDropDown': quarter || document.querySelector('select#ctl00_pageContent_quarterDropDown > option[selected]').value,
      'ctl00$pageContent$AddCourseButton': 'Add',
      'ctl00$pageContent$regcartSelect': 'all'
    };
    console_log('form', form);
    Promise.all(courses.map(course => new Promise(resolve => {
      fetch("https://my.sa.ucsb.edu/gold/StudentSchedule.aspx", {
        "credentials": "include",
        "headers": {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:105.0) Gecko/20100101 Firefox/105.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Content-Type": "application/x-www-form-urlencoded",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-User": "?1"
        },
        "referrer": "https://my.sa.ucsb.edu/gold/StudentSchedule.aspx",
        "body": new URLSearchParams({...form, 'ctl00$pageContent$EnrollCodeTextBox': course}),
        "method": "POST",
        "mode": "cors"
      }).then(async r => {
        let errorMessageLabel = domParser.parseFromString(await r.text(), 'text/html').querySelector("span#ctl00_pageContent_ErrorMessageLabel");
        if (errorMessageLabel) console_error(errorMessageLabel.textContent);
        else (console_log(`Successfully picked course ${course}`));
        resolve();
      });
    }))).then(browser_close);
  }, process.argv.slice(2), process.env.QUARTER);
})();
