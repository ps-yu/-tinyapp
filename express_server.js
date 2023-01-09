//Required modules to run the app
const express = require("express");
const cookieSession = require('cookie-session')
const app = express();
const bcrypt = require("bcryptjs")
const {getUserByEmail, generateRandomString, checkPassword, urlsForUser} = require("./helpers");
const {urlDatabase, users} = require("./database")


app.use(cookieSession({
  name : "session",
  keys : ["ndnwekn", "kedsmfd"]
}));
const PORT = 8181; // default port 8080


app.set("view engine", "ejs");

//To parse the data used by the post in human readable form
app.use(express.urlencoded({ extended: true }));

////////////////////
////Get Requests////
////////////////////
app.get("/", (req, res) => {
  const userLogin = req.session.user_id;
  if (userLogin){
    res.redirect("/urls");
  }else {
    res.redirect("/login");
  }
}) 


//To read the url in the database
app.get("/urls", (req, res) => {
//Requesting the cookies from the browser to get user specific information  
  const userLogin = req.session.user_id;
//Condition to check if the user has logged in 
  if (userLogin){
//Using the objet to be rendered created by the urlForUser function
//userLogin.id is the value of the user_id set by the server
    const userUrls = urlsForUser(userLogin.id);
    const templateVars = { 
      username : users[req.session.user_id],
      urls: userUrls };
    console.log("this is templatevar",templateVars);
    res.render("urls_index", templateVars);
  
  }else {
    res.send("<html><body>Please login to see your URL's</body></html>\n")
  }
});

//To vist the url webpage 
app.get("/u/:id", (req, res) => {
  const user = req.params.id;
  const longURL = urlDatabase[user].longURL;
  res.redirect(longURL);
});

//To create a new url
app.get("/urls/new", (req, res) => {
//To verify if the user has logged in 
  const user = req.session.user_id;
  if (user){
    const templateVars = {
      username : req.session.user_id
    }
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//To dynamically show the requested short url
app.get("/urls/:id", (req, res) => {
  const userLogin = req.session.user_id;
//To check if the user has logged in 
  if (userLogin){
//To check if the entered short url exists in the database
    if (req.params.id in urlDatabase){
//To check if the requested url belongs to logged in user
      if (userLogin.id === urlDatabase[req.params.id].userID){
        const templateVars = { 
          username : req.session.user_id,
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
  const userID = req.session.user_id;
  if (userID){
    res.redirect("/urls")
  }else{
    const templateVars = {
      username : ""
    }
    res.render("urls_register", templateVars);  
  }
})

//To create a new form to set up login for the user
app.get("/login", (req,res) => {
//To check if a user has logged in 
  const userID = req.session.user_id;
  if (userID){
    res.redirect("/urls")
  }else{
    const templateVars = {
      username : ""
    }
    res.render("urls_login", templateVars);  
  }
})

///////////////////
///Post Requests///
///////////////////

//To logout the user
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
})

//To crearte short url for the requested website
app.post("/urls", (req, res) => {
  const user = req.session.user_id;
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
    res.redirect(`/urls/${randomString}`)
  }else {
    res.render("error_new");
  }
});


//To delete an existing url
app.post("/urls/:id/delete", (req, res) => {
  const userLogin = req.session.user_id;
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
  const userLogin = req.session.user_id;
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
  } else if (getUserByEmail(req.body.email,users) === false) {
    res.sendStatus(400);
  }else {
    const userRandomID = generateRandomString();
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password,10);
    users[userRandomID] = {
      "id" : userRandomID,
      "email": req.body.email,
      "password": hashedPassword
    }
    req.session.user_id = userRandomID
    res.redirect("/urls")
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
      req.session.user_id = users[object_id];
  };
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on the port ${PORT}!`);
});
