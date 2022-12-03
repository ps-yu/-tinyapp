const express = require("express");
const { redirect } = require("statuses");
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = () => {
  var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var result = ""
  var charactersLength = characters.length;

  for ( var i = 0; i < 6 ; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

app.set("view engine", "ejs");

//To parse the data used by the post in human readable form
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.updatedURL;
  res.redirect("/urls")
})


app.listen(PORT, () => {
  console.log(`Example app listening on the port ${PORT}!`);
});
