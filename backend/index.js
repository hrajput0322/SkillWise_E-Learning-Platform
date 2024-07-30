const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

var razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database: " + err.stack);
    return;
  }
  console.log(
    "Connected to MySQL database with threadId: " + connection.threadId
  );
});

app.post("/login", (req, res) => {
  const query = "select * from student where email=?";
  let email = req.body.email;
  let password = req.body.password;
  connection.query(query, [email], (err, data) => {
    if (data.length > 0) {
      bcrypt.compare(password, data[0].password, function (err, result) {
        if (result == true) {
          return jwt.sign(
            {
              name: data[0].name.toString(),
              email: data[0].email.toString(),
            },
            process.env.SECRET_KEY,
            { expiresIn: "30d" },
            (err, token) => {
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
});

app.post("/signup", (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  let query = "select * from student where email=?";

  connection.query(query, [email], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      if (data.length > 0) {
        return res.json("Email already exists");
      } else {
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function (err, salt) {
          bcrypt.hash(password, salt, function (err, hash) {
            query =
              "insert into student(name, email, password) values(?, ?, ?)";
            connection.query(query, [name, email, hash], (err, data) => {
              if (err) {
                return res.json("Registration Failed");
              } else {
                return jwt.sign(
                  {
                    name: name.toString(),
                    email: email.toString(),
                  },
                  process.env.SECRET_KEY,
                  { expiresIn: "30d" },
                  (err, token) => {
                    res.json(token);
                  }
                );
              }
            });
          });
        });
      }
    }
  });
});

app.post("/dashboard", (req, res) => {
  const token = req.body.token;
  const isLoggedIn = req.body.isLoggedIn;
  if (!isLoggedIn) return res.json("Login First");
  jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
    res.json(decoded);
  });
});

app.post("/courses", (req, res) => {
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
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

app.post("/viewCourse", (req, res) => {
  const isLoggedIn = req.body.isLoggedIn;
  if (!isLoggedIn) return res.json("Login First");
  const id = req.body.id;
  const query = "select * from courses where id=?";
  connection.query(query, [id], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

app.post("/viewInstructor", (req, res) => {
  const isLoggedIn = req.body.isLoggedIn;
  if (!isLoggedIn) return res.json("Login First");
  const id = req.body.id;
  const query = "select * from teacher where id=?";
  connection.query(query, [id], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

app.post("/alreadyEnrolled", (req, res) => {
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
});

app.post("/enroll", (req, res) => {
  const isLoggedIn = req.body.isLoggedIn;
  if (!isLoggedIn) return res.json("Login First");
  const token = req.body.token;
  const course_id = req.body.course_id;
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
      query = "insert into enrolled values(?, ?)";
      connection.query(query, [student_id, course_id], (err, data) => {
        if (err) {
          return res.json(err);
        } else {
          return res.json("Enrolled Successfully");
        }
      });
    }
  });
});

app.post("/getCourseTitle", (req, res) => {
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
});

app.post("/getVideos", (req, res) => {
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
});

app.post("/setRating", (req, res) => {
  const isLoggedIn = req.body.isLoggedIn;
  if (!isLoggedIn) return res.json("Login First");
  const token = req.body.token;
  const course_id = req.body.id;
  const userRating = req.body.userRating;
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
      query = "select * from rating where course_id=? and student_id=?";
      connection.query(query, [course_id, student_id], (err, data) => {
        if (err) {
          return res.json(err);
        } else {
          if (data.length > 0) {
            query =
              "update rating set rating=? where course_id=? and student_id=?";
            connection.query(
              query,
              [userRating, course_id, student_id],
              (err, data) => {
                if (err) {
                  return res.json(err);
                } else {
                  return res.json("success");
                }
              }
            );
          } else {
            query =
              "insert into rating (course_id, student_id, rating) values(?,?,?)";
            connection.query(
              query,
              [course_id, student_id, userRating],
              (err, data) => {
                if (err) {
                  return res.json(err);
                } else {
                  return res.json("success");
                }
              }
            );
          }
        }
      });
    }
  });
});

app.post("/updateRating", (req, res) => {
  const isLoggedIn = req.body.isLoggedIn;
  if (!isLoggedIn) return res.json("Login First");
  const course_id = req.body.id;
  let query =
    "select avg(rating) as average_rating from rating where course_id=?";
  connection.query(query, [course_id], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      query = "update courses set rating=? where id=?";
      const newRating = data[0].average_rating;
      connection.query(query, [newRating, course_id], (err, data) => {
        if (err) {
          return res.json(err);
        } else {
          return res.json(newRating);
        }
      });
    }
  });
});

app.post("/quiz", (req, res) => {
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
          if (data.length == 0) return res.json("student not enrolled");
          else {
            query = "select * from quiz where course_id=?";
            connection.query(query, [course_id], (err, data) => {
              if (err) {
                return res.json(err);
              } else {
                if (data.length == 0)
                  return res.json("no quiz for this course");
                else return res.json(data);
              }
            });
          }
        }
      });
    }
  });
});

