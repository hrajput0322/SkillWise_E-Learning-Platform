import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import DisplayResult from "./DisplayResult";
import { toast } from "react-toastify";

const AttemptQuiz = ({ isLoggedIn }) => {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.post("http://localhost:3000/attemptQuiz", {
          id,
          isLoggedIn,
        });
        setQuestions(response.data);
        setNumberOfQuestions(response.data.length);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, [id]);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    toast.success("answer saved");
    if (selectedOption === null) {
      setUserAnswers([...userAnswers, "0"]);
    } else {
      setUserAnswers([...userAnswers, selectedOption]);
    }
    setSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex === numberOfQuestions - 1) {
      setQuizCompleted(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setSubmitted(false);
    }
  };

  const exitQuiz = () => {
    navigate("/");
  }

  if (!isLoggedIn) {
    return (
      <>
        <h1 className="mt-5" style={{ textAlign: "center" }}>
          Oops! Login to proceed
        </h1>
        <img
          src="../../public/Login_to_proceed.png"
          style={{
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            width: "600px",
          }}
        />
      </>
    );
  }

  if (questions.length === 0) {
    return <div>Loading...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (quizCompleted) {
    return <DisplayResult questions={questions} userAnswers={userAnswers} quizId={id} />;
  }

  return (
    <div className="container mt-5 d-flex justify-content-center">
  <div className="text-left" style={{ minWidth: "1000px" }}>
    <div className="card bg-dark text-white" style={{ boxShadow: "-5px 5px 10px rgba(0, 0, 0, 0.5)", padding: "20px" }}>
      <h2 className="card-title text-white">Question {currentQuestionIndex + 1}</h2>
      <h3 className="text-white">{currentQuestion.question}</h3>
      <div className="card-body">
        <div className="row">
          {[1, 2, 3, 4].map((option) => (
            <div className="col-md-6 mt-3" key={option}>
              <div className={`card text-white ${selectedOption === option ? 'bg-primary' : 'bg-secondary'}`} style={{ cursor: "pointer" }} onClick={() => handleOptionChange(option)}>
                <div className="card-body">
                  <p className="card-text">{currentQuestion[`option${option}`]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="d-flex justify-content-between mt-3">
          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit
          </button>
          {submitted && currentQuestionIndex < numberOfQuestions - 1 && (
            <button className="btn btn-primary" onClick={handleNextQuestion}>
              Next Question
            </button>
          )}
          {submitted && currentQuestionIndex === numberOfQuestions - 1 && (
            <button className="btn btn-primary" onClick={() => setQuizCompleted(true)}>
              Submit Quiz
            </button>
          )}
          <button className="btn btn-primary" onClick={() => exitQuiz()}>
            Exit Quiz
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

  );
};

export default AttemptQuiz;
