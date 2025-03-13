// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  //start with an empty list
  let articles = [];
  let url = "https://news.ycombinator.com/newest";
  await page.goto(url);
  while (articles.length < 100){
    // go to Hacker News
    
    //Ok so we want to evaluate every row on the page by class because it only loads 30 at a time
    //Looks like the class for our tablerows is ".athing" => 'tr.athing' is a valid locator!
    //Lets see if we can pipe the rows from that into a map function to get the data we need.
    const loc = page.locator('tr.athing')
    let newsArticles = await loc.evaluateAll(rows => {
      return rows.map(row => {


        //first thing we're going to do is check the rank, if it's over 100 we're done.
        const rank = parseInt(row.querySelector('.rank')?.innerText || 0);
        if (rank > 100) return null; // Skip articles past rank 100

        //row is our news article but there is one issue, the timestamp is on the subline!
        const subline = row.nextElementSibling;
        return {
          id: row.getAttribute("id"), //Straightforward, we can just grab the id attribute
          title: row.querySelector(".titleline a")?.innerText || "N/A", //This pulls the text from the anchor tag matching the titleline class
          time: subline?.querySelector(".age")?.title?.split(' ').pop() || "N/A" //This is witchcraft. I want epoch for accuracy, the second half of the title. 
        };
      }).filter(article => article !== null); // Remove any null entries
  });
  
    articles.push(...newsArticles); //Add this page's articles to my list
    //console.log(articles.length);

    if(articles.length < 100){await page.locator("a.morelink").click();}//Only click if we need to, wasted action otherwise.

  }//while articles < 100
;
    //At this point we have a list of 100 articles, it should have been read in order of newest to oldest, but we are going to make sure. 
    //We are simply going to compare the list to a version of itself sorted by epoch (descending = newest first).
    if (articles === articles.sort((a, b) => b.time - a.time)) {

      console.log(JSON.stringify(articles, null, 2)); //This is to confirm the data is correct
      console.log(articles.length + " articles are correctly sorted!");

    }
    else{
      throw new Error("Articles are not correctly sorted!"); //This will alert us if something is wrong.
    }
  }//sHNA

(async () => {
  await sortHackerNewsArticles();

})();
