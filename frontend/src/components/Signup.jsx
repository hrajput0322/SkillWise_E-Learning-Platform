import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Signup = ( {isLoggedIn, setIsLoggedIn} ) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Check if the user is logged in by checking local storage
    const token = window.localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    axios
      .post("http://localhost:3000/signup", { name, email, password })
      .then((res) => {
        if (res.data=="Email already exists") {
          toast.error("Email already exists");
        }
        else if (res.data!=="Registration Failed"){
          setIsLoggedIn(true);
          toast.success("Registered Successfully");
          window.localStorage.setItem('token', res.data);
          navigate("/");
        }
        else {
          toast.error("Registration Failed");
        }
      })
      .catch((err) => console.log(err));
  }

  return (
    <div className="container mt-5 p-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="p-4 border rounded bg-dark text-white">
            <form>
            <div className="form-group p-2">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
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
                Register
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
