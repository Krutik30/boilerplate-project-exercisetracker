
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// MONGO_URI="mongodb+srv://agherakrutik99:Aghera799045Krutik@cluster0.8qz7spt.mongodb.net/exercise?retryWrites=true&w=majority";

mongoose.connect("mongodb+srv://agherakrutik99:Aghera799045Krutik@cluster0.8qz7spt.mongodb.net/exercise?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("DB YES YES");
}).catch((err) => {
  console.log(err);
});

const userSchema = mongoose.Schema({
    username: {
      type: String,
      unique: true,
      require: true
    }
  }, { versionKey: false });

const User = mongoose.model("User", userSchema);

const exerciseSchema = mongoose.Schema({
  username : String,
  description : String,
  duration : Number,
  date : Date,
  _id : {type : String}
}, {versionKey: false});

const Exe = mongoose.model("Exe", exerciseSchema);

app.post("/api/users", async (req, res) => {

  let userName = req.body.username;
  let _id = req.body._id;

  const user = await User.create({
    username: userName
  })
  res.json(user)
})

app.get("/api/users" , async (req,res)=>{
  const users = await User.find();
  res.send(users);
})

app.post("/api/users/:_id/exercises" , async (req,res)=>{

  const userId = req.params["_id"];
  let {description , duration , date} = req.body;
  const userFound = await User.findById(userId);

  if(!date){
    date = new Date();
  }else{
    date = new Date(date);
  }
  await Exe.create({
    username : userFound.username,
    description,
    duration,
    date,
    _id : userId
  })

  const user = {
    _id : userId,
    username : userFound.username,
    date : date.toDateString(),
    duration : Number(duration),
    description,
  }

  res.json(user);
});

app.get("/api/users/:_id/logs" , async (req, res)=>{

  let {to , from , limit} = req.query;
  limit = limit || -1;
  const userId = req.params._id;
  // console.log(userId);
  const user = await User.findById(userId);
  // console.log(user);
  if(user == null){
    res.send("No ID found for user")
  }
  let exes = null;
  if(limit==-1)
    exes = await Exe.find({_id: userId});
  else
    exes = await Exe.find({_id: userId}).limit(limit).exec();

  if(exes == null){
    res.send("No ID found for exe")
  }
  let f = new Date(from);
  let t = new Date(to);

  let dateObj = {};

  if(from)
    dateObj["$gte"] = new Date(from);
  if(to)
    dateObj["$lte"] = new Date(to); 


  const arr = exes.map((e) => {


    // if(e.date > f && e.date < t){
      return {
        description : e.description,
        duration : e.duration,
        date : e.date.toDateString()
      }
    // }

  })

  // console.log(arr);

  const exeObj = {
    username: user.username,
    count : arr.length,
    userId,
    log : arr
  }
  // console.log(exeObj);
  // console.log(exes);
  res.json(exeObj);
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
