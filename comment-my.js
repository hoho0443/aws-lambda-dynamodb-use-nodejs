console.log('comment_list');
var doc = require('dynamodb-doc');
var dynamodb = new doc.DynamoDB();

exports.handler = function(event, context) {
    console.log("Request received:\n", JSON.stringify(event));
    console.log("Context received:\n", JSON.stringify(context));

    var params = {
        TableName : "comment",
        ProjectionExpression : "#user_no,reg_date,contents_no,#co,#li,user_name",
        FilterExpression: "#user_no = :user_no",
        ExpressionAttributeNames: {
          "#user_no": "user_no",
          "#co": "comment",
          "#li": "like",
        },
        ExpressionAttributeValues: {
          ":user_no": event.user_no
        }
    };

    
    dynamodb.scan(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            context.succeed( 
                { "result":false,
                  "msg": err
                }
            );
        } 
        else {
            context.succeed( 
                { "result":true,
                  "data": data
                }
            );
        }
    });    
}

