const express = require("express");
const cookieParser = require("cookie-parser");
const { redirect } = require("statuses");
const { application } = require("express");
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

//Database to store the urls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Database to store the userID and passwords
const users = {
};

const generateRandomString = () => {
  var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var result = ""
  var charactersLength = characters.length;

  for ( var i = 0; i < 6 ; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
//Function to check if the user email exists
const getUserByEmail = inputEmail => {
  for (let user in users){
    if (users[user].email === inputEmail){
      return false;
    }
  }
}

//Function to check if the user email exists
const checkPassword = (inputEmail,inputPassword) => {
  for (let user in users){
    if (users[user].email === inputEmail){
      if (users[user].password === inputPassword){
        return true;
      }
    }
  }
}


app.set("view engine", "ejs");

//To parse the data used by the post in human readable form
app.use(express.urlencoded({ extended: true }));

//To read the url in the database
app.get("/urls", (req, res) => {
  console.log(users);
  const templateVars = { 
    username : req.cookies["user_id"],
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
  const templateVars = {
    username : req.cookies["user_id"]
  }
  res.render("urls_new", templateVars);
});

//To dynamically show the requested short url
app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    username : req.cookies["user_id"],
    id: req.params.id, 
    longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

//To create a new email and password for the user
app.get("/register", (req,res) => {
  console.log(users);
  res.render("urls_register");
})

//To create a new form to set up login for the user
app.get("/login", (req,res) => {
  res.render("urls_login");
})

//To logout the user
app.post("/logout", (req, res) => {
  console.log(users);
  res.clearCookie("user_id");
  res.redirect("/login");
})

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

//To create a new user ID 
app.post("/register", (req,res) =>{
  console.log(users);
  if (req.body.email === "" || req.body.password === ""){
    res.sendStatus(400);
    res.send("Please provide a valid response");
  } else if (getUserByEmail(req.body.email) === false) {
    console.log(getUserByEmail(req.body.email));
    res.sendStatus(400);
  }else {
    const userRandomID = generateRandomString();
    users[userRandomID] = {
      "id" : userRandomID,
      "email": req.body.email,
      "password": req.body.password
    }
    res.cookie("user_id", users[userRandomID]);
    res.redirect("/urls")
  }
})

//To create a new login method for the users
app.post("/login", (req,res) =>{
  const userRandomID = generateRandomString();
  if (req.body.email === "" || req.body.password === ""){
    res.sendStatus(403);
    res.send("Please provide a valid response");
  }
  if (checkPassword(req.body.email , req.body.password) === true){
    users[userRandomID] = {
      "id" : userRandomID,
      "email": req.body.email,
      "password": req.body.password
    }
    res.cookie("user_id", users[userRandomID]);
    res.redirect("/urls")
  } else {
    res.sendStatus(403);
  };
  res.cookie("user_id", users[userRandomID]);
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on the port ${PORT}!`);
});