app.post("/attemptQuiz", (req, res) => {
  const isLoggedIn = req.body.isLoggedIn;
  if (!isLoggedIn) return res.json("Login First");
  const quiz_id = req.body.id;
  let query = "select * from questions where quiz_id=? order by question_id";
  connection.query(query, [quiz_id], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

app.post("/saveQuizResult", (req, res) => {
  const token = req.body.token;
  const quiz_id = req.body.quizId;
  const userAnswers = req.body.userAnswers;
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
      query = "select * from quiz_attempts where student_id=? and quiz_id=?";
      connection.query(query, [student_id, quiz_id], (err, data) => {
        if (err) return res.json(err);
        else {
          if (data.length > 0) {
            query = "delete from user_answers where student_id=? and quiz_id=?";
            connection.query(query, [student_id, quiz_id], (err, data) => {
              if (err) return res.json(err);
              else {
                const userAnswersValues = userAnswers.map((answer) => [
                  student_id,
                  quiz_id,
                  answer,
                ]);
                query =
                  "INSERT INTO user_answers (student_id, quiz_id, selected_answer) VALUES ?";
                connection.query(query, [userAnswersValues], (err, data) => {
                  if (err) {
                    return res.json({ error: "Failed to save user answers." });
                  }
                  return res.json({
                    message: "Quiz result saved successfully.",
                  });
                });
              }
            });
          } else {
            query =
              "insert into quiz_attempts (student_id, quiz_id) values(?, ?)";
            connection.query(query, [student_id, quiz_id], (err, data) => {
              if (err) {
                return res.json(err);
              } else {
                const userAnswersValues = userAnswers.map((answer) => [
                  student_id,
                  quiz_id,
                  answer,
                ]);
                query =
                  "INSERT INTO user_answers (student_id, quiz_id, selected_answer) VALUES ?";
                connection.query(query, [userAnswersValues], (err, data) => {
                  if (err) {
                    return res.json({ error: "Failed to save user answers." });
                  }
                  return res.json({
                    message: "Quiz result saved successfully.",
                  });
                });
              }
            });
          }
        }
      });
    }
  });
});

app.post("/getEnrolledCourses", (req, res) => {
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
});

app.post("/getAttemptedQuizzes", (req, res) => {
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
        "select * from quiz where quiz_id in (select quiz_id from quiz_attempts where student_id=?) order by quiz_id";
      connection.query(query, [student_id], (err, data) => {
        if (err) {
          return res.json(err);
        } else {
          return res.json(data);
        }
      });
    }
  });
});

app.post("/getQuestions", (req, res) => {
  const quiz_id = req.body.id;

  let query = "select * from questions where quiz_id=? order by question_id";
  connection.query(query, [quiz_id], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

app.post("/getAnswers", (req, res) => {
  const token = req.body.token;
  const quiz_id = req.body.id;
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
        "select selected_answer from user_answers where student_id=? and quiz_id=? order by answer_id";
      connection.query(query, [student_id, quiz_id], (err, data) => {
        if (err) {
          return res.json(err);
        } else {
          return res.json(data);
        }
      });
    }
  });
});

app.post("/paymentVerification", async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;

  const body_data = razorpay_order_id + "|" + razorpay_payment_id;

  const expect = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
    .update(body_data)
    .digest("hex");

  const isValid = expect === razorpay_signature;
  if (isValid) {
    return res.json({ success: true, message: "Payment successful" });
  } else {
    return res.json({ success: false, message: "Payment failed" });
  }
});

app.post("/checkout", async (req, res) => {
  const { name, amount } = req.body;
  const order = await razorpay.orders.create({
    amount: Number(amount * 100),
    currency: "INR",
  });

  return res.json({ order });
});

