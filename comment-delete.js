console.log('comment_delete');
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
        }
    };
    
    dynamodb.deleteItem(params, function(err, data) {
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

//{
//  "contents_no": "1000006459",
//  "reg_date": "14730598828771111",
//}