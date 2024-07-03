import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import StarRatings from "react-star-ratings";

const ViewCourse = ({ isLoggedIn }) => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [userRating, setUserRating] = useState();
  const [courseRating, setCourseRating] = useState(0);
  const navigate = useNavigate();

  const openQuiz = () => {
    navigate(`/Quiz/${id}`);
  }

  const submitRating = () => {
    if (userRating<0 || userRating>5 || isNaN(userRating)) {
      toast.error("Rating should be between 0 and 5");
      setUserRating("");
    }
    else {
      const token = window.localStorage.getItem('token');
      axios
      .post("http://localhost:3000/setRating", { isLoggedIn, id, token, userRating })
      .then((res) => {
        if(res.data=="success"){
          axios.post("http://localhost:3000/updateRating", {isLoggedIn, id})
          .then((res) => {
            setCourseRating(parseFloat(res.data));
            axios.post("http://localhost:3000/setTeacherRating", {id})
          .then((res) => {
            console.log(res);
          })
          .catch((err) => {
            console.log(err);
          })
          })
          .catch((err) => {
            console.log(err);
          })
        }
      })
      .catch((err) => console.log(err));
      setUserRating("");
    }
  };

  const enroll = () => {
    navigate(`/checkout/${id}`);
  };

  const checkEnrollmentStatus = () => {
    const token = window.localStorage.getItem("token");
    axios
      .post("http://localhost:3000/alreadyEnrolled", { token, id, isLoggedIn })
      .then((res) => {
        if (res.data === "Already Enrolled") {
          setEnrolled(true);
        } else {
          setEnrolled(false);
        }
      })
      .catch((err) => console.log(err));
  };

  const viewCourseVideos = () => {
    navigate(`/viewCourseVideos/${id}`);
  };

  const viewInstructor = () => {
    navigate(`/ViewInstructor/${course.teacher_id}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCourse = await axios.post("http://localhost:3000/viewCourse", {
          id,
          isLoggedIn,
        });
        setCourse(resCourse.data[0]);
        setCourseRating(resCourse.data[0].rating);
        // After fetching the course data, check the enrollment status
        checkEnrollmentStatus();
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [id]);

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
    <div className="container mt-5">
      {course && (
        <>
          <div className="row">
            <h2>{course.title}</h2>
          </div>
          <div className="row">
            <div className="col-md-8">
              <img src={course.img} className="img-fluid" alt={course.title} />
            </div>
            <div className="col-md-4" style={{ alignContent: "center" }}>
              <div className="row m-1">
              <StarRatings
                  rating={courseRating}
                  starRatedColor="orange"
                  numberOfStars={5}
                  starDimension="30px"
                  starSpacing="5px"
                  name="course-rating"
                />
                {enrolled ? <><input
                  type="number"
                  id="ratingInput"
                  name="ratingInput"
                  value={userRating}
                  min="0"
                  max="5"
                  style={{
                    color: "white",
                    border: "none",
                    borderBottom: "1px solid white",
                    backgroundColor: "transparent",
                    margin: "5px"
                  }}
                  placeholder="Rate this course"
                  onChange={(e) => setUserRating(e.target.value)}
                />
                <button
                style={{width: "150px"}}
                  className="btn btn-primary btn-sm m-1"
                  onClick={submitRating}
                >
                  Submit Rating
                </button></>: <></>}
                
              </div>

              <div>
                {course.tag.split(",").map((tag, index) => (
                  <span key={index} className="badge bg-success m-2">
                    {tag.trim()}
                  </span>
                ))}
                {!enrolled && <h4 className="m-2">Price</h4>}
                {!enrolled && <p className="m-2">₹{course.price}</p>}
              </div>
              <div>
                {!enrolled ? (
                  <button className="btn btn-primary m-2" onClick={enroll}>
                    Enroll in Course
                  </button>
                ) : (
                  <button
                    className="btn btn-primary m-2"
                    onClick={viewCourseVideos}
                  >
                    Start Learning
                  </button>
                )}

                <button
                  className="btn btn-outline-primary m-2"
                  onClick={viewInstructor}
                >
                  View Instructor
                </button>
              </div>
              {enrolled ? <button
                    className="btn btn-primary m-2"
                    onClick={openQuiz}
                  >
                    Quiz
                  </button>: <></>}
            </div>
          </div>
          <div className="row mt-2">
            <p>{course.descr}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewCourse;
