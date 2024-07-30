const connection = require('../database');
const jwt = require('jsonwebtoken');

const getCourses = (req, res) => {
    let { searchTerm, limit, offset } = req.body;
    searchTerm = searchTerm.toLowerCase();
    let query = "";
    let params = [];
  
    if (searchTerm === "") {
      query =
        "SELECT id, img, title, descr, tag, rating FROM courses LIMIT ? OFFSET ?";
      params = [limit, offset];
    } else {
      query = `SELECT id, img, title, descr, tag, rating 
               FROM courses 
               WHERE LOWER(title) LIKE ? OR LOWER(tag) LIKE ? 
               LIMIT ? OFFSET ?`;
      params = [`%${searchTerm}%`, `%${searchTerm}%`, limit, offset];
    }
  
    connection.query(query, params, (err, data) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        return res.json(data);
      }
    });
  };

const alreadyEnrolled = (req, res) => {
  const isLoggedIn = req.body.isLoggedIn;
  if (!isLoggedIn) return res.json("Login First");

  const token = req.body.token;
  const course_id = req.body.id;
  let student_email;
  let student_id;

  jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
    student_email = decoded.email;
  });

  let query = "select id from student where email=?";
  connection.query(query, [student_email], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      student_id = data[0].id;
      query = "select * from enrolled where student_id=? and course_id=?";
      connection.query(query, [student_id, course_id], (err, data) => {
        if (err) {
          return res.json(err);
        } else {
          if (data.length > 0) return res.json("Already Enrolled");
          else return res.json("Not Enrolled");
        }
      });
    }
  });
};

const enroll = (req, res) => {
  const isLoggedIn = req.body.isLoggedIn;
  if (!isLoggedIn) return res.json("Login First");

  const token = req.body.token;
  const course_id = req.body.id;
  let student_email;
  let student_id;

  jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
    student_email = decoded.email;
  });

  let query = "select id from student where email=?";
  connection.query(query, [student_email], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      student_id = data[0].id;
      query = "insert into enrolled (student_id, course_id) values (?, ?)";
      connection.query(query, [student_id, course_id], (err, data) => {
        if (err) {
          return res.json(err);
        } else {
          return res.json("Enrolled successfully");
        }
      });
    }
  });
};

const getCourseTitle = (req, res) => {
  const isLoggedIn = req.body.isLoggedIn;
  if (!isLoggedIn) return res.json("Login First");

  const course_id = req.body.id;
  let query = "select title from courses where id=?";
  connection.query(query, [course_id], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      res.json(data);
    }
  });
};

const getVideos = (req, res) => {
  const isLoggedIn = req.body.isLoggedIn;
  if (!isLoggedIn) return res.json("Login First");

  const course_id = req.body.id;
  let query = "select * from course_videos where course_id=? order by video_id";
  connection.query(query, [course_id], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      res.json(data);
    }
  });
};

const getEnrolledCourses = (req, res) => {
  const token = req.body.token;
  let student_email;
  let student_id;

  jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
    student_email = decoded.email;
  });

  let query = "select id from student where email=?";
  connection.query(query, [student_email], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      student_id = data[0].id;
      query =
        "select * from courses where id in (select course_id from enrolled where student_id=?)";
      connection.query(query, [student_id], (err, data) => {
        if (err) {
          return res.json(err);
        } else {
          return res.json(data);
        }
      });
    }
  });
};

const viewCourse = (req, res) => {
  const isLoggedIn = req.body.isLoggedIn;
  if (!isLoggedIn) return res.json("Login First");

  const course_id = req.body.id;
  let query = "select * from courses where id=?";
  connection.query(query, [course_id], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
};

const addCourse = (req, res) => {
  const { token, isTeacherLoggedIn, title, descr, tag, price, url } = req.body;
  const rating = 0;

  if (!isTeacherLoggedIn) {
    return res.json({ success: false, message: "Login First" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.json({
        success: false,
        error: "Failed to authenticate token.",
      });
    }

    const teacher_email = decoded.email;
    const fetchTeacherIdQuery = "SELECT id FROM teacher WHERE email = ?";
    connection.query(fetchTeacherIdQuery, [teacher_email], (err, result) => {
      if (err) {
        return res.json({ success: false, error: err });
      }

      if (result.length === 0) {
        return res.json({ success: false, error: "Teacher not found." });
      }

      const teacher_id = result[0].id;
      const query = "INSERT INTO courses(img, title, descr, tag, teacher_id, price, rating) VALUES (?, ?, ?, ?, ?, ?, ?)";
      connection.query(query, [url, title, descr, tag, teacher_id, price, rating], (err, data) => {
        if (err) {
          return res.json({ success: false, error: err });
        } else {
          return res.json({
            success: true,
            message: "Course added successfully",
          });
        }
      });
    });
  });
};

const addVideo = (req, res) => {
  const { token, isTeacherLoggedIn, course_id, title, descr, url } = req.body;

  if (!isTeacherLoggedIn) {
    return res.json({ success: false, message: "Login First" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.json({
        success: false,
        error: "Failed to authenticate token.",
      });
    }

    const query = "INSERT INTO course_videos(course_id, video_link, video_description, video_title) VALUES (?, ?, ?, ?)";
    connection.query(query, [course_id, url, descr, title], (err, result) => {
      if (err) {
        return res.json({ success: false, error: err });
      } else {
        return res.json({ success: true, message: "Video added successfully" });
      }
    });
  });
};

module.exports = {
  getCourses,
  alreadyEnrolled,
  enroll,
  getCourseTitle,
  getVideos,
  getEnrolledCourses,
  viewCourse,
  addCourse,
  addVideo,
};
