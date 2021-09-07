const getUserByEmail = (email, users) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

const getUserID = (email, users) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user.id;
    }
  }
  return undefined;
};

const getUserEmail = (email, users) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user.email;
    }
  }
  return undefined;
};

const getUserPassword = (email, users) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user.password;
    }
  }
  return undefined;
};



module.exports = { getUserID, getUserEmail, getUserPassword, getUserByEmail };