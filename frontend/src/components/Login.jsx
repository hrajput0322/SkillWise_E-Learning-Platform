import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';

const Login = ( {isLoggedIn, setIsLoggedIn} ) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    axios
      .post("http://localhost:3000/login", { email, password })
      .then((res) => {
        if (res.data !== "Wrong Credentials") {
          setIsLoggedIn(true);
          toast.success("LogIn Successful");
          window.localStorage.setItem("token", res.data);
          navigate("/");
        } else {
          toast.error("Wrong Credentials");
        }
      })
      .catch((err) => console.log(err));
  }

  function handleTeacherSubmit(e) {
    e.preventDefault();
    navigate("/teacherLogin");
  }

  return (
    <div className="container mt-5 p-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="p-4 border rounded bg-dark text-white">
            <form>
              <div className="form-group p-2">
                <label htmlFor="email">Email address:</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group p-2">
                <label htmlFor="pwd">Password:</label>
                <input
                  type="password"
                  className="form-control"
                  id="pwd"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="checkbox p-2">
                <label>
                  <input type="checkbox" /> Remember me
                </label>
              </div>
              <button
                type="button"
                className="btn btn-primary m-2"
                onClick={handleSubmit}
              >
                Login
              </button>
              <button
                type="button"
                className="btn btn-outline-primary m-2"
                onClick={handleTeacherSubmit}
              >
                Login as Instructor
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
