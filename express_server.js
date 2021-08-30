const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function() {
  return (Math.random() + 1).toString(36).substr(6);
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  // res.send(shortURL);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params.shortURL)
  if (req.params.shortURL) {
    delete urlDatabase[req.params.shortURL]
  }
  res.redirect("/urls");
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => { 
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});