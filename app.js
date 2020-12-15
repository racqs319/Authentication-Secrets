require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  }
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.render('home');
});

app.route('/login')
  .get((req, res) => {
    res.render('login');
  })
  .post((req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    User.findOne({
      email: email
    }, (err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          if (foundUser.password === password) {
            res.render('secrets');
          }
        }
      }
    });
  });

app.route('/register')
  .get((req, res) => {
    res.render('register');
  })
  .post((req, res) => {
    const user = new User({
      email: req.body.username,
      password: req.body.password
    });

    user.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.render('secrets');
      }
    });
  });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