app.post("/teacherLogin", (req, res) => {
  const query = "select * from teacher where email=?";
  let email = req.body.email;
  let password = req.body.password;
  connection.query(query, [email], (err, data) => {
    if (data.length > 0) {
      bcrypt.compare(password, data[0].password, function (err, result) {
        if (result == true) {
          return jwt.sign(
            {
              name: data[0].name.toString(),
              email: data[0].email.toString(),
            },
            process.env.SECRET_KEY,
            { expiresIn: "30d" },
            (err, token) => {
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
});

app.post("/teacherSignup", (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  let bio = req.body.bio;
  let query = "select * from teacher where email=?";

  connection.query(query, [email], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      if (data.length > 0) {
        return res.json("Email already exists");
      } else {
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function (err, salt) {
          bcrypt.hash(password, salt, function (err, hash) {
            query =
              "insert into teacher(name, email, bio, rating, password) values(?, ?, ?, ?, ?)";
            connection.query(
              query,
              [name, email, bio, 0, hash],
              (err, data) => {
                if (err) {
                  return res.json("Registration Failed");
                } else {
                  return jwt.sign(
                    {
                      name: name.toString(),
                      email: email.toString(),
                    },
                    process.env.SECRET_KEY,
                    { expiresIn: "30d" },
                    (err, token) => {
                      res.json(token);
                    }
                  );
                }
              }
            );
          });
        });
      }
    }
  });
});

app.post("/teacherDashboard", (req, res) => {
  const token = req.body.token;
  const isTeacherLoggedIn = req.body.isTeacherLoggedIn;

  if (!isTeacherLoggedIn) {
    return res.json({ message: "Login First" });
  }

  jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
    if (err) {
      return res.json({ error: "Failed to authenticate token." });
    }

    const teacher_email = decoded.email;

    let query = "SELECT * FROM teacher WHERE email = ?";
    connection.query(query, [teacher_email], (err, data) => {
      if (err) {
        return res.json({ error: err });
      } else {
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
        } else {
          return res.json({ message: "No teacher found with this email." });
        }
      }
    });
  });
});

app.post("/getTeacherCourses", (req, res) => {
  const token = req.body.token;
  const isTeacherLoggedIn = req.body.isTeacherLoggedIn;

  if (!isTeacherLoggedIn) {
    return res.json({ message: "Login First" });
  }

  jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
    if (err) {
      return res.json({ error: "Failed to authenticate token." });
    }

    const teacher_email = decoded.email;
    let teacher_id;

    let query = "SELECT id FROM teacher WHERE email = ?";
    connection.query(query, [teacher_email], (err, data) => {
      if (err) {
        return res.json({ error: err });
      } else {
        if (data.length > 0) {
          teacher_id = data[0].id;
          query = "select * from courses where teacher_id=?";
          connection.query(query, [teacher_id], (err, data) => {
            if (err) {
              return res.json({ error: err });
            } else {
              if (data.length > 0) {
                return res.json(data);
              }
            }
          });
        } else {
          return res.json({ message: "No teacher found with this email." });
        }
      }
    });
  });
});

app.post("/setTeacherRating", (req, res) => {
  const course_id = req.body.id;
  let teacher_id;

  // Step 1: Retrieve teacher_id from courses table
  let query = "SELECT teacher_id FROM courses WHERE id=?";
  connection.query(query, [course_id], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      teacher_id = data[0].teacher_id;

      // Step 2: Calculate average rating for courses where teacher_id = teacher_id
      let avgRatingQuery =
        "SELECT AVG(rating) AS avg_rating FROM courses WHERE teacher_id=?";
      connection.query(avgRatingQuery, [teacher_id], (err, avgData) => {
        if (err) {
          return res.json(err);
        } else {
          const averageRating = avgData[0].avg_rating || 0;

          // Step 3: Update teacher's rating in the teacher table
          let updateQuery = "UPDATE teacher SET rating=? WHERE id=?";
          connection.query(
            updateQuery,
            [averageRating, teacher_id],
            (err, updateResult) => {
              if (err) {
                return res.json(err);
              } else {
                return res.json({ averageRating });
              }
            }
          );
        }
      });
    }
  });
});

app.post("/setTeacherEarningAndStudentEnrolled", (req, res) => {
  const course_id = req.body.id;
  let teacher_id;
  let amount;

  // Step 1: Retrieve teacher_id and price from courses table
  let query = "SELECT teacher_id, price FROM courses WHERE id=?";
  connection.query(query, [course_id], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      teacher_id = data[0].teacher_id;
      amount = data[0].price;
      amount = (amount * 80) / 100; // Assuming 80% of the course price goes to the teacher

      // Step 2: Update students_enrolled and earning for the teacher
      let updateQuery =
        "UPDATE teacher SET students_enrolled = students_enrolled + 1, earning = earning + ? WHERE id = ?";
      connection.query(
        updateQuery,
        [amount, teacher_id],
        (err, updateResult) => {
          if (err) {
            return res.json(err);
          } else {
            return res.json({
              message:
                "Teacher earnings and students enrolled updated successfully",
            });
          }
        }
      );
    }
  });
});

