const express = require('express')
const app = express()
const cors = require('cors')
const { ObjectId } = require('mongodb');
require('dotenv').config()

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let USERS = [];
let EXCERCISES = [];
let LOGS = [];


app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (!username) {
    res.json({ error: 'Invalid username' });
    return;
  }
  const _id = new ObjectId();
  const newUser = { _id: _id.toString(), username: username };
  USERS.push(newUser);
  LOGS.push({ ...newUser, count: 0, log: [] });
  res.json(newUser);
});

app.get('/api/users', (req, res) => {
  res.json(USERS);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  if (!_id) {
    res.json({ error: 'Invalid ID' });
    return;
  }
  if (!description || !duration || !date) {
    res.json({ error: 'Invalid data' });
    return;
  }
  console.log(date);
  const user = USERS.find(u => u._id === _id);
  const excerciseObj = {
    description: description,
    duration: parseInt(duration),
    date: new Date(date).toDateString()
  };
  const newExercise = {
    /*username: user.username,
    _id: user._id,*/
    ...user,
    ...excerciseObj
  };
  EXCERCISES.push(newExercise);

  const logIndex = LOGS.findIndex(l => l._id === _id);
  LOGS[logIndex] = {
    ...LOGS[logIndex],
    count: LOGS[logIndex].count + 1,
    log: [...LOGS[logIndex].log, excerciseObj]
  };

  res.json(newExercise);
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  if (!_id) {
    res.json({ error: 'Invalid ID' });
    return;
  }
  const log = LOGS.find(l => l._id === _id);
  if (from && isValidDate(from)) {
    log.log.filter(l => l.date >= from);
  }
  if (to && isValidDate(to)) {
    log.log.filter(l => l.date <= to);
  }
  if (limit && !isNaN(limit)) {
    const lim = parseInt(limit);
    if (log.log.length > lim) {
      log.log = log.log.slice(0, lim);
    }
  }
  res.json(log);
});


function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
