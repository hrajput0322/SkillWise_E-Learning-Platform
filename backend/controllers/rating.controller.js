const connection = require("../database");
const jwt = require("jsonwebtoken");

const setRating = (req, res) => {
  const isLoggedIn = req.body.isLoggedIn;
  if (!isLoggedIn) return res.status(401).json("Login First");

  const token = req.body.token;
  const course_id = req.body.id;
  const userRating = req.body.userRating;
  let student_email;
  let student_id;

  jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
    if (err) return res.status(500).json(err);
    student_email = decoded.email;

    const query1 = "SELECT id FROM student WHERE email=?";
    connection.query(query1, [student_email], (err, data) => {
      if (err) return res.status(500).json(err);
      
      student_id = data[0].id;

      const query2 = "SELECT * FROM rating WHERE course_id=? AND student_id=?";
      connection.query(query2, [course_id, student_id], (err, data) => {
        if (err) return res.status(500).json(err);

        if (data.length > 0) {
          const query3 = "UPDATE rating SET rating=? WHERE course_id=? AND student_id=?";
          connection.query(query3, [userRating, course_id, student_id], (err, data) => {
            if (err) return res.status(500).json(err);
            res.json("success");
          });
        } else {
          const query4 = "INSERT INTO rating (course_id, student_id, rating) VALUES (?, ?, ?)";
          connection.query(query4, [course_id, student_id, userRating], (err, data) => {
            if (err) return res.status(500).json(err);
            res.json("success");
          });
        }
      });
    });
  });
};

const updateRating = (req, res) => {
    const isLoggedIn = req.body.isLoggedIn;
    if (!isLoggedIn) return res.status(401).json("Login First");
  
    const course_id = req.body.id;
  
    const query1 = "SELECT AVG(rating) AS average_rating FROM rating WHERE course_id=?";
    connection.query(query1, [course_id], (err, data) => {
      if (err) return res.status(500).json(err);
  
      const newRating = data[0].average_rating;
  
      const query2 = "UPDATE courses SET rating=? WHERE id=?";
      connection.query(query2, [newRating, course_id], (err, data) => {
        if (err) return res.status(500).json(err);
  
        res.json(newRating);
      });
    });
  };

module.exports = { setRating, updateRating };