app.post("/addCourse", (req, res) => {
  const token = req.body.token;
  const isTeacherLoggedIn = req.body.isTeacherLoggedIn;
  const { title, descr, tag, price, url } = req.body;
  const rating = 0;

  if (!isTeacherLoggedIn) {
    return res.json({ success: false, message: "Login First" });
  }

  jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
    if (err) {
      return res.json({
        success: false,
        error: "Failed to authenticate token.",
      });
    }

    const teacher_email = decoded.email;
    let teacher_id;

    // Fetch the teacher_id from the database based on the teacher_email
    const fetchTeacherIdQuery = "SELECT id FROM teacher WHERE email = ?";
    connection.query(fetchTeacherIdQuery, [teacher_email], (err, result) => {
      if (err) {
        return res.json({ success: false, error: err });
      }

      if (result.length === 0) {
        return res.json({ success: false, error: "Teacher not found." });
      }

      teacher_id = result[0].id;

      let query =
        "INSERT INTO courses(img, title, descr, tag, teacher_id, price, rating) VALUES (?, ?, ?, ?, ?, ?, ?)";
      connection.query(
        query,
        [url, title, descr, tag, teacher_id, price, rating],
        (err, data) => {
          if (err) {
            return res.json({ success: false, error: err });
          } else {
            return res.json({
              success: true,
              message: "Course added successfully",
            });
          }
        }
      );
    });
  });
});

app.post("/addVideo", (req, res) => {
  const token = req.body.token;
  const isTeacherLoggedIn = req.body.isTeacherLoggedIn;
  const { course_id, title, descr, url } = req.body;

  if (!isTeacherLoggedIn) {
    return res.json({ success: false, message: "Login First" });
  }

  jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
    if (err) {
      return res.json({
        success: false,
        error: "Failed to authenticate token.",
      });
    }

    // Fetch the teacher_id from the database based on the teacher_email
    const query =
      "insert into course_videos(course_id, video_link, video_description, video_title) values (?, ?, ?, ?)";
    connection.query(query, [course_id, url, descr, title], (err, result) => {
      if (err) {
        return res.json({ success: false, error: err });
      } else {
        return res.json({ success: true, message: "Video added successfully" });
      }
    });
  });
});

app.post("/getQuizByCourseId", (req, res) => {
  const isTeacherLoggedIn = req.body.isTeacherLoggedIn;
  if (!isTeacherLoggedIn) return res.json("Login First");
  const course_id = req.body.id;

  query = "select * from quiz where course_id=?";
  connection.query(query, [course_id], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

app.post('/getQuestionsByQuizId', (req, res) => {
  const isTeacherLoggedIn = req.body.isTeacherLoggedIn;
  if (!isTeacherLoggedIn) return res.json("Login First");
  const quiz_id = req.body.quiz_id;

  query = "select * from questions where quiz_id=?";
  connection.query(query, [quiz_id], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

app.post('/addQuiz', (req, res) => {
  const isTeacherLoggedIn = req.body.isTeacherLoggedIn;
  if (!isTeacherLoggedIn) {
    return res.json("Login First");
  }
  
  const { course_id, title, description } = req.body;
  const max_marks = 0;
  
  const query = "INSERT INTO Quiz (course_id, title, description, max_marks) VALUES (?, ?, ?, ?)";
  connection.query(query, [course_id, title, description, max_marks], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to add quiz' });
    } else {
      return res.json({ success: true, message: 'Quiz added successfully' });
    }
  });
});

app.post('/addQuestion', (req, res) => {
  const isTeacherLoggedIn = req.body.isTeacherLoggedIn;
  if (!isTeacherLoggedIn) {
    return res.json("Login First");
  }
  
  const { quiz_id, question, option1, option2, option3, option4, correct_option } = req.body;
  
  let query = "INSERT INTO questions (quiz_id, question, option1, option2, option3, option4, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)";
  connection.query(query, [quiz_id, question, option1, option2, option3, option4, correct_option], (err, result) => {
    if (err) {
      console.error('Error inserting question:', err);
      return res.status(500).json({ success: false, message: 'Failed to add question' });
    } else {
      query = "UPDATE quiz SET max_marks = max_marks + 1 WHERE quiz_id = ?";
      connection.query(query, [quiz_id], (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Failed to update max_marks' });
        } else {
          return res.json({ success: true, message: 'Question added successfully' });
        }
      });
    }
  });
});



app.listen(3000, () => {
  console.log("server is running on port 3000");
});
