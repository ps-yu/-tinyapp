const express = require("express");
const cookieParser = require("cookie-parser");
const { redirect } = require("statuses");
const { application } = require("express");
const app = express();
const bcrypt = require("bcryptjs")
app.use(cookieParser());
const PORT = 8080; // default port 8080

//Database to store the urls
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//Database to store the userID and passwords
const users = {
};

//Function to create a random string for the short URLs
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

//Function to match the user password
const checkPassword = (inputEmail,inputPassword) => {
  for (let user in users){
    if (users[user].email === inputEmail){
      if (users[user].password === inputPassword){
        return user;
      }
    }
  }
  return false;
}

//Function to filter the userDatabase by the user_id;
const urlsForUser = user => {
// Create a new object that contains the user specific URL and id 
  let database = {};
  for (let id in urlDatabase){
    if (urlDatabase[id].userID === user){
      database[id] = urlDatabase[id].longURL
    }
  }
//Return the object that is created by the user
  return database;
}

app.set("view engine", "ejs");

//To parse the data used by the post in human readable form
app.use(express.urlencoded({ extended: true }));

//To read the url in the database
app.get("/urls", (req, res) => {
  console.log(users);
  console.log(urlDatabase);
//Requesting the cookies from the browser to get user specific information  
  const userLogin = req.cookies["user_id"];
//Condition to check if the user has logged in 
  if (userLogin){
//Using the objet to be rendered created by the urlForUser function
//userLogin.id is the value of the user_id set by the server
    const userUrls = urlsForUser(userLogin.id);
    const templateVars = { 
      username : req.cookies["user_id"],
      urls: userUrls };
    res.render("urls_index", templateVars);
  }else {
    res.send("<html><body>Please login to see your URL's</body></html>\n")
  }
});

//To vist the url webpage 
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

//To create a new url
app.get("/urls/new", (req, res) => {
//To verify if the user has logged in 
  const user = req.cookies["user_id"];
  if (user){
    const templateVars = {
      username : req.cookies["user_id"]
    }
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//To dynamically show the requested short url
app.get("/urls/:id", (req, res) => {
  const userLogin = req.cookies["user_id"];
//To check if the user has logged in 
  if (userLogin){
//To check if the entered short url exists in the database
    if (req.params.id in urlDatabase){
//To check if the requested url belongs to logged in user
      if (userLogin.id === urlDatabase[req.params.id].userID){
        const templateVars = { 
          username : req.cookies["user_id"],
          id: req.params.id, 
          longURL: urlDatabase[req.params.id].longURL };
        res.render("urls_show", templateVars);
      }else {
        res.send("<html><body>You are not authorised to edit this URL</body></html>\n")
      }
    }else{
      res.send("<html><body>The specified URL doesn't exist</body></html>\n")
    }
  }else {
    res.send("<html><body>Please login to see your URL's</body></html>\n");
  }
});

//To create a new email and password for the user
app.get("/register", (req,res) => {
  const user = req.cookies["user_id"];
//To check if the user has logged in 
  if (user){
    res.redirect("/urls");
  }else {
    res.render("urls_register");
  }
})

//To create a new form to set up login for the user
app.get("/login", (req,res) => {
//To check if a user has logged in 
  const user = req.cookies["user_id"];
  if (user){
    res.redirect("/urls");
  }else {
    res.render("urls_login");
  }
})

//To logout the user
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
})

//To crearte short url for the requested website
app.post("/urls", (req, res) => {
  const user = req.cookies["user_id"];
//To check if a user has logged in the website
  if (user){
//To create a short url for the website
    const randomString = generateRandomString();
//Creating a new object with the values of longUrl and userID
    const object = {
      longURL : req.body.longURL,
      userID : user.id
    }
//Updating the database with above object and short url as property
    urlDatabase[randomString] = object;
    console.log(urlDatabase);
    res.redirect("/urls")
  }else {
    res.render("error_new");
  }
});


//To delete an existing url
app.post("/urls/:id/delete", (req, res) => {
  const userLogin = req.cookies["user_id"];
//To check if a user has logged on 
  if (userLogin){
//To check if the url exists in the database
    if (req.params.id in urlDatabase){
//To authenticate if the logged in user owns the url
      if (userLogin.id === urlDatabase[req.params.id].userID){
        delete urlDatabase[req.params.id];
        res.redirect("/urls")
      }else {
        res.send("<html><body>You are not authorised to edit this URL</body></html>\n")
      }
    }else{
      res.send("<html><body>The specified URL doesn't exist</body></html>\n")
    }
  }else {
    res.send("<html><body>Please login to see your URL's</body></html>\n");
  }
})

//To update an existing url
app.post("/urls/:id", (req, res) => {
  const userLogin = req.cookies["user_id"];
//To check if a user has logged in 
  if (userLogin){
//To check if the url exists in the database
    if (req.params.id in urlDatabase){
//To validate if the user owns the url needed to be updated
      if (userLogin.id === urlDatabase[req.params.id].userID){
        //Updating the value of the new URL
        urlDatabase[req.params.id] = {
          longURL : req.body.updatedURL,
          userID : userLogin.id};
        res.redirect("/urls")
      }else {
        res.send("<html><body>You are not authorised to edit this URL</body></html>\n")
      }
    }else{
      res.send("<html><body>The specified URL doesn't exist</body></html>\n")
    }
  }else {
    res.send("<html><body>Please login to see your URL's</body></html>\n");
  }
})

//To create a new user ID 
app.post("/register", (req,res) =>{
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
    res.redirect("/login")
  }
})

//To create a new login method for the users
app.post("/login", (req,res) =>{
  let object_id ;
  //If the user tries to login without any email and password
  if (req.body.email === "" || req.body.password === ""){
    res.sendStatus(403);
    res.send("Please provide a valid response");
  }
/*Validating the user id and email provided by the user withthe checkPassword function*/
  if (checkPassword(req.body.email , req.body.password) === false){
    res.sendStatus(403);
  } else {
//Setting up on abject to be used as cookie by the browser
    const object_id = checkPassword(req.body.email, req.body.password
      );
      res.cookie("user_id", users[object_id]);
  };
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on the port ${PORT}!`);
});