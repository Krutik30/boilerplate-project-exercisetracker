const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const User = require('./models/User');
const Exercise = require('./models/Exercise');
require('dotenv').config()


mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log("Database Connected Succesfully!")
}).catch((err) => {
  console.log(err);
})


//User Functions
const findUsers = async (name = '') => {
  //Request for all users
  if (!name) {
    let users = await User.find({});
    // console.log(users);
    return users;
  }
  let users = await User.find({ username: name });
  // console.log(users);
  return users;
}

const createUser = async (name) => {
  const newUser = await User.create({ username: name });
  newUser.save();
  return newUser;
}


// Exercise functions
const findExercise = async (user_id,limit=-1) => {
  let exercises;
  
  if(limit==-1)
  {
    exercises = await Exercise.find({user_id:user_id});
  }
  else{
    exercises = await Exercise.find({user_id:user_id}).limit(limit).exec();
    
  }
  if(exercises.length!=0)
  {
    console.log('Exercise Found!')
    console.log(exercises);
    return exercises;
  }
  else{
    console.log('No exercise found.');
    return null;
  }
}

const createExercise = async (user_id, description, duration, date) => {
  let userDetails = await User.find({ _id: user_id });
  // console.log('Exercise for: ', userDetails);
  // console.log('User ID is: ', user_id);
  // console.log(userDetails);
  if (userDetails.length != 0) {
    // console.log('user Exist!');
    const newExercise = await Exercise.create({
      user_id: user_id,
      username: userDetails[0].username,
      description: description,
      duration: duration,
      date: (date) ? (new Date(date)) : (new Date())
    })
    newExercise.save();
    // console.log('new Exercise created');
    return newExercise;
  }
  else {
    // console.log('user DONT EXIST');
    return null;
  }
}



app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



app.get('/api/users', async (req, res) => {
  let allUsers = await findUsers();

  // console.log("Inside get request")
  // console.log(allUsers);
  res.send(allUsers)
})


app.post('/api/users', bodyParser.urlencoded({ extended: false }), async (req, res) => {
  let postedUserName = req.body.username;
  // console.log("inside post request");
  // console.log(postedUserName);

  //getting the user if exist
  let myUser = await findUsers(postedUserName);

  if (myUser.length == 0) {
    //No user exist. create one!
    myUser = await createUser(postedUserName);
    // console.log(myUser);
  } else {
    myUser = myUser[0];
  }

  res.json({
    username: myUser.username,
    _id: myUser._id
  })
});


app.post('/api/users/:_id/exercises', bodyParser.urlencoded({ extended: false }), async (req, res) => {
  if (req.params._id === '0') {
    return res.json({ error: '_id is required' });
  }
  if (req.body.description === '') {
    return res.json({ error: 'description is required' });
  }

  if (req.body.duration === '') {
    return res.json({ error: 'duration is required' });
  }
  let postedData = req.body;
  // console.log('the post request is:', postedData);
  let createdExercise = await createExercise(req.params._id, postedData.description, postedData.duration, postedData.date);
  // console.log(createdExercise);

  if (createdExercise != null) {
    let responseObj = {
      _id: createdExercise.user_id,
      username: createdExercise.username,
      date: createdExercise.date.toDateString(),
      duration: createdExercise.duration,
      description: createdExercise.description
    }
    res.json(responseObj);
  }

})

app.get('/api/users/:_id/logs', async (req, res) => {
  let user_id = req.params._id;
  let limit = req.query.limit||-1;
  console.log('The limit requested is :',limit);
  console.log('User Requested is: ',user_id);
  let myUser = await User.findById(user_id);
  console.log(myUser);
  let userExercise = await findExercise(user_id,limit);
  console.log(userExercise);
  let resObj={
    _id:myUser._id,
    username:myUser.username,
    count:userExercise.length,
    log:userExercise.map(exercise=>{
      return {
        description:exercise.description,
        duration:exercise.duration,
        date:exercise.date.toDateString()
      }
    })
  }

  res.json(resObj);
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})