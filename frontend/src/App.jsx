import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Footer from "./components/Footer";
import Courses from "./components/Courses";
import ViewCourse from "./components/ViewCourse";
import ViewInstructor from "./components/ViewInstructor";
import ViewCourseVideos from "./components/ViewCourseVideos";
import Quiz from "./components/Quiz";
import AttemptQuiz from "./components/AttemptQuiz";
import DisplayResultDashboard from "./components/DisplayResultDashboard";
import Checkout from "./components/Checkout";
import TeacherLogin from "./components/TeacherLogin";
import TeacherSignup from "./components/TeacherSignup";
import TeacherDashboard from "./components/TeacherDashboard";
import TeacherAddCourse from "./components/TeacherAddCourse";
import TeacherAddVideo from "./components/TeacherAddVideo";
import TeacherViewCourseVideos from "./components/TeacherViewCourseVideos";
import TeacherAddQuiz from "./components/TeacherAddQuiz";
import TeacherInputQuizDetails from "./components/TeacherInputQuizDetails";
import TeacherAddQuestion from "./components/TeacherAddQuestion";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(false);
  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setIsLoggedIn={setIsLoggedIn} isTeacherLoggedIn={isTeacherLoggedIn} setIsTeacherLoggedIn={setIsTeacherLoggedIn}/>
      <Routes>
        <Route path="/" element={<Courses isLoggedIn={isLoggedIn} searchTerm={searchTerm}/>}></Route>
        <Route path="/Dashboard" element={<Dashboard isLoggedIn={isLoggedIn} />}></Route>
        <Route path="/login" element={<Login isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<Signup isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/viewCourse/:id" element={<ViewCourse isLoggedIn={isLoggedIn} />}></Route>
        <Route path="/viewInstructor/:id" element={<ViewInstructor isLoggedIn={isLoggedIn} />}></Route>
        <Route path="/viewCourseVideos/:id" element={<ViewCourseVideos isLoggedIn={isLoggedIn} />}></Route>
        <Route path="/Quiz/:id" element={<Quiz isLoggedIn={isLoggedIn} />}></Route>
        <Route path="/attemptQuiz/:id" element={<AttemptQuiz isLoggedIn={isLoggedIn} />}></Route>
        <Route path="/displayResult/:id" element={<DisplayResultDashboard isLoggedIn={isLoggedIn} />}></Route>
        <Route path="/checkout/:id" element={<Checkout isLoggedIn={isLoggedIn} />}></Route>

        <Route path="/teacherLogin" element={<TeacherLogin isTeacherLoggedIn={isTeacherLoggedIn} setIsTeacherLoggedIn={setIsTeacherLoggedIn} />} />
        <Route path="/teacherSignup" element={<TeacherSignup isTeacherLoggedIn={isTeacherLoggedIn} setIsTeacherLoggedIn={setIsTeacherLoggedIn} />} />
        <Route path="/teacherDashboard" element={<TeacherDashboard isTeacherLoggedIn={isTeacherLoggedIn} />}></Route>
        <Route path="/addCourse" element={<TeacherAddCourse isTeacherLoggedIn={isTeacherLoggedIn}/>} />
        <Route path="/addVideo/:id" element={<TeacherAddVideo isTeacherLoggedIn={isTeacherLoggedIn}/>} />
        <Route path="/teacherViewCourseVideos/:id" element={<TeacherViewCourseVideos isTeacherLoggedIn={isTeacherLoggedIn}/>} />
        <Route path="/addQuiz/:id" element={<TeacherAddQuiz isTeacherLoggedIn={isTeacherLoggedIn}/>} />
        <Route path="/inputQuizDetails/:id" element={<TeacherInputQuizDetails isTeacherLoggedIn={isTeacherLoggedIn}/>} />
        <Route path="/addQuiz/:course_id/addQuestion/:quiz_id" element={<TeacherAddQuestion isTeacherLoggedIn={isTeacherLoggedIn} />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
