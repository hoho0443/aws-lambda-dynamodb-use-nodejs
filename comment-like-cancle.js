console.log('comment_like_cancle');
var doc = require('dynamodb-doc');
var dynamodb = new doc.DynamoDB();

exports.handler = function(event, context) {
    console.log("Request received:\n", JSON.stringify(event));
    console.log("Context received:\n", JSON.stringify(context));

    var params = {
        TableName : "like",
        ProjectionExpression : "reg_date",
        FilterExpression: "#user_no = :user_no and #contents_no = :contents_no and #reg_date = :reg_date ",
        ExpressionAttributeNames: {
          "#user_no": "user_no",
          "#contents_no": "contents_no",
          "#reg_date": "reg_date"
        },
        ExpressionAttributeValues: {
          ":user_no": event.user_no,
          ":contents_no": event.contents_no,
          ":reg_date": event.reg_date
        }
    };

    dynamodb.scan(params, function(err, data) {
        console.log(data.Count);
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            resultError(context, "query error1");
        } 
        else if (data.Count == "0"){
          console.error("not like:", JSON.stringify(event, null, 2));
          resultError(context, "not like");
        }
        else {
            like_cancle( event.contents_no, event.user_no, event.reg_date, context     );
        }
    });    
}

function like_cancle( contents_no, user_no, reg_date, context  ){
    //hoho
  var params = {
      TableName: 'like',
      Key: { 
        contents_no:  contents_no
      },
      ConditionExpression:"reg_date = :reg_date and user_no = :user_no",
      ExpressionAttributeValues: {
        ":reg_date": reg_date,
        ":user_no": user_no,
      }
    };


    dynamodb.deleteItem(params, function(err, data) {
      if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        resultError(context, "query error2");
      }
      else {
        like_count_update(  contents_no,  reg_date, context );
      }
    }); 
}

function like_count_update(contents_no, reg_date, context){
  var params = {
      TableName: 'comment',
      Key: { 
        contents_no:  contents_no ,
        reg_date: reg_date,
      },
      UpdateExpression: "SET #li = #li + :val",
      ExpressionAttributeNames: {
        '#li': 'like' 
      },
      ExpressionAttributeValues: {
        ":val":-1
      },
      ReturnValues: 'UPDATED_NEW', // optional (NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW)
      ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
      ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
    };
    dynamodb.updateItem(params, function(err, data) {
        if (err) {
          console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
          resultError(context, "query error3");
        }
        else if (!data.Attributes){
          console.error("Unable to query. Error:", JSON.stringify(data, null, 2));
          resultError(context, "comment null");
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



function resultError( context, msg   ){
//query error
// not like
//comment null
    context.succeed( { "result":false,"msg": msg});

}
