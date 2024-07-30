const jwt = require('jsonwebtoken');
const connection = require('../database');

const teacherDashboard = (req, res) => {
  const { token, isTeacherLoggedIn } = req.body;

  if (!isTeacherLoggedIn) {
    return res.json({ message: "Login First" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.json({ error: "Failed to authenticate token." });
    }

    const teacher_email = decoded.email;
    const query = "SELECT * FROM teacher WHERE email = ?";
    connection.query(query, [teacher_email], (err, data) => {
      if (err) {
        return res.json({ error: err });
      }
      if (data.length > 0) {
        const teacherData = {
          name: data[0].name,
          email: data[0].email,
          bio: data[0].bio,
          rating: data[0].rating,
          students_enrolled: data[0].students_enrolled,
          earning: data[0].earning,
        };
        return res.json(teacherData);
      }
      return res.json({ message: "No teacher found with this email." });
    });
  });
};

const getTeacherCourses = (req, res) => {
  const { token, isTeacherLoggedIn } = req.body;

  if (!isTeacherLoggedIn) {
    return res.json({ message: "Login First" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.json({ error: "Failed to authenticate token." });
    }

    const teacher_email = decoded.email;
    let query = "SELECT id FROM teacher WHERE email = ?";
    connection.query(query, [teacher_email], (err, data) => {
      if (err) {
        return res.json({ error: err });
      }
      if (data.length > 0) {
        const teacher_id = data[0].id;
        query = "SELECT * FROM courses WHERE teacher_id=?";
        connection.query(query, [teacher_id], (err, data) => {
          if (err) {
            return res.json({ error: err });
          }
          if (data.length > 0) {
            return res.json(data);
          }
          return res.json({ message: "No courses found for this teacher." });
        });
      } else {
        return res.json({ message: "No teacher found with this email." });
      }
    });
  });
};

const setTeacherRating = (req, res) => {
  const { id: course_id } = req.body;
  let query = "SELECT teacher_id FROM courses WHERE id=?";
  connection.query(query, [course_id], (err, data) => {
    if (err) {
      return res.json(err);
    }
    const teacher_id = data[0].teacher_id;
    let avgRatingQuery = "SELECT AVG(rating) AS avg_rating FROM courses WHERE teacher_id=?";
    connection.query(avgRatingQuery, [teacher_id], (err, avgData) => {
      if (err) {
        return res.json(err);
      }
      const averageRating = avgData[0].avg_rating || 0;
      let updateQuery = "UPDATE teacher SET rating=? WHERE id=?";
      connection.query(updateQuery, [averageRating, teacher_id], (err, updateResult) => {
        if (err) {
          return res.json(err);
        }
        return res.json({ averageRating });
      });
    });
  });
};

const setTeacherEarningAndStudentEnrolled = (req, res) => {
  const { id: course_id } = req.body;
  let query = "SELECT teacher_id, price FROM courses WHERE id=?";
  connection.query(query, [course_id], (err, data) => {
    if (err) {
      return res.json(err);
    }
    const teacher_id = data[0].teacher_id;
    const amount = (data[0].price * 80) / 100;
    let updateQuery = "UPDATE teacher SET students_enrolled = students_enrolled + 1, earning = earning + ? WHERE id = ?";
    connection.query(updateQuery, [amount, teacher_id], (err, updateResult) => {
      if (err) {
        return res.json(err);
      }
      return res.json({ message: "Teacher earnings and students enrolled updated successfully" });
    });
  });
};

const viewInstructor = (req, res) => {
    const isLoggedIn = req.body.isLoggedIn;
    if (!isLoggedIn) return res.status(401).json("Login First");
  
    const id = req.body.id;
    const query = "SELECT * FROM teacher WHERE id=?";
    connection.query(query, [id], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        return res.json(data);
      }
    });
  };

module.exports = {
  teacherDashboard,
  getTeacherCourses,
  setTeacherRating,
  setTeacherEarningAndStudentEnrolled,
  viewInstructor,
};
