console.log('comment-add');
var doc = require('dynamodb-doc');
var dynamodb = new doc.DynamoDB();

exports.handler = function(event, context) {
    console.log("Request received:\n", JSON.stringify(event));
    console.log("Context received:\n", JSON.stringify(context));

    var tableName = "comment";
    var datetime = new Date().getTime().toString();
    var item = {
        "user_no": event.user_no,
        "user_name": event.user_name,
        "comment": event.comment,
        "like": 0,
        "reg_date" : datetime
    };
    console.log("Item:\n", item);
    dynamodb.putItem(
      {
        "TableName": tableName,
        "Item": item
      }, 
      function(err, data) {
        if (err) {
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
//  "user_no": "1000013068",
//  "user_name": "nickname",
//  "comment": "comment content"
//}