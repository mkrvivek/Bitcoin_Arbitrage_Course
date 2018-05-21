const cheerioReq = require("cheerio-req");                        //Requires the cheerio-req module
var  CmeValue , CmeDate ,CboeValue , CboeDate , Price;


cheerioReq("https://coinmarketcap.com/currencies/bitcoin/", (err, $) => {                         //Used for obtainig the Spot bitcoin price          
	 if (err) { Price = "error" }                                                                
	 Price=$("#quote_price > span.text-large2").text();
	 console.log("\n\nPrice");
	 console.log(Price);
	 });
	 
cheerioReq("http://quotes.ino.com/exchanges/contracts.html?r=CME_BTC", (err, $) => {  //Used for obtaining the present Bitcoin futures value in cmegroup and its current date
	 if (err) { CmeValue= "error" } 
	 CmeValue = $("#col-main > div.table-responsive tr > td:nth-of-type(6) ").text().slice(0,4); 
	 CmeValue = parseInt(CmeValue,10);
	 console.log("\n\nCME")
	 console.log(CmeValue);
	 CmeDate = $("#col-main > div.table-responsive tr > td:nth-of-type(2)").text().slice(0,8);
	 console.log(CmeDate);
	 });

cheerioReq("http://cfe.cboe.com/cfe-products/xbt-cboe-bitcoin-futures", (err, $) => {         //Used for obtaining the present Bitcoin futures value in cboegroup and its current date
	 if (err) { CboeValue = "error" } 
	 CboeValue = $("#itemPlaceholderContainer1 > tr:nth-of-type(3) > td:nth-of-type(3)").text();
	 CboeValue = parseInt(CboeValue , 10);
	 console.log("\n\nCBOE");
	 console.log(CboeValue);
	 CboeDate = $("#itemPlaceholderContainer1 > tr:nth-of-type(3) > td:nth-of-type(2)").text();
	 console.log(CboeDate);
	 });
