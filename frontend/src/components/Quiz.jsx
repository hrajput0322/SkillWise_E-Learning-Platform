import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import { toast } from 'react-toastify';

const Quiz = ({ isLoggedIn }) => {
  const [quiz, setQuiz] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const attemptQuiz = () => {
    navigate(`/attemptQuiz/${quiz.quiz_id}`);
  }

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = window.localStorage.getItem('token');
        const response = await axios.post("http://localhost:3000/quiz", { isLoggedIn, id, token });
        if (response.data === "no quiz for this course") { 
          toast.error("No quiz found for this course");
          setQuiz(false);
        } else {
          setQuiz(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
      }
    };

    fetchQuiz();
  }, [id, isLoggedIn]);

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

  return (
    <div className="container mt-5 d-flex justify-content-center align-items-center" >
      {quiz && (
        <div className="card bg-dark text-white" style={{ boxShadow: "-5px 5px 10px rgba(0, 0, 0, 0.5)" }}>
          <div className="card-body">
            <h2 className="card-title text-center">{quiz.title}</h2>
            <p className="card-text">{quiz.description}</p>
            <p className="card-text">Max Marks: {quiz.max_marks}</p>
            <h4 className='card-text text-center'>Instructions:</h4>
            <p className='card-text'>1. You will have to submit the current answer in order to move to the next question.</p>
            <p className='card-text'>2. Once submitted you can not navigate to that question back.</p>
            <p className='card-text'>3. Each question carries 1 mark.</p>
            <p className='card-text'>4. There is no negative marking.</p>
            <p className='card-text'>5. If you attempt the quiz more than once, only your latest attempt will be saved.</p>
            <p className='card-text'>6. All the best, Happy Learning.</p>
            
            <div className="text-center">
              <button className="btn btn-primary" onClick={attemptQuiz}>
                Attempt Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
