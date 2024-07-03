import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const DisplayResultDashboard = ({ isLoggedIn }) => {
    const {id} = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  let userAnswers = [];
  const navigate = useNavigate();

  function calculateScore() {
    let score = 0;
    questions.forEach((question, index) => {
      if (userAnswers[index] == question.correct_option) {
        score++;
      }
    });
    return score;
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const fetchQuestions = async () => {
        try {
          const response = await axios.post("http://localhost:3000/getQuestions", {
            id,
          });
          setQuestions(response.data);
        } catch (error) {
          console.error("Error fetching questions:", error);
        }
      };


  const fetchAnswers = async () => {
    try {
        const token = window.localStorage.getItem('token');
      const response = await axios.post("http://localhost:3000/getAnswers", {
        id, token
      });
      setAnswers(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchAnswers();
  }, [id]);

  const exitQuiz = () => {
    navigate("/");
  }

  if (answers.length === 0 || questions.length===0) {
    return <div>Loading...</div>;
  }
  
  answers.forEach(element => {
    userAnswers = [...userAnswers, element.selected_answer];
  })

  const score = calculateScore();
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="text-left" style={{ minWidth: "1000px" }}>
        <h2 className="card-title text-white">Quiz Result</h2>
        <h3 className="card-subtitle mb-3 text-white">Score: {score}</h3>
        <div
          className="card bg-dark text-white"
          style={{ boxShadow: "-5px 5px 10px rgba(0, 0, 0, 0.5)" }}
        >
          <div className="card-body">
            <div className="mt-3">
              <h4 className="text-white">Question {currentQuestionIndex + 1}</h4>
              <p className="text-white">{currentQuestion.question}</p>
              <ul style={{ padding: 0 }}>
                {[1, 2, 3, 4].map((option) => (
                  <li
                    key={option}
                    style={{
                      background:
                        userAnswers[currentQuestionIndex] == option
                          ? userAnswers[currentQuestionIndex] ==
                            currentQuestion.correct_option
                            ? "#0d6efd"
                            : "#dc3545"
                          : "#343a40",
                      borderRadius: "5px",
                      margin: "5px",
                      padding: "10px",
                    }}
                    onClick={() => handleOptionChange(option)}
                  >
                    Option {option}: {currentQuestion[`option${option}`]}
                  </li>
                ))}
              </ul>
              <p className="text-white">
                Your Answer:{" "}
                <span
                  style={{
                    color:
                      userAnswers[currentQuestionIndex] == 0
                        ? "#dc3545"
                        : userAnswers[currentQuestionIndex] ==
                          currentQuestion.correct_option
                        ? "#0d6efd"
                        : "#dc3545",
                  }}
                >
                  {userAnswers[currentQuestionIndex] == 0
                    ? "No answer selected"
                    : userAnswers[currentQuestionIndex]}
                </span>
              </p>
              <p className="text-white">
                Correct Answer:{" "}
                <span style={{ color: "#0d6efd" }}>
                  Option {currentQuestion.correct_option}:{" "}
                  {currentQuestion[`option${currentQuestion.correct_option}`]}
                </span>
              </p>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <button
                className="btn btn-primary me-2"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous Question
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next Question
              </button>
              <button className="btn btn-primary" onClick={() => exitQuiz()}>
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayResultDashboard;
