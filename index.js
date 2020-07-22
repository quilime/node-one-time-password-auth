// config variables in .env
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const passportJwt = require("passport-jwt");
const { createTransport } = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const { Sequelize, DataTypes } = require("sequelize");


// set up mailer
const mailTransport = createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});


// 6 digit password generator
const generatePassword = () => {
  return Math.floor(100000 + Math.random() * 900000);
};


// mail transport
const sendPasswordViaEmail = (user) => {
  return mailTransport.sendMail({
    from: process.env.FROM_EMAIL,
    to: user.email,
    subject: "Your Login Code 🔑",
    // plain text email body
    text: "Your single-use login code\n\n" + user.password,
    // html email body
    html: "Your single-use login code<br /><br /><strong style='font-size:2em;'>" + user.password + "</strong>",
  });
};


// set up database
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
});


// create user model
const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
  },
  uuid: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
});


// sync DB
sequelize.authenticate()
  .then(() => console.log("DB Connected!"))
  .then(User.sync({ alter : false }))
  .catch(err => console.error("Unable to connect DB:", err));


// JWT auth strategy for passport
const jwtOpts = {
  jwtFromRequest: (req) => {
    let token = null;
    // get JWT from cookie
    if (req && req.cookies) token = req.cookies["token"];
    return token;  
  },
  secretOrKey: process.env.JWT_SECRET
};
passport.use(new passportJwt.Strategy(jwtOpts, (jwt_payload, next) => {

  console.log("check JWT payload", jwt_payload);

  // if user has a password in the tokens payload, redirect them to /login
  if (jwt_payload.password) {
    next(null, false);
  }
  else {
    User.findOne({ where: { uuid: jwt_payload.uuid }})
      .then((user) => {
        next(null, user);
      })
      .catch((err) => {
        console.log(err);
        next(null, false);
      });
  }
}));


// auth middleware
const checkAuth = passport.authenticate("jwt", {
  session: false,
  failureRedirect: "/login"
});


// set up app and routes
const app = express();
app.use(passport.initialize());
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieParser());
app.get("/", function(req, res) {
  res.json({  message: "Status 200" });
});


// get all users
app.get("/users", (req, res) => {
  User.findAll().then(users => res.json(users));
});


// register
app.post("/register", (req, res) => {
  const { email } = req.body;
  try {

    const password = generatePassword();

    User.findOne({ where: { email: email }})
      .then((user) => {
        // create a new user if doesn't exist
        if (user) {
          return user.update({ password: password });
        }
        else {
          return User.create({ email: email, password: password, uuid: uuidv4() });
        }
      })
      .then((user) => {

        // create JWT with user's uuid and the generated password
        let payload = {
          uuid: user.uuid,
          password: password
        };
        let token = jwt.sign(payload, jwtOpts.secretOrKey);

        // store token in cookie
        res.cookie("token", token, { httpOnly: true });
        return user;
      })
      .then(user => sendPasswordViaEmail(user))
      .then((emailSendResult) => {
        console.log(emailSendResult);
        res.json({ msg: "One-time password " + password + " emailed to " + email });
      });
  } catch (err) {
    throw new Error(err);
  }
});


// login
app.post("/login", (req, res) => {

  // decode token from cookie
  const token = req.cookies["token"];
  var decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const { password } = req.body;

  if (password && decodedToken.uuid) {
    User.findOne({where: { uuid: decodedToken.uuid }})
      .then((user) => {
        if (!user) {
          throw "User not found";
        }
        if (user.password === password) {
        // delete password after it's been used
          return user.update({ password: null });
        } else {
          throw "Incorrect password";
        }
      })
      .then((user) => {
      // create new token with just user uuid

        let payload = {
          uuid: user.uuid
        };
        let newToken = jwt.sign(payload, jwtOpts.secretOrKey);

        // replace token in client cookie
        res.cookie("token", newToken, { httpOnly: true });
        res.json({ email: user.email, message: "Login successful!" });
      })
      .catch(err => {
        res.status(401).json({ error: err });
      });
  }
  else {
    res.status(401).json({ error: "Go to /register to generate a new password." });
  }
});


// login get
app.get("/login", (req, res) => {
  res.status(401).json({ message: "Unauthorized" });
});


// logout
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out"});
});


// protected route
app.get("/protected", checkAuth, (req, res) => {
  res.json({ email: req.user.email, message: "This is a protected route." });
});


// start app
app.listen(process.env.PORT, () => {
  console.log("Listening on port " + process.env.PORT);
});
