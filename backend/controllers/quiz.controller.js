const jwt = require('jsonwebtoken');
const connection = require('../database');

const getQuiz = (req, res) => {
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
          if (data.length == 0) return res.json("Student not enrolled");
          else {
            query = "select * from quiz where course_id=?";
            connection.query(query, [course_id], (err, data) => {
              if (err) {
                return res.json(err);
              } else {
                if (data.length == 0) return res.json("No quiz for this course");
                else return res.json(data);
              }
            });
          }
        }
      });
    }
  });
};

const attemptQuiz = (req, res) => {
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
};

const saveQuizResult = (req, res) => {
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
                query = "INSERT INTO user_answers (student_id, quiz_id, selected_answer) VALUES ?";
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
            query = "insert into quiz_attempts (student_id, quiz_id) values(?, ?)";
            connection.query(query, [student_id, quiz_id], (err, data) => {
              if (err) {
                return res.json(err);
              } else {
                const userAnswersValues = userAnswers.map((answer) => [
                  student_id,
                  quiz_id,
                  answer,
                ]);
                query = "INSERT INTO user_answers (student_id, quiz_id, selected_answer) VALUES ?";
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
};

const getAttemptedQuizzes = (req, res) => {
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
      query = "select * from quiz where quiz_id in (select quiz_id from quiz_attempts where student_id=?) order by quiz_id";
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

const getQuestions = (req, res) => {
  const quiz_id = req.body.id;

  let query = "select * from questions where quiz_id=? order by question_id";
  connection.query(query, [quiz_id], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
};

const getAnswers = (req, res) => {
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
      query = "select selected_answer from user_answers where student_id=? and quiz_id=? order by answer_id";
      connection.query(query, [student_id, quiz_id], (err, data) => {
        if (err) {
          return res.json(err);
        } else {
          return res.json(data);
        }
      });
    }
  });
};

const getQuizByCourseId = (req, res) => {
  const { isTeacherLoggedIn, id: course_id } = req.body;

  if (!isTeacherLoggedIn) {
    return res.json("Login First");
  }

  const query = "SELECT * FROM quiz WHERE course_id=?";
  connection.query(query, [course_id], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
};

const getQuestionsByQuizId = (req, res) => {
  const { isTeacherLoggedIn, quiz_id } = req.body;

  if (!isTeacherLoggedIn) {
    return res.json("Login First");
  }

  const query = "SELECT * FROM questions WHERE quiz_id=?";
  connection.query(query, [quiz_id], (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
};

const addQuiz = (req, res) => {
  const { isTeacherLoggedIn, course_id, title, description } = req.body;

  if (!isTeacherLoggedIn) {
    return res.json("Login First");
  }

  const max_marks = 0;
  const query = "INSERT INTO Quiz (course_id, title, description, max_marks) VALUES (?, ?, ?, ?)";
  connection.query(query, [course_id, title, description, max_marks], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to add quiz' });
    }
    return res.json({ success: true, message: 'Quiz added successfully' });
  });
};

const addQuestion = (req, res) => {
  const { isTeacherLoggedIn, quiz_id, question, option1, option2, option3, option4, correct_option } = req.body;

  if (!isTeacherLoggedIn) {
    return res.json("Login First");
  }

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
        }
        return res.json({ success: true, message: 'Question added successfully' });
      });
    }
  });
};

module.exports = {
  getQuiz,
  attemptQuiz,
  saveQuizResult,
  getAttemptedQuizzes,
  getQuestions,
  getAnswers,
  getQuizByCourseId,
  getQuestionsByQuizId,
  addQuiz,
  addQuestion,
};
