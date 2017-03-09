var express = require('express');

var app = express();

var appRouter = express.Router();

var bodyParser = require('body-parser');

var https = require('https'); 
var crypto = require('crypto');
var request = require('request');

//app.set('port', process.env.PORT || 5000);

var port = process.env.PORT || 5000;

app.use(express.static('public'));
app.use(bodyParser());

app.set('views','./src/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res){
    var result = '';
    res.render('index', {result:result});
});

app.post('/ask',function(req, res, next){
    var nino = req.body.nino;
    var dob = req.body.dob;
    askDobQuestion(nino, dob, res);
    
});

app.listen(port, function(err){
    console.log('running server on port ' + port);
});


function askDobQuestion(custNino, custDob, res) {
    
if(custNino != ''){   
  performRequest('/cis/customer', 'GET', {
    nino: custNino,
    apikey: 'im2IurZLr5YT2dgsmKPXGJcnMsn9ado8'
  }, function(data) {
    console.log('Fetched Json ' + data);
	var responseObject = JSON.parse(data);
    var textResp = "Sorry I am not able to find your details, please try again";
    console.log("responseObject.getCustomerResponse "+responseObject.getCustomerResponse);
    if(responseObject.getCustomerResponse != 'NULL'){        
        var tempDob = responseObject.getCustomerResponse.customer.dob.replace('Z','');
        var newDob = tempDob.substring(8,10)+"-"+tempDob.substring(5,7)+"-"+tempDob.substring(0,4);
        console.log("newDob "+newDob);
        console.log("custDob "+custDob);        
        if (newDob == custDob){
           textResp = "Hi " +responseObject.getCustomerResponse.customer.firstName+"               "+responseObject.getCustomerResponse.customer.lastName+", "+" your next payment is "+responseObject.getCustomerResponse.customer.amount+" and due on "+responseObject.getCustomerResponse.customer.paymentDate.replace('Z','');        
        }	
	}
    res.render('index', {nino: custNino, dob: custDob, result: textResp});
  });
}
else{
    var textResp = "Sorry I am not able to find your details, please try again";
    res.render('index', {nino: custNino, dob: custDob, result: textResp});
}
}

function performRequest(endpoint, method, data, success) {
  var dataString = JSON.stringify(data);
  var headers = {};
  var querystring = require('querystring');
  var responseString = '';
    
  if (method == 'GET') {
    endpoint += '?' + querystring.stringify(data);
	console.log("Endpoint is " + endpoint);
  }
  else {
    headers = {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length
    };
  }
  var options = {
    host: 'mchannelplatform-prod.apigee.net',
    path: endpoint,
    method: method,
    headers: headers
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf-8');   

    res.on('data', function(data) {
		console.log("data " + data);		
         responseString += data;
    });

    res.on('end', function() {
      console.log("Response from Apigee " + responseString);
      success(responseString);
    });
  });

  req.write(dataString);
  req.end();
}
