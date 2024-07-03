import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, CardBody, CardTitle, CardText, Button, ListGroup, ListGroupItem } from 'reactstrap';

const TeacherAddQuiz = ({ isTeacherLoggedIn }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [quizId, setQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.post("http://localhost:3000/getQuizByCourseId", { isTeacherLoggedIn, id });
        if (response.data && response.data.length > 0) {
          const quizData = response.data[0];
          setQuiz(quizData);

          const quiz_id = quizData.quiz_id;
          setQuizId(quiz_id);
          const questionsResponse = await axios.post("http://localhost:3000/getQuestionsByQuizId", { quiz_id, isTeacherLoggedIn });
          setQuestions(questionsResponse.data);
        } else {
          setQuiz(null);
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleAddQuiz = () => {
    navigate(`/inputQuizDetails/${id}`);
  };

  const handleAddQuestion = () => {
    navigate(`/addQuiz/${id}/addQuestion/${quizId}`);
  };

  return (
    <Container className="mt-4">
      {quiz ? (
        <>
          <Card className="shadow-sm p-3 mb-5 bg-dark rounded">
            <CardBody className='text-white text-center'>
              <CardTitle tag="h2">{quiz.title}</CardTitle>
              <CardText><strong>Description:</strong> {quiz.description}</CardText>
              <CardText><strong>Max Marks:</strong> {quiz.max_marks}</CardText>
            </CardBody>
          </Card>
          <div className="text-center mb-3">
            <Button color="primary" onClick={handleAddQuestion}>Add Question</Button>
          </div>
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <Card className="shadow-sm p-3 mb-3 bg-dark rounded" key={index}>
                <CardBody>
                  <CardTitle tag="h4" className="text-white">Question {index + 1}</CardTitle>
                  <CardText className="text-white">{question.question}</CardText>
                  <ListGroup>
                    <ListGroupItem className={question.correct_option === 1 ? 'bg-primary text-white' : 'bg-dark text-white border-secondary'}>{question.option1}</ListGroupItem>
                    <ListGroupItem className={question.correct_option === 2 ? 'bg-primary text-white' : 'bg-dark text-white border-secondary'}>{question.option2}</ListGroupItem>
                    <ListGroupItem className={question.correct_option === 3 ? 'bg-primary text-white' : 'bg-dark text-white border-secondary'}>{question.option3}</ListGroupItem>
                    <ListGroupItem className={question.correct_option === 4 ? 'bg-primary text-white' : 'bg-dark text-white border-secondary'}>{question.option4}</ListGroupItem>
                  </ListGroup>
                </CardBody>
              </Card>
            ))
          ) : (
            <CardText className="text-center text-white">No questions available</CardText>
          )}
        </>
      ) : (
        <div className="text-center">
          <h1 className="text-white">No quiz available for this course</h1>
          <Button color="primary" onClick={handleAddQuiz}>Add Quiz</Button>
        </div>
      )}
    </Container>
  );
};

export default TeacherAddQuiz;
