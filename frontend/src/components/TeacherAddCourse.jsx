import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import axios from 'axios';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import app from "../firebase";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TeacherAddCourse = ({isTeacherLoggedIn}) => {
  const [courseData, setCourseData] = useState({
    title: '',
    descr: '',
    tag: '',
    price: ''
  });
  const [image, setImage] = useState(null);
  const navigate = useNavigate();
  const [URL, setURL] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();

    // Check if any fields are empty
    if (!courseData.title || !courseData.descr || !courseData.tag || !courseData.price || !image) {
      toast.error('All fields are required!');
      return;
    }

    try {
      // Upload image to Firebase storage
      const storage = getStorage(app);
      const storageRef = ref(storage, "images/" + image.name);
      await uploadBytes(storageRef, image);
      const url = await getDownloadURL(storageRef);
      setURL(url);

      let token = window.localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/addCourse', {
        title: courseData.title,
        descr: courseData.descr,
        tag: courseData.tag,
        price: courseData.price,
        url: url,
        token: token,
        isTeacherLoggedIn: isTeacherLoggedIn
      });

      if (response.data.success) {
        toast.success("Course Added");
        navigate('/teacherDashboard');
      } else {
        console.error('Error adding course:', response.data.message);
      }
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  return (
    <Container className="mt-4">
      <ToastContainer />
      <h1 className="mb-4 text-center">Add New Course</h1>
      <Form onSubmit={handleAddCourse}>
        <FormGroup>
          <Label for="title">Course Title</Label>
          <Input
            type="text"
            name="title"
            id="title"
            placeholder="Enter course title"
            value={courseData.title}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="descr">Course Description</Label>
          <Input
            type="textarea"
            name="descr"
            id="descr"
            placeholder="Enter course description"
            value={courseData.descr}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="tag">Tags</Label>
          <Input
            type="text"
            name="tag"
            id="tag"
            placeholder="Enter course tag"
            value={courseData.tag}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="price">Price</Label>
          <Input
            type="number"
            step="0.01"
            name="price"
            id="price"
            placeholder="Enter course price"
            value={courseData.price}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="image">Course Thumbnail</Label>
          <Input
            type="file"
            name="image"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </FormGroup>
        <Button color="primary" type="submit">Add Course</Button>
      </Form>
    </Container>
  );
};

export default TeacherAddCourse;
