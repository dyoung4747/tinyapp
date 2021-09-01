const express = require('express');
const cookies = require('cookie-parser');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookies());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function() {
  return (Math.random() + 1).toString(36).substr(6);
};

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});
app.get("/registration", (req, res) => {
  console.log(req.params)
  const templateVars = { 
    username: req.cookies["username"]
  };
  res.render("user_registration", templateVars);
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);
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
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => { 
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => { 
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    return res.send("Error, check your shortened URL");
  };
  res.redirect(longURL);
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