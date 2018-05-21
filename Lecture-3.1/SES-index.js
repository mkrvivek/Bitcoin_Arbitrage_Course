var aws = require('aws-sdk');
var ses = new aws.SES();

exports.handler = function(event, context, callback){
   var eParams = {
        Destination: {
            ToAddresses: ["To Address"]
        },
        Message: {
            Body: {
                Text: {
                    Data: "Hey! What is up?"
                }
            },
            Subject: {
                Data: "First SNS Email!!!"
            }
        },
        Source: "From Address"
    };
    
	console.log('===SENDING EMAIL===');
    var email = ses.sendEmail(eParams, function(err, data){
        if(err) console.log(err);
        else {
            console.log("===EMAIL SENT===");
            console.log(data);


            console.log("EMAIL CODE END");
            console.log('EMAIL: ', email);
        }
    });
};




