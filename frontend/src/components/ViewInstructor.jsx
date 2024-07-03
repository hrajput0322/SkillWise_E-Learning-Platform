import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StarRatings from 'react-star-ratings';
import { Card, CardBody, CardTitle, CardText, Row, Col, Container } from 'reactstrap';

const ViewInstructor = ({ isLoggedIn }) => {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post('http://localhost:3000/viewInstructor', { id, isLoggedIn });
        setData(res.data[0]);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  if (!isLoggedIn) {
    return (
      <>
        <h1 className='mt-5' style={{ textAlign: 'center' }}>Oops! Login to proceed</h1>
        <img src='../../public/Login_to_proceed.png' style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto', width: '600px' }} />
      </>
    );
  }

  return (
    <Container className="mt-4">
      {data ? (
        <Card className="shadow-sm p-3 mb-5 bg-dark rounded text-white">
          <CardBody>
            <div className="text-center mb-4">
              <CardTitle tag="h1" className="mb-0">{data.name}</CardTitle>
              <StarRatings
                rating={data.rating}
                starRatedColor="orange"
                numberOfStars={5}
                starDimension="30px"
                starSpacing="5px"
                name="instructor-rating"
                className="mt-2"
              />
            </div>
            <Row className="text-center mb-4">
              <Col md={5} className="border p-3 rounded mb-3 mb-md-0">
                <CardText><strong>Email:</strong> {data.email}</CardText>
              </Col>
              <Col md={2}></Col>
              <Col md={5} className="border p-3 rounded">
                <CardText><strong>Students Enrolled:</strong> {data.students_enrolled}</CardText>
              </Col>
            </Row>
            <Row className="text-center mb-4">
              <Col md={12} className="border p-3 rounded">
                <CardText><strong>Bio:</strong> {data.bio}</CardText>
              </Col>
            </Row>
          </CardBody>
        </Card>
      ) : (
        <CardText className="text-center">Loading...</CardText>
      )}
    </Container>
  );
};

export default ViewInstructor;
