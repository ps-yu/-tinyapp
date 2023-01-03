const {urlDatabase,users} = require("./database");
const bcrypt = require("bcryptjs")

//Function to check if the user email exists
const getUserByEmail = (inputEmail,database) => {
  for (let user in database){
    if (database[user].email === inputEmail){
      return false;
    }
  }
  return undefined;
}
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
//Function to match the user password
const checkPassword = (inputEmail,inputPassword) => {
  for (let user in users){
    if (users[user].email === inputEmail){
      if (bcrypt.compareSync(inputPassword,users[user].password)){
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
  

module.exports = {getUserByEmail, generateRandomString, checkPassword, urlsForUser};