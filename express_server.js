const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const { getUserID, getUserEmail, getUserPassword, getUserByEmail } = require('./helper_funcs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set("view engine", "ejs");

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  dganq8: {
    longURL: "http://www.nhl.com",
    userID: "pgfjczh"
  }
};

const urlsForUser = function(id) {
  const urls = {};
  for (const shortURL in urlDatabase) {
  	if (urlDatabase[shortURL]["userID"] === id) {
    	urls[shortURL] = { "longURL": urlDatabase[shortURL]["longURL"], "userID": id };
    }
  }
  return urls;
};

const generateRandomString = function() {
  return (Math.random() + 1).toString(36).substr(6);
};

app.get("/urls", (req, res) => {
  if (users[req.session.userID]) {
  const templateVars = { 
    urls: urlsForUser(users[req.session.userID]["id"]),
    userID: users[req.session.userID]
  };
  res.render("urls_index", templateVars);
  } else {
    return res.status(401).send('Please log in <a href="/login">here</a> or <a href="/registration">create an account</a>')
  }
});

app.get("/registration", (req, res) => {
  const templateVars = { 
    userID: users[req.session.userID]
  };
  res.render("user_registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    userID: users[req.session.userID]
  };
  res.render("user_login", templateVars);
});

// add new shortURL to database for user, redirect to shortURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.userID;
  urlDatabase[shortURL] = { "longURL": longURL, "userID": userID }
  res.redirect(`urls/${shortURL}`);
});

// generate randomID, check if email matches password, pass errors if not, else create user
app.post("/registration", (req, res) => {
  const user = generateRandomString();
  const { email, password } = req.body;
  console.log(email)
  if (email === "" || password === "") {
    res.status(400).send("Email or password was left blank. Try again.");
  } else if (getUserEmail(email, users)) {
    res.status(400).send("An account already exists under this email. Try again.");
  };
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[user] = {
    "id": user,
    "email": email,
    "password": hashedPassword
  };
  req.session.userID = user;
  res.redirect("/urls");
});

// if logged out or cookie userID doesn't match redirect to /urls else delete url from database
app.post("/urls/:shortURL/delete", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  if (!req.session || req.session.userID !== url["userID"]) {
    res.redirect("/urls")
    return;
  }
  if (req.params.shortURL) {
    delete urlDatabase[req.params.shortURL]
  }
  console.log(urlDatabase);
  res.redirect("/urls");
});

// if logged out or cookie userID doesn't match redirect to /urls ELSE allow editing of shortURL
app.post("/urls/:id", (req, res) => {
  const url = urlDatabase[req.params.id];
  if (!req.session || req.session.userID !== url["userID"]) {
    res.redirect("/urls")
    return;
  }
  const longNewURL = req.body.longURL;
  const userID = req.session.userID;
  urlDatabase[req.params.id] = { "longURL": longNewURL, "userID": userID };
  urlsForUser(userID);
  res.redirect("/urls");
});

// loging if email exists and encrypted passwords match
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userEmail = getUserEmail(email, users);
  const userPassword = getUserPassword(email, users);
  const userID = getUserID(email, users);
  if (!userEmail) {
    res.status(403).send(`No account exists under email: ${email}`);
  } else if (email === userEmail && !bcrypt.compareSync(password, userPassword)) {
    res.status(403).send(`Password incorrect. Try again.`);
  };
  req.session.userID = userID;
  res.redirect("/urls");
});

// if not logged in redirect to login, if user is logged in render templateVars
app.get("/urls/new", (req, res) => {
  if (!users[req.session.userID]) {
    res.redirect("/login")
    return;
  };
  const templateVars = { 
    userID: users[req.session.userID]
  };
  res.render("urls_new", templateVars);
});

// check if url exists/belongs to user, if true render templateVars
app.get("/urls/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  if (!url) {
    return res.send("Error, check your shortened URL");
  }
  if (url["userID"] !== req.session.userID) {
    res.send('Error, not supposed to be here. Please <a href="/registration">register</a> or <a href="/login">login</a>');
  } else {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: url["longURL"],
    userID: users[req.session.userID]
  };
  res.render("urls_show", templateVars);
  }
});

// if url doesn't exist send error
app.get("/u/:shortURL", (req, res) => { 
  const url = urlDatabase[req.params.shortURL];
  if (!url) {
    return res.send("Error, check your shortened URL");
  }
  res.redirect(url["longURL"]);
});

// clear cookies and logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
