const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const connection = require("./database");
const { login, signup, teacherLogin, teacherSignup } = require("./controllers/auth.controller");
const { dashboard } = require("./controllers/dashboard.controller");
const { setRating, updateRating } = require("./controllers/rating.controller");
const { alreadyEnrolled, enroll, getCourseTitle, getVideos, getEnrolledCourses, getCourses, viewCourse, addCourse, addVideo } = require("./controllers/course.controller");
const { getQuiz, attemptQuiz, saveQuizResult, getAttemptedQuizzes, getQuestions, getAnswers, getQuizByCourseId, getQuestionsByQuizId, addQuiz, addQuestion } = require("./controllers/quiz.controller");
const { checkout, paymentVerification } = require("./controllers/payment.controller");
const { teacherDashboard, getTeacherCourses, setTeacherRating, setTeacherEarningAndStudentEnrolled, viewInstructor } = require("./controllers/teacher.controller");


const app = express();
app.use(cors());
app.use(express.json());

var razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

app.post("/login", login);

app.post("/signup", signup);

app.post("/dashboard", dashboard);

app.post("/courses", getCourses);

app.post("/viewCourse", viewCourse);

app.post("/viewInstructor", viewInstructor);

app.post("/alreadyEnrolled", alreadyEnrolled);

app.post("/enroll", enroll);

app.post("/getCourseTitle", getCourseTitle);

app.post("/getVideos", getVideos);

app.post("/setRating", setRating);

app.post("/updateRating", updateRating);

app.post("/quiz", getQuiz);

app.post("/attemptQuiz", attemptQuiz);

app.post("/saveQuizResult", saveQuizResult);

app.post("/getAttemptedQuizzes", getAttemptedQuizzes);

app.post("/getQuestions", getQuestions);

app.post("/getAnswers", getAnswers);

app.post("/getEnrolledCourses", getEnrolledCourses);

app.post("/paymentVerification", paymentVerification);

app.post("/checkout", checkout);

app.post("/teacherLogin", teacherLogin);

app.post("/teacherSignup", teacherSignup);

app.post("/teacherDashboard", teacherDashboard);

app.post("/getTeacherCourses", getTeacherCourses);

app.post("/setTeacherRating", setTeacherRating);

app.post("/setTeacherEarningAndStudentEnrolled", setTeacherEarningAndStudentEnrolled);

app.post("/addCourse", addCourse);

app.post("/addVideo", addVideo);

app.post("/getQuizByCourseId", getQuizByCourseId);

app.post('/getQuestionsByQuizId', getQuestionsByQuizId);

app.post('/addQuiz', addQuiz);

app.post('/addQuestion', addQuestion);



app.listen(3000, () => {
  console.log("server is running on port 3000");
});
