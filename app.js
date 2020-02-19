//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-ankur:test123@cluster0-8xn6c.mongodb.net/todolistDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false
});
const itemShema = {
  name: String
};
const listShema = {
  name: String,
  items:[itemShema]
};
const List = mongoose.model("list", listShema);
const Item = mongoose.model("Item", itemShema);
const i1 = new Item({
  name: "Welcome to yout toDoList"
});
const i2 = new Item({
  name: "Hit plus to add new Item"
});
const i3 = new Item({
  name: "<--Hit this to delete a item"
});
const defaultItem = [i1, i2, i3];


app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItem, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added all the Items");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });


});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName==="Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}

});
app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully deeted checked Item");
        res.redirect("/");
      }
    });
  }else{
      List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
        if(!err){
          res.redirect("/"+listName);
        }
      });
  }

});
app.get("/:p",function(req,res){
  const customListName=_.capitalize(req.params.p);
  List.findOne({name: customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create new list
        const list=new List({
          name:customListName,
          items:defaultItem
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        //show list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });


});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
