"use strict";
var Alexa = require("alexa-sdk");                                 //Requires the Alexa module
const cheerioReq = require("cheerio-req");                        //Requires the cheerio-req module
var  CmeValue , CmeDate ,CboeValue , CboeDate , Price;
exports.handler = function(event,context,callback){
    var alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(Handler);
    alexa.execute();
};

var Handler = 
{
    "LaunchRequest" : function()
	{
		this.emit(':ask', "Welcome to the Bitcoin Arbitrage Skill,to know the current spread value,ask,What is the current spread");

    },
    "SpotPriceIntent" : function()
	{
		//The Cheerioreq module is used for parsing the data from a given html structure,specify the site from which the html structure is to be obtained,
		//then the "$" imitates the jquery environment,and parses the text specified in the CSS selector
		cheerioReq("https://coinmarketcap.com/currencies/bitcoin/", (err, $) => {                         //Used for obtainig the Spot bitcoin price          
		 if (err) { CboeValue = "error" }                                                                
         Price=$("#quote_price > span.text-large2").text();
         });
	 
		cheerioReq("http://quotes.ino.com/exchanges/contracts.html?r=CME_BTC", (err, $) => {  //Used for obtaining the present Bitcoin futures value in cmegroup and its current date
		 if (err) { CmeValue= "error" } 
         CmeValue = $("#col-main > div.table-responsive tr > td:nth-of-type(6) ").text().slice(0,4); 
		 CmeValue = parseInt(CmeValue,10);
		 console.log(CmeValue);
		 CmeDate = $("#col-main > div.table-responsive tr > td:nth-of-type(2)").text().slice(0,8);
		 console.log(CmeDate);
         });

	    cheerioReq("http://cfe.cboe.com/cfe-products/xbt-cboe-bitcoin-futures", (err, $) => {         //Used for obtaining the present Bitcoin futures value in cboegroup and its current date
		 if (err) { CboeValue = "error" } 
         CboeValue = $("#itemPlaceholderContainer1 > tr:nth-of-type(3) > td:nth-of-type(3)").text();
         CboeValue = parseInt(CboeValue , 10);
		 CboeDate = $("#itemPlaceholderContainer1 > tr:nth-of-type(3) > td:nth-of-type(2)").text();
		 });
	  
		 let CmeDiff = CmeValue - Price ;                  //Finds the difference between Cmeprice and Spot Bitcoin Price 
		 let CboeDiff = CboeValue - Price ;                //Finds the difference between Cboeprice and Spot Bitcoin Price 
		 let GranDiff = CmeValue - CboeValue;              //Finds the difference between Cmeprice and  Cboeprice 
		 let CmeSign = CmeDiff > 0 ? "above" : "below";    //If the Difference is greater than 0 , it is positive else it is negativew
		 CmeDiff = Math.trunc(Math.abs(CmeDiff)) ;         // The absolute value is obtained, then truncated to a whole number
		 
		 let CboeSign = CboeDiff > 0 ? "above" : "below";
		 CboeDiff = Math.trunc(Math.abs(CboeDiff)) ;
		 
		 let GranSign = GranDiff > 0 ? "above" : "below";
		 GranDiff = Math.trunc(Math.abs(GranDiff)) ;
		 
		 if(Price == undefined)                            //Due to parsing errors,if the Spread cannot be calculated,prompt the user to invoke the skill again
		 {
			 this.emit(':ask',"Please try again");         
		 }
		 let Cmemonth = CmeDate.slice(3);                 //Used for obtaining the month from the specified date.
		 this.emit(':ask',"The Bitcoin Price is " + Price + " dollars,The " + CmeDate + " Bitcoin Futures contract on the CME is trading at " + CmeValue + " dollars,This is " + CmeDiff + " dollars " + CmeSign + " the Spot Bitcoin price,The " + CboeDate + " expiring Bitcoin futures contract on the C.B.O.E is trading at " + CboeValue + " dollars,This is " + CboeDiff + " dollars " + CboeSign + " the Spot Bitcoin price,The "+Cmemonth+" Bitcoin Futures contract on the CME,is trading at " + GranDiff+ " dollars " + GranSign + " the C.B.O.E Bitcoin Futures contract,Would you like to set a mail alert");    //Specifies the speech output to be spoken by alexa

	},
	"AMAZON.CancelIntent" : function()
	{
        this.emit(':tell', " Thank you ");
	},
    "AMAZON.StopIntent" : function()
	{
        this.emit(':tell', " Thank you ");
    },
    "AMAZON.HelpIntent" : function()	
	{
        this.emit(':tell', " For querying about the current bitcoin arbitrage ,ask What is the current bitcoin arbitrage");
    },
	"Unhandled" : function()
	{
        this.emit(':ask', "Sorry,I didn't get that,For querying about the current bitcoin arbitrage,ask,What is the current bitcoin arbitrage");
	}
}
		  
		 
		 