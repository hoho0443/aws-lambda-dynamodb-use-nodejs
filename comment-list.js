console.log('comment_list');
var doc = require('dynamodb-doc');
var dynamodb = new doc.DynamoDB();

exports.handler = function(event, context) {
    console.log("Request received:\n", JSON.stringify(event));
    console.log("Context received:\n", JSON.stringify(context));

    var params = {
        TableName : "comment",
        KeyConditionExpression: "#content = :content_no ",
        FilterExpression: "attribute_exists(user_no)",
        ScanIndexForward : false,
        ExpressionAttributeNames:{
            "#content": "content"
        },
        ExpressionAttributeValues: {
            ":content_no":event.content_no
        }
    };

    
    dynamodb.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            context.succeed( 
                { "result":false,
                  "msg": err
                }
            );
        } 
        else {
          if( event.user_no ){
            check_like_user_no(event.content_no, event.user_no , data, context);
          }
          else{
            var result = new Array();
            data.Items.forEach(function(item) {
                var is_user = false;
                if( event.user_no == item.user_no ){
                    is_user = true;
                } 
                result.push ( 
                    { reg_date: item.reg_date  , 
                      user_no: item.user_no  , 
                      comment: unescape(item.comment)  , 
                      like: item.like  , 
                      user_name: item.user_name  ,
                      is_user: is_user ,
                      is_like: false
                    }   
                );
            });
            context.succeed( 
                { "result":true,
                  "data": result
                }
            );
          }
        }
    });    
}

//로그인한 유저가 like를 한적이 있는지 check
function check_like_user_no(content_no, user_no, comment_data, context){
  var params = {
      TableName : "like",
      ProjectionExpression : "reg_date",
      FilterExpression: "#user_no = :user_no and #content_no = :content_no ",
      ExpressionAttributeNames: {
        "#user_no": "user_no",
        "#content_no": "content_no"
      },
      ExpressionAttributeValues: {
        ":user_no": user_no,
        ":content_no": content_no
      }
  };

  dynamodb.scan(params, function(err, data) {
    console.log("like cnt : " + data.Count);
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        resultError(context, "query error1");
    }
    else{
      var result = new Array();
      
      if( data.Count >0  ){
        comment_data.Items.forEach(function(comment_item) {
          data.Items.forEach(function(item){
            var is_user = false;
            var is_like = false;
            if( user_no == comment_item.user_no ){
              is_user = true;
            }
            if( comment_item.reg_date == item.reg_date ){
              is_like = true; 
            }
            result.push ( 
                { reg_date: comment_item.reg_date  , 
                  user_no: comment_item.user_no  , 
                  comment: unescape(comment_item.comment)  , 
                  like: comment_item.like  , 
                  user_name: comment_item.user_name  ,
                  is_user: is_user ,
                  is_like: is_like
                }   
            );
          });                
        });
      }
      else{
        comment_data.Items.forEach(function(comment_item) {
          var is_user = false;
          var is_like = false;
          if( user_no == comment_item.user_no ){
            is_user = true;
          }
          result.push ( 
              { reg_date: comment_item.reg_date  , 
                user_no: comment_item.user_no  , 
                comment: unescape(comment_item.comment)  , 
                like: comment_item.like  , 
                title: comment_item.title  , 
                user_name: comment_item.user_name  ,
                is_user: is_user ,
                is_like: is_like
              }   
          );
        });                
      }
      context.succeed( 
          { "result":true,
            "data": result
          }
      );
    }
  });  
}

//{
//  "contents_no": "1000006459"
//}