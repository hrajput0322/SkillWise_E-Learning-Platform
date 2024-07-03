import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CourseCard from "./CourseCard"; // Import the CourseCard component

const Courses = ({ isLoggedIn, searchTerm }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Adjust the number of items per page as needed

  const viewCourse = (courseId) => {
    if (isLoggedIn) navigate(`/viewCourse/${courseId}`);
    else navigate("/login");
  };

  useEffect(() => {
    const fetchCourses = () => {
      const offset = (currentPage - 1) * itemsPerPage;
      axios
        .post("http://localhost:3000/courses", { searchTerm, limit: itemsPerPage, offset })
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    fetchCourses();
  }, [searchTerm, currentPage, itemsPerPage]);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => (prevPage > 1 ? prevPage - 1 : 1));
  };

  return (
    <div className="container">
      <h1 style={{ textAlign: "center" }}>Courses</h1>
      <div className="row">
        {data.map((course) => (
          <CourseCard key={course.id} course={course} onViewCourse={viewCourse} />
        ))}
      </div>
      <div className="d-flex justify-content-center my-4">
        <button className="btn btn-primary mx-2" onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span className="align-self-center">Page {currentPage}</span>
        <button className="btn btn-primary mx-2" onClick={handleNextPage} disabled={data.length < itemsPerPage}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Courses;
