import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Navbar = ({ isLoggedIn, setIsLoggedIn, searchTerm, setSearchTerm, isTeacherLoggedIn, setIsTeacherLoggedIn }) => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("Home");

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      setIsTeacherLoggedIn(true);
    }
  }, [setIsLoggedIn, setIsTeacherLoggedIn]);

  const handleLogout = () => {
    toast.warning("Logged out successfully");
    setIsLoggedIn(false);
    setIsTeacherLoggedIn(false);
    window.localStorage.removeItem("token");
    navigate("/Login");
  };

  const handleTabClick = (tabName) => {
    setSelectedTab(tabName);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      console.log("Search term submitted:", searchTerm);
    }
  };

  return (
    <>
      <header className="p-3 text-bg-dark">
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
            <a
              href="/"
              className="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none"
            >
              <svg
                className="bi me-2"
                width="40"
                height="32"
                role="img"
                aria-label="Bootstrap"
              ></svg>
            </a>

            <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
              {!isTeacherLoggedIn && (
                <>
                  <li>
                    <Link
                      to="/"
                      className={`nav-link px-2 ${
                        selectedTab === "Home" ? "text-white" : "text-secondary"
                      }`}
                      onClick={() => handleTabClick("Home")}
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/Dashboard"
                      className={`nav-link px-2 ${
                        selectedTab === "Dashboard"
                          ? "text-white"
                          : "text-secondary"
                      }`}
                      onClick={() => handleTabClick("Dashboard")}
                    >
                      Dashboard
                    </Link>
                  </li>
                </>
              )}
            </ul>

            <form
              className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3"
              role="search"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="search"
                className="form-control form-control-dark text-bg-dark"
                placeholder="Search..."
                aria-label="Search"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyPress}
              />
            </form>

            <div className="text-end">
              {(isLoggedIn || isTeacherLoggedIn) ? (
                <button
                  type="button"
                  className="btn btn-warning me-2"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login">
                    <button type="button" className="btn btn-outline-light me-2">
                      Login
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button type="button" className="btn btn-warning">
                      Sign-up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
