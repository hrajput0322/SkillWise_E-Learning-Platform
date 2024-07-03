// CourseCard.jsx

import React from "react";
import StarRatings from "react-star-ratings";

const CourseCard = ({ course, onViewCourse }) => {
  return (
    <div className="col-md-4 mb-4">
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
          <button id={course.id} className="btn btn-primary" onClick={() => onViewCourse(course.id)}>View Course</button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
