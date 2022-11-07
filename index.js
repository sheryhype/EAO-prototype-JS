var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());


app.get('/',function(req,res){
  res.send("Hello world");
});

app.listen(8000,function(){
	console.log("App running on 8000");
})