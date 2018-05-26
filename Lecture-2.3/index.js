"use strict";
var Alexa = require("alexa-sdk");                                 //Requires the Alexa module
var AWS = require("aws-sdk");                                     //Requires the aws module
const cheerioReq = require("cheerio-req");                        //Requires the cheerio-req module
var  CmeValue , CmeDate ,CboeValue , CboeDate , Price;
const https = require("https");                                   //Requires the https module
var ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});           //Initializes a variable to perform Dynamodb actions
exports.handler = function(event,context,callback)
{
    var alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(Handler);
    alexa.execute();
};

var Handler = 
{
    "LaunchRequest" : function()
	{
		if(!this.event.session.user.accessToken)    //If the user didn't undergo account linking,prompt him 
		{
			this.emit(':tellWithLinkAccountCard',"For a better experience,please link your account through the link account card sent to your home section");
		}else
		{
            this.emit(":askWithCard","Hi , you can ask me the current bitcoin arbitrage","Hi,you can get information about the current bitcoin arbitrage or you can set an mail alert","Bitcoin  Skill","Hi ,say get info or mail me and specify the required value in dollars");
		}
    },
    "SpotPriceIntent" : function()
	{
		//The Cheerioreq module is used for parsing the data from a given html structure,specify the site from which the html structure is to be obtained,
		//then the "$" imitates the jquery environment,and parses the text specified in the CSS selector
		cheerioReq("https://coinmarketcap.com/currencies/bitcoin/", (err, $) =>                //Used for obtainig the Spot bitcoin price
		{                                   
			if (err) { CboeValue = "error" }                                                                
			Price=$("#quote_price > span.text-large2").text();
        });
	 
		cheerioReq("http://quotes.ino.com/exchanges/contracts.html?r=CME_BTC", (err, $) =>     //Used for obtaining the present Bitcoin futures value in cmegroup and its current date
		{  
			 if (err) { CmeValue= "error" } 
			 CmeValue = $("#col-main > div.table-responsive tr > td:nth-of-type(6) ").text().slice(0,4); 
			 CmeValue = parseInt(CmeValue,10);
			 console.log(CmeValue);
			 CmeDate = $("#col-main > div.table-responsive tr > td:nth-of-type(2)").text().slice(0,8);
			 console.log(CmeDate);
        });

	    cheerioReq("http://cfe.cboe.com/cfe-products/xbt-cboe-bitcoin-futures", (err, $) =>    //Used for obtaining the present Bitcoin futures value in cboegroup and its current date
		{        
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
		
		this.emit(':ask',"The Bitcoin Price is " + Price + " dollars,The " + CmeDate 
		+ " Bitcoin Futures contract on the CME is trading at " + CmeValue + " dollars,This is " + CmeDiff 
		+ " dollars " + CmeSign + " the Spot Bitcoin price,The " + CboeDate 
		+ " expiring Bitcoin futures contract on the C.B.O.E is trading at " + CboeValue 
		+ " dollars,This is " + CboeDiff + " dollars " + CboeSign + " the Spot Bitcoin price,The "+ Cmemonth 
		+" Bitcoin Futures contract on the CME,is trading at " + GranDiff+ " dollars " + GranSign 
		+ " the C.B.O.E Bitcoin Futures contract,Would you like to set a mail alert");    //Specifies the speech output to be spoken by alexa
	},
 
	"SetSpreadIntent" : function()
	{
		let content = this;
		let Email;
		if(!this.event.session.user.accessToken)
		{
		this.emit(':tellWithCard',"For a better experience,please link your account","Account Linking","For a better experience,please link your account","For a better experience,please link your account");
		}else
		{  
	    var Spread = this.event.request.intent.slots.Spread.value;   //Gets the spread value set by user
	    var UserId = this.event.session.user.userId;                 //Gets the user's UserId
	    var AccessToken = this.event.session.user.accessToken;       //Gets the user's accessToken

		const url =
		//The https module is used for making https requests from our node environment.
		"https://api.amazon.com/user/profile?access_token=" + AccessToken;   //Used for accessing the User's mail Id in JSON format
		https.get(url, res => 
		{              
			res.setEncoding("utf8");
			var body = "";
			res.on("data", data => 
			{
				body += data;
				console.log(body);
			});
			res.on("end", () => 
			{
			let body1 = JSON.parse(body);   //Parses the data to obtain the user's email address
			Email = body1.email;
			console.log(Email);
			var params =                   //The user's Email ID is sent along with his set spread value and UserID to be stored in dynamoDB
			{
				TableName: 'UserDatabase',
				Item: 
				{
				'Spread' : {N: Spread},                //Stores the Spread value in "N"(Number) format
				'UserId' : {S: UserId},                //Stores the UserId in "S"(String) format
				'PlaceHolder' : {S: 'same'},           //Stores the Placeholder in "S"(String) format with the default value of same.
				'EmailId' : {S: Email}                 //Stores the Email in "S"(String) format
				}
			};
			ddb.putItem(params, function(err, data)
			{                                         //Stores the data in dynamoDB
				if (err) 
				{
				console.log("Error", err);
				} 
				else 
				{
				console.log("Success", data);
				}
			});
			if(Email == undefined)
			{
			this.emit(':ask',"Please try again");   //If Email is not parsed correctly,prompts the user to retry
			}
			content.emit(':tellWithCard',"A mail will be sent to your amazon account "+ Email 
			+" when the arbitrage crosses "+ Spread 
			+" dollars","Mail Alert","A mail will be sent to your amazon account "+ Email 
			+" when the arbitrage crosses "+Spread+" dollars");
			});
		});
		}
	},
	"AMAZON.YesIntent" : function()
	{
		this.emit(':ask', "To set a mail alert say mail me and specify your required value in dollars");
	},
	"AMAZON.NoIntent" : function()
	{
		this.emit(':tell', "Ok,Catch you later");
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
		this.emit(':ask', " For querying about the current bitcoin arbitrage ,ask What is the current bitcoin arbitrage , For setting a mail alert say mail me and specify the required value in dollars,would you like to set a mail alert");
	},
	"Unhandled" : function()
	{
		this.emit(':ask', "Sorry,I didn't get that,For querying about the current bitcoin arbitrage ,ask What is the current bitcoin arbitrage , For setting a mail alert say mail me and specify the required value in dollars,would you like to set a mail alert");
	}
};