import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StarRatings from "react-star-ratings";
import { toast } from "react-toastify";

const Checkout = ({ isLoggedIn }) => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCourse = await axios.post("http://localhost:3000/viewCourse", {
          id,
          isLoggedIn,
        });
        setCourse(resCourse.data[0]);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [id, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="container mt-5 text-center">
        <h1 className="mb-4">Oops! Login to proceed</h1>
        <img
          src="../../public/Login_to_proceed.png"
          className="img-fluid"
          alt="Login to proceed"
        />
      </div>
    );
  }

  const handlePurchase = async () => {
    try {
      const response = await axios.post("http://localhost:3000/checkout", {
        name: course.title,
        amount: course.price,
      });
      const { order } = response.data;

      const options = {
        key: 'rzp_test_k14Ju7THxM6HKy',
        amount: order.amount,
        currency: order.currency,
        name: "Skillwise",
        description: "Course Fee",
        image:
          "https://img.freepik.com/premium-vector/online-school-logo-learning-logo-design-vector_567288-21.jpg",
        order_id: order.id,
        handler: async function (response) {
          try {
            const verificationRes = await axios.post(
              "http://localhost:3000/paymentVerification",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (verificationRes.data.success) {
              const token = window.localStorage.getItem("token");
              const course_id = course.id;
              axios
                .post("http://localhost:3000/enroll", {
                  token,
                  course_id,
                  isLoggedIn,
                })
                .then((res) => {
                  if (res.data === "Enrolled Successfully") {
                    axios.post("http://localhost:3000/setTeacherEarningAndStudentEnrolled", {id})
                  .then((res) => {
                    console.log(res);
                  })
                  .catch((err) => {
                    console.log(err);
                })
                    toast.success("Enrolled Successfully");
                  }
                })
                .catch((err) => {
                  console.log(err);
                });

              navigate("/dashboard");
            } else {
              toast.error(verificationRes.data.message);
              navigate("/");
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            toast.error("Error verifying payment. Please try again.");
          }
        },
        prefill: {
          name: "",
          email: "hrajput0322@gmail.com",
          contact: "8630875700",
        },
        notes: {
          address: "Skillwise Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
        payment_capture: 1,
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error during payment:", error);
      toast.error("Error initiating payment. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        {course && (
          <>
          <h2>{course.title}</h2>
            <div className="col-lg-8">
              <img
                src={course.img}
                className="img-fluid mb-3"
                alt={course.title}
              />
            </div>
            <div className="col-lg-4" style={{ alignContent: "center" }}>
                <div className="mb-3">
                <div className="m-1">
                <StarRatings
                  rating={course.rating}
                  starRatedColor="orange"
                  numberOfStars={5}
                  starDimension="30px"
                  starSpacing="5px"
                  name="course-rating"
                />
                </div>
                  <p>
                    {course.tag.split(",").map((tag) => (
                      <span key={tag} className="badge bg-success m-2">
                        {tag.trim()}
                      </span>
                    ))}
                  </p>
                </div>
                <div>
                  <h4 className="m-2">Price</h4>
                  <p className="m-2">₹{course.price}</p>
                  <button className="btn btn-primary m-2" onClick={handlePurchase}>
                    Purchase Course
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <p>{course.descr}</p>
              </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;
