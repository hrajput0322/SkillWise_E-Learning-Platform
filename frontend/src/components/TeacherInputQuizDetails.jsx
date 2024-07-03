import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { toast } from 'react-toastify';

const TeacherInputQuizDetails = ({ isTeacherLoggedIn }) => {
    const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAddQuiz = async () => {
    if (!title || !description) {
      toast.error('Please fill out all fields.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/addQuiz', {
        course_id: id,
        title,
        description,
        isTeacherLoggedIn
      });
      if (response.data.success) {
        toast.success('Quiz added successfully!');
        navigate(`/addQuiz/${id}`);
      } else {
        toast.error('Failed to add quiz.');
      }
    } catch (error) {
      console.error('Error adding quiz:', error);
      alert('An error occurred while adding the quiz.');
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Add Quiz Details</h2>
      <Form>
        <FormGroup>
          <Label for="title">Title</Label>
          <Input
            type="text"
            id="title"
            placeholder="Enter quiz title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label for="description">Description</Label>
          <Input
            type="textarea"
            id="description"
            placeholder="Enter quiz description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormGroup>
        <div className="text-center">
          <Button color="primary" onClick={handleAddQuiz}>Add Quiz</Button>
        </div>
      </Form>
    </Container>
  );
};

export default TeacherInputQuizDetails;
