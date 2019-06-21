const express = require("express");
const  bodyParser = require("body-parser");
const app  = express();
app.use(bodyParser.json());
const path = require("path");
const db = require("./db");
const collection = "todos";
const port = 8081;
var Pusher = require('pusher');
var pusher = new Pusher({
  appId: '808913',
  key: 'e03bcce96ecaed8f4f2c',
  secret: '8c66a29d24c2b2e283cd',
  cluster: 'ap2',
  encrypted: true
});



db.connect((err)=>{
    if(err){
        console.log("Could not connect to db");
        console.log(err);
        process.exit(1);
    } else {
        app.listen(port,()=>{
            console.log("Connect to db");
            console.log("Listening to "+port);
        });
        
        const collection = db.getDB().collection('todos');
        const changeStream = collection.watch({ fullDocument: 'updateLookup' });
        changeStream.on('change', next => {
            console.log(next.operationType);
            //newChanges(next.operationType);
            pusher.trigger('changes', next.operationType, next);
        });      
    }
});

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'));
}); 

//CRUD

//CREATE
app.post('/',(req,res)=>{
    var input = req.body;
    db.getDB().collection("todos").insertOne(input,(err,result)=>{
        if(err){
            console.log(err);
        } else {
            //console.log(result);
            res.json({result:result,document:result.ops[0]});
        }
    });
});

//READ 
app.get('/getTodos',(req,res)=>{
    db.getDB().collection("todos").find().toArray((err,docs)=>{
        if(err){
            console.log(err);
        } else {
            console.log("Success");            
            res.json(docs); 
        }
    });
}); 

//UPDATE
app.put('/:id',  (req,res)=>{
    var id = req.params.id;
    var input = req.body.item;
    db.getDB().collection("todos").findOneAndUpdate({_id:db.getPrimaryKey(id)}, {$set:{item:input}},{returnOriginal:false},(err,result)=>{
        if(err){
            console.log(err);
        } else {
            res.json(result);
            //console.log(result);
        }
    });
});

//DELETE
app.delete('/:id',(req,res)=>{
    var id = req.params.id;
    db.getDB().collection("todos").findOneAndDelete({_id:db.getPrimaryKey(id)},(err,result)=>{
        if(err){
            console.log(err);
        } else {
            res.json(result);
        }
    });
});

