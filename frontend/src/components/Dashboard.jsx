import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ isLoggedIn }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [courses, setCourses] = useState([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = window.localStorage.getItem('token');

        // Fetch user data
        const userData = await axios.post("http://localhost:3000/dashboard", { token, isLoggedIn });
        setName(userData.data.name);
        setEmail(userData.data.email);

        // Fetch enrolled courses
        const enrolledCourses = await axios.post("http://localhost:3000/getEnrolledCourses", { token, isLoggedIn });
        setCourses(enrolledCourses.data);

        // Fetch attempted quizzes
        const attemptedQuizzes = await axios.post("http://localhost:3000/getAttemptedQuizzes", { token, isLoggedIn });
        setAttemptedQuizzes(attemptedQuizzes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const handleViewCourse = (id) => {
    navigate(`/viewCourse/${id}`);
  };

  const handleViewQuiz = (quizId) => {
    navigate(`/displayResult/${quizId}`);
  };

  if (!isLoggedIn) {
    return (
      <>
        <h1 className='mt-5' style={{ textAlign: "center" }}>Oops! Login to proceed</h1>
        <img src='/../public/Login_to_proceed.png' style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto', width: "600px" }} />
      </>
    );
  }

  return (
    <div className="row">
      <div className="mb-4 text-center" style={{ color: "#fff" }}>
        <h2 style={{ fontWeight: "bold" }}>Welcome, {name}!</h2>
        <p>{email}</p>
      </div>
      {courses.length>0 && <>
      <div className="container">
  {courses.length > 0 && (
    <>
      <h2 className="text-center" style={{ color: "#fff" }}>Enrolled Courses</h2>
      <div className="container">
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {courses.map(course => (
            <div className="col mb-4" key={course.id}>
              <div className="card card-hover" style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
                <img
                  src={course.img}
                  className="card-img-top"
                  alt={course.title}
                  style={{ objectFit: "cover", height: "200px", width: "100%" }}
                />
                <div className="card-body">
                  <h5 className="card-title fw-bold">{course.title}</h5>
                  <div>
                    {course.tag.split(",").map((tag, index) => (
                      <span key={index} className="badge bg-success me-1 mb-1">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                  <p className="card-text" style={{ fontSize: "14px" }}>
                    {course.descr.length > 200
                      ? course.descr.substring(0, 200) + "..."
                      : course.descr}
                  </p>
                  <button className="btn btn-primary" onClick={() => handleViewCourse(course.id)}>View Course</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )}
</div></>}
      
      {attemptedQuizzes.length>0 && <><h2 className="text-center" style={{ color: "#fff" }}>Attempted Quizzes</h2>
      <div className="row">
        {attemptedQuizzes.map(quiz => (
          <div className="col-md-12 ms-2 mb-4" key={quiz.quiz_id}>
            <div className="card card-hover" style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title fw-bold">{quiz.title}</h5>
                  <p className="card-text" style={{ fontSize: "14px" }}>{quiz.description}</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleViewQuiz(quiz.quiz_id)}>View Performance</button>
              </div>
            </div>
          </div>
        ))}
      </div></>}
      
    </div>
  );
};

export default Dashboard;
