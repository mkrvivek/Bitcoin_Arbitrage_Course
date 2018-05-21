var AWS = require('aws-sdk');                                 //Requires the aws module
var ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});

exports.handler = function(event, context, callback)
{
	var params1 = {
		ExpressionAttributeValues: 
		{
		":v1": 
			{
				S: "same"
			},
		":v2": 
			{
				N: "0"
			}
		}, 
		KeyConditionExpression: "PlaceHolder = :v1 and Spread > :v2",  //Returns all the items,having a spread lesser than the current spread 
		IndexName: "PlaceHolder-Spread-index",
		TableName: "UserDatabase",
		Limit : 5                                                       //Is an optional parameter,and specifies the number of results to be returned by the query
	};
	
	ddb.query(params1, function(err, data) 
	{        
		console.log("queryitem");
		if (err) console.log(err, err.stack);                       // an error occurred
		else
		{   
			console.log("===START===");
			console.log(data);
			console.log("===END===");
		}
	});    
};
