import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const TeacherAddQuestion = ({ isTeacherLoggedIn }) => {
  const navigate = useNavigate();
  const { course_id, quiz_id } = useParams();
  const [question, setQuestion] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctOption, setCorrectOption] = useState(1);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    // Validate all fields are filled
    if (!question || !option1 || !option2 || !option3 || !option4) {
      toast.error('Please fill in all fields');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:3000/addQuestion', {
        isTeacherLoggedIn,
        quiz_id,
        question,
        option1,
        option2,
        option3,
        option4,
        correct_option: correctOption
      });
  
      if (response.data.success) {
        toast.success('Question added successfully');
        navigate(`/addQuiz/${course_id}`);
      } else {
        toast.error('Failed to add question');
      }
    } catch (error) {
      toast.error('Error adding question');
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className='text-center'>Add Question</h2>
      <form onSubmit={handleFormSubmit}>
        <div className="mb-3">
          <label htmlFor="question" className="form-label">Question</label>
          <textarea
            className="form-control"
            id="question"
            rows="1"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="option1" className="form-label">Option 1</label>
          <input
            type="text"
            className="form-control"
            id="option1"
            value={option1}
            onChange={(e) => setOption1(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="option2" className="form-label">Option 2</label>
          <input
            type="text"
            className="form-control"
            id="option2"
            value={option2}
            onChange={(e) => setOption2(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="option3" className="form-label">Option 3</label>
          <input
            type="text"
            className="form-control"
            id="option3"
            value={option3}
            onChange={(e) => setOption3(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="option4" className="form-label">Option 4</label>
          <input
            type="text"
            className="form-control"
            id="option4"
            value={option4}
            onChange={(e) => setOption4(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="correctOption" className="form-label">Correct Option</label>
          <select
            className="form-select"
            id="correctOption"
            value={correctOption}
            onChange={(e) => setCorrectOption(parseInt(e.target.value))}
            required
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default TeacherAddQuestion;
