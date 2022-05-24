//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://admin-khaled:Hgshpgdmhvr28@cluster0.rov2m.mongodb.net/todolistDB');

const itemsSchema = {
  name: String
};

const Item = mongoose.model('Item', itemsSchema);
const item1 = new Item({
  name: 'First item'
})
const item2 = new Item({
  name: 'Second item'
})
const item3 = new Item({
  name: 'Third item'
})
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model('List', listSchema);

app.get("/", function (req, res) {

  const day = date.getDate();
  Item.find({}, (err, foundItem) => {
    if (foundItem.length === 0) {
      Item.insertMany(defaultItems, err => {
        if (err) console.log(err);
        else console.log('Done');
      });
      res.redirect('/');
    } else
      res.render("list", { listTitle: day, newListItems: foundItem });

  })


});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const day = date.getDate();

  const item = new Item({
    name: itemName
  })
  if (listName === day) {
    item.save();
    res.redirect('/');
  } else {
    List.findOne(
      { name: listName }, function (err, foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect('/' + listName);
      });
  }

});
app.post('/delete', (req, res) => {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;
  const day = date.getDate();

  if (listName === day) {
    Item.findByIdAndRemove(itemId, err => { }
    );
    res.redirect('/');
  }else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, (err, foundList)=>{
      if (!err) res.redirect('/' + listName);
    })
  }
})

app.get("/:customListName", function (req, res) {
  const listName = req.params.customListName;
  List.findOne({ name: listName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: listName,
          items: []
        });
        list.save();
        res.redirect('/' + listName);

      } else
        res.render('List', { listTitle: foundList.name, newListItems: foundList.items })
    }
  })

});

app.get("/about", function (req, res) {
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server started succefully");
});
