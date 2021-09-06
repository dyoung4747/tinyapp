// const users = {}; // users variable needs to come from express_server.js

const getUserID = (email, users) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user.id;
    }
  }
  return null;
};

const getUserEmail = (email, users) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user.email;
    }
  }
  return null;
};

const getUserPassword = (email, users) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user.password;
    }
  }
  return null;
};



module.exports = { getUserID, getUserEmail, getUserPassword };