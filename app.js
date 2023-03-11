//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose');
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(`mongodb+srv://admin:q0JYmw7LPP8nq5J0@cluster0.fty8ugr.mongodb.net/?retryWrites=true&w=majority`,{useNewUrlParser: true});

const itemsSchema={
  name:String,
};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to do list"
});

const item2=new Item({
  name:"Hit the + button to add a new item"
});

const item3=new Item({
  name:"<-- Hit the delete button to delete"
});

const defaultItems=[item1,item2,item3];


const listSchema={
  name:String,
  items:[itemsSchema]
}; 

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  const query=Item.find({})
.then((x)=>{
  if(x.length===0){
    Item.insertMany(defaultItems).then(()=>{
  console.log("Successfully inserted");
})
.catch((err)=>{
  console.log(err);
})
res.redirect("/");
}
  else{
  res.render("list", {listTitle: "Today", newListItems: x});
  }
})
.catch((err)=>{
  console.log(err);
})
});

app.get("/:customListName",function(req,res){
  const customListName= _.capitalize(req.params.customListName)

  List.findOne({ name: customListName }).then((foundList) => {
    if (!foundList) {
      //Create a new list
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName)
    } else {
      //Show existing list
      res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
    }
  }).catch((err) => {
    console.error(err);
  });
  

  
})

app.post("/", function(req, res){

  const itemName=req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });

  if(listName==="Today"){

    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}).then((foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect(""+listName)
    })
  }
});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.
  checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId).then(()=>{
      console.log("Removed")
      res.redirect("/");
    })
    .catch((err)=>{
      console.log(err);
    })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then((foundList)=>{
      res.redirect("/"+listName)
    })
    .catch((err)=>{
      console.log(err);
    })
  }
})

 

app.get("/about", function(req, res){
  res.render("about");
});

let port =process.env.PORT;
if(port == null || port==""){
  port=3000;
}
app.listen(port, function() {
  console.log("Server started successfully");
});


// admin
// q0JYmw7LPP8nq5J0