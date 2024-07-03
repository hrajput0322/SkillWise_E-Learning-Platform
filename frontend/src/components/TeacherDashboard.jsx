import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRatings from 'react-star-ratings';
import { Card, CardBody, CardTitle, CardText, Button, Col, Row, Container } from 'reactstrap';

const TeacherDashboard = ({ isTeacherLoggedIn }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [rating, setRating] = useState(0);
  const [earning, setEarning] = useState(0);
  const [studentsEnrolled, setStudentsEnrolled] = useState(0);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = window.localStorage.getItem('token');
        if (!token) {
          console.error('Token not found');
          return;
        }

        const response = await axios.post('http://localhost:3000/teacherDashboard', { token, isTeacherLoggedIn });
        const userData = response.data;
        setName(userData.name);
        setEmail(userData.email);
        setBio(userData.bio);
        setRating(userData.rating);
        setEarning(userData.earning);
        setStudentsEnrolled(userData.students_enrolled);

        const courseResponse = await axios.post('http://localhost:3000/getTeacherCourses', { token, isTeacherLoggedIn });

        if (courseResponse.data) {
          setCourses(courseResponse.data);
        } else {
          console.error('No courses found in response');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (isTeacherLoggedIn) {
      fetchData();
    }
  }, [isTeacherLoggedIn]);

  const handleAddCourse = () => {
    navigate('/addCourse');
  };

  const onAddVideo = (courseId) => {
    navigate(`/addVideo/${courseId}`);
  };

  const onAddQuiz = (courseId) => {
    navigate(`/addQuiz/${courseId}`);
  };

  const viewCourse = (courseId) => {
    navigate(`/teacherViewCourseVideos/${courseId}`);
  }

  return (
    <Container className="mt-4">
      <Card className="shadow-sm p-3 mb-5 bg-dark rounded text-white">
        <CardBody>
          <div className="text-center mb-4">
            <CardTitle tag="h1" className="mb-0">{name}</CardTitle>
            <StarRatings
              rating={rating}
              starRatedColor="orange"
              numberOfStars={5}
              starDimension="30px"
              starSpacing="5px"
              name="course-rating"
              className="mt-2"
            />
          </div>
          <Row className="text-center mb-4">
            <Col md={5} className="border p-3 rounded mb-3 mb-md-0">
              <CardText><strong>Email:</strong> {email}</CardText>
            </Col>
            <Col md={2}></Col>
            <Col md={5} className="border p-3 rounded">
              <CardText><strong>Earnings:</strong> ₹{earning}</CardText>
            </Col>
          </Row>
          <Row className="text-center mb-4">
            <Col md={5} className="border p-3 rounded mb-3 mb-md-0">
              <CardText><strong>Bio:</strong> {bio}</CardText>
            </Col>
            <Col md={2}></Col>
            <Col md={5} className="border p-3 rounded">
              <CardText><strong>Students Enrolled:</strong> {studentsEnrolled}</CardText>
            </Col>
          </Row>
        </CardBody>
      </Card>
      <div className="d-flex justify-content-center mb-4">
        <Button color="primary" onClick={handleAddCourse} className="w-50">Add Course</Button>
      </div>
      <h2 style={{textAlign: "center"}}>Your Courses</h2>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {courses.length > 0 ? (
          courses.map((course, index) => (
            <div key={index} className="col mb-4">
              <div className="card card-hover" style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
                <img
                  src={course.img}
                  className="card-img-top"
                  alt={course.title}
                  style={{ objectFit: "cover", height: "200px", width: "100%" }}
                />
                <div className="card-body">
                  <h5 className="card-title fw-bold">{course.title}</h5>
                  <StarRatings
                    rating={course.rating}
                    starRatedColor="orange"
                    numberOfStars={5}
                    starDimension="30px"
                    starSpacing="5px"
                    name="course-rating"
                  />
                  <div className="mt-1">
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
                  <button id={course.id} className="btn btn-primary me-2" onClick={() => onAddVideo(course.id)}>Add Lecture</button>
                  <button id={course.id} className="btn btn-primary me-2" onClick={() => onAddQuiz(course.id)}>Add Quiz</button>
                  <button id={course.id} className="btn btn-primary" onClick={() => viewCourse(course.id)}>View Course</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <CardText className="text-center w-100">No courses available</CardText>
        )}
      </div>
    </Container>
  );
};

export default TeacherDashboard;
