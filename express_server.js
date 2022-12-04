const express = require("express");
const cookieParser = require("cookie-parser");
const { redirect } = require("statuses");
const app = express();
app.use(cookieParser());
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

//To read the url in the database
app.get("/urls", (req, res) => {
  const templateVars = { 
    username : req.cookies["username"],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//To vist the url webpage
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

//To create a new url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//To dynamically show the requested short url
app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    username : req.cookies["username"],
    id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

<<<<<<< HEAD
=======
//To create cookie when the user log's in
app.post("/login", (req,res) => {
  res.cookie("username", req.body.login);
  res.redirect("/urls");
});

//To logout the user
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls")
})

>>>>>>> feature/cookies
//To crearte short url for the requested website
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect("/urls")
});

//To delete an existing url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
})

//To update an existing url
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.updatedURL;
  res.redirect("/urls")
})



app.listen(PORT, () => {
  console.log(`Example app listening on the port ${PORT}!`);
});
