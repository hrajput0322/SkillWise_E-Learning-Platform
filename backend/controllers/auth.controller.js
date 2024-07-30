const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../database');

const login = (req, res) => {
  const query = "SELECT * FROM student WHERE email=?";
  let email = req.body.email;
  let password = req.body.password;

  connection.query(query, [email], (err, data) => {
    if (err) {
      return res.json({ error: err.message });
    }

    if (data.length > 0) {
      bcrypt.compare(password, data[0].password, (err, result) => {
        if (err) {
          return res.json({ error: err.message });
        }

        if (result === true) {
          jwt.sign(
            {
              name: data[0].name.toString(),
              email: data[0].email.toString(),
            },
            process.env.SECRET_KEY,
            { expiresIn: "30d" },
            (err, token) => {
              if (err) {
                return res.json({ error: err.message });
              }
              res.json(token);
            }
          );
        } else {
          return res.json("Wrong Credentials");
        }
      });
    } else {
      return res.json("Wrong Credentials");
    }
  });
};

const signup = (req, res) => {
    const { name, email, password } = req.body;
    let query = "SELECT * FROM student WHERE email=?";
  
    connection.query(query, [email], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
  
      if (data.length > 0) {
        return res.status(400).json("Email already exists");
      }
  
      const saltRounds = 10;
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
          return res.status(500).json("Error generating salt");
        }
  
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            return res.status(500).json("Error hashing password");
          }
  
          query = "INSERT INTO student (name, email, password) VALUES (?, ?, ?)";
          connection.query(query, [name, email, hash], (err, data) => {
            if (err) {
              return res.status(500).json("Registration Failed");
            }
  
            jwt.sign(
              {
                name: name.toString(),
                email: email.toString(),
              },
              process.env.SECRET_KEY,
              { expiresIn: "30d" },
              (err, token) => {
                if (err) {
                  return res.status(500).json("Error generating token");
                }
                res.json(token);
              }
            );
          });
        });
      });
    });
  };

const teacherLogin = (req, res) => {
  const query = "select * from teacher where email=?";
  const email = req.body.email;
  const password = req.body.password;

  connection.query(query, [email], (err, data) => {
    if (err) {
      return res.json(err);
    }
    if (data.length > 0) {
      bcrypt.compare(password, data[0].password, (err, result) => {
        if (err) {
          return res.json(err);
        }
        if (result) {
          return jwt.sign(
            {
              name: data[0].name.toString(),
              email: data[0].email.toString(),
            },
            process.env.SECRET_KEY,
            { expiresIn: "30d" },
            (err, token) => {
              if (err) {
                return res.json(err);
              }
              res.json(token);
            }
          );
        } else {
          return res.json("Wrong Credentials");
        }
      });
    } else {
      return res.json("Wrong Credentials");
    }
  });
};

const teacherSignup = (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const bio = req.body.bio;

  const query = "select * from teacher where email=?";
  connection.query(query, [email], (err, data) => {
    if (err) {
      return res.json(err);
    }
    if (data.length > 0) {
      return res.json("Email already exists");
    } else {
      const saltRounds = 10;
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
          return res.json(err);
        }
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            return res.json(err);
          }
          const insertQuery =
            "insert into teacher (name, email, bio, rating, password) values (?, ?, ?, ?, ?)";
          connection.query(
            insertQuery,
            [name, email, bio, 0, hash],
            (err, data) => {
              if (err) {
                return res.json("Registration Failed");
              }
              return jwt.sign(
                {
                  name: name.toString(),
                  email: email.toString(),
                },
                process.env.SECRET_KEY,
                { expiresIn: "30d" },
                (err, token) => {
                  if (err) {
                    return res.json(err);
                  }
                  res.json(token);
                }
              );
            }
          );
        });
      });
    }
  });
};

module.exports = {
  login,
  signup,
  teacherLogin,
  teacherSignup,
};
