var cheerioReq = require("cheerio-req"); 
var Price;


cheerioReq("https://coinmarketcap.com/currencies/bitcoin/", (err, $) => {                         //Used for obtainig the Spot bitcoin price          
		 if (err) { Price = "error" }                                                                
         Price=$("#quote_price > span.text-large2").text();
		 console.log(Price);
         });