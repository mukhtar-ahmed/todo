const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = mongoose.Schema({
    name: {
        require: true,
        type: String
    }
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    name: 'Its tea time'
});
const item2 = new Item({
    name: 'Its Cofee time'
});
const item3 = new Item({
    name: 'Its water time'
});
const defaultList = [item1, item2, item3];

const listSchema = mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model('List', listSchema);


app.get('/', function (req, res) {
  
    Item.find({}).then((items) => {
        console.log(items);
        if (items.length == 0) {
            Item.insertMany(defaultList).then((data) => {
                console.log('Added');
                res.redirect("/");
            }).catch((err) => {
                console.log(err);
            });
        }
        else {
            res.render('list', { dayName: 'Title', newListItem: items });
        }
    });

});

app.post('/', async function (req, res) {
    console.log(req.body);
    console.log();

    const passedItem = req.body.list;
    const itemABC = Item({
        name: req.body.newItem
    });
    
    List.findOne({name:passedItem}).then((foundedList)=>{
        foundedList.items.push(itemABC);
        foundedList.save();
        res.redirect('/'+passedItem);
    }).catch((err)=>{
       console.log(err);
       
    });
    

    // var item = req.body.newItem;
    // if (req.body.list === 'Work') {
    //     workItems.push(item);
    //     res.redirect('/work');
    // }
    // else {
    //     await Item({
    //         name: item
    //     }).save();
    //     res.redirect('/');
    // }
});

app.get('/:customListName', async function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }).then(async (
        foundItem
    ) => {
        console.log(foundItem);
        if (foundItem) {
            console.log('Alredy');
            res.render('list', { dayName: foundItem.name, newListItem: foundItem.items });
    
        }
        else {
            console.log('Add now');
            await List({
                name: customListName,
                items: defaultList
            }).save();
            res.redirect(`/${customListName}`);
        }
    });


    


})

app.get('/about', function (req, res) {
    res.render("about");
});

app.get('/work', function (req, res) {
    res.render("list", { dayName: "Work Day", newListItem: workItems });
});

app.post('/work', function () {
    var item = req.body.newItem;
    workItems.push(item);
    res.redirect('/work');
});

app.post('/delete', function (req, res) {
    console.log(req.body);
    console.log('abc');
    
    console.log(req.body.listTitle);
    console.log('abc');

    List.findOneAndUpdate({name: req.body.listTitle},{$pull:{items:{_id:req.body.checkbox}}}).then(()=>{
        console.log('Deleted');
        res.redirect("/"+req.body.listTitle);
    }).catch((error)=>{
        console.log(error);
    });

    
    
    // Item.deleteOne({ _id: req.body.checkbox }).then(() => {
    //     console.log('Deleted');
    //     res.redirect("/");
    // }).catch((error) => {
    //     console.log(error);

    // });

});

app.listen(3000, function () {
    console.log('Runing on 3000');
});