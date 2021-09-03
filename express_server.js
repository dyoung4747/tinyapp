const express = require('express');
const cookies = require('cookie-parser');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const { getUserID, getUserEmail, getUserPassword } = require('./helper_funcs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookies());

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

const generateRandomString = function() {
  return (Math.random() + 1).toString(36).substr(6);
};

app.post("/registration", (req, res) => {
  const user = generateRandomString();
  const { email, password } = req.body;
  if (email === "" || password === "") {
    res.status(400).send("Email or password was left blank. Try again.");
  } else if (getUserID(email)) {
    res.status(400).send("An account already exists under this email. Try again.");
  };
  users[user] = {
    "id": user,
    "email": email,
    "password": password
  };
  res.cookie("userID", user);
  res.redirect("/urls");
});
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    userID: users[req.cookies["userID"]]
  };
  console.log(urlDatabase)
  res.render("urls_index", templateVars);
});
app.get("/registration", (req, res) => {
  const templateVars = { 
    userID: users[req.cookies["userID"]]
  };
  res.render("user_registration", templateVars);
});
app.get("/login", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    userID: users[req.cookies["userID"]]
  };
  res.render("user_login", templateVars);
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  console.log(longURL)
  const userID = req.cookies;
  urlDatabase[shortURL] = { "longURL": longURL, "userID": userID.userID }
  res.redirect(`urls/${shortURL}`);
  console.log(urlDatabase)

});
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.params.shortURL) {
    delete urlDatabase[req.params.shortURL]
  }
  res.redirect("/urls");
});
app.post("/urls/:id", (req, res) => {
  const longNewURL = req.body.longURL;
  urlDatabase[req.params.id] = longNewURL;
  res.redirect("/urls");
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userEmail = getUserEmail(email);
  const userPassword = getUserPassword(email);
  const userID = getUserID(email);
  if (!userEmail) {
    res.status(403).send(`No account exists under email: ${email}`);
  } else if (email === userEmail && password !== userPassword) {
    res.status(403).send(`Password incorrect. Try again.`);
  };
  res.cookie("userID", userID);
  res.redirect("/urls");
});
app.get("/urls/new", (req, res) => {
  if (!users[req.cookies["userID"]]) {
    res.redirect("/login")
    return;
  };
  const templateVars = { 
    userID: users[req.cookies["userID"]]
  };
  res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  if (!url) {
    return res.send("Error, check your shortened URL");
  }
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: url["longURL"],
    userID: users[req.cookies["userID"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => { 
  const url = urlDatabase[req.params.shortURL];
  if (!url) {
    return res.send("Error, check your shortened URL");
  }
  res.redirect(url["longURL"]);
});
app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/urls");
});
app.get("/", (req, res) => {
  res.send('Hello!');
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
