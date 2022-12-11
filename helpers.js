//Function to check if the user email exists
const getUserByEmail = (inputEmail,database) => {
  for (let user in database){
    if (database[user].email === inputEmail){
      return false;
    }
  }
  return undefined;
}
module.exports = getUserByEmail;