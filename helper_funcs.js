const users = {};

const getUserID = (email) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user.id;
    }
  }
  return null;
};

const getUserEmail = (email) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user.email;
    }
  }
  return null;
};

const getUserPassword = (email) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user.password;
    }
  }
  return null;
};



module.exports = { getUserID, getUserEmail, getUserPassword };