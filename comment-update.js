console.log('comment_update');
var doc = require('dynamodb-doc');
var dynamodb = new doc.DynamoDB();

exports.handler = function(event, context) {
    console.log("Request received:\n", JSON.stringify(event));
    console.log("Context received:\n", JSON.stringify(context));

    var params = {
        TableName: 'comment',
        Key: { 
          contents_no:  event.contents_no ,
          reg_date: event.reg_date,
        },
        UpdateExpression: 'SET #comment =:val1',
        ExpressionAttributeNames: {
          '#comment': 'comment' 
        },
        ExpressionAttributeValues: {
          ':val1': event.comment
        },
        ReturnValues: 'UPDATED_OLD', // optional (NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW)
        ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
        ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
    };

    
    dynamodb.updateItem(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            context.succeed( 
                { "result":false,
                  "msg": err
                }
            );
        }
        else if (!data.Attributes){
            console.error("data null:", JSON.stringify(event, null, 2));
            context.succeed( 
                { "result":false,
                  "msg": "comment null"
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

