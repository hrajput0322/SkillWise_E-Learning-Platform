import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactPlayer from "react-player";

const ViewCourseVideos = ({ isLoggedIn }) => {
  const { id } = useParams();
  const [enrolled, setEnrolled] = useState(false);
  const [videoData, setVideoData] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [courseTitle, setCourseTitle] = useState();
  const [pageUrl, setPageUrl] = useState("");
  const [pageIdentifier, setPageIdentifier] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href);
    setPageIdentifier(id);
    const token = window.localStorage.getItem("token");

    // Check if user is enrolled
    axios
      .post("http://localhost:3000/alreadyEnrolled", { token, id, isLoggedIn })
      .then((res) => {
        setEnrolled(res.data === "Already Enrolled");
      })
      .catch((err) => console.log(err));

    axios
      .post("http://localhost:3000/getCourseTitle", { id, isLoggedIn })
      .then((res) => {
        setCourseTitle(res.data[0].title);
      })
      .catch((err) => console.log(err));

    // Fetch videos
    axios
      .post("http://localhost:3000/getVideos", { token, id, isLoggedIn })
      .then((res) => {
        setVideoData(res.data);
        // Set the first video as the current video by default
        if (res.data.length > 0) {
          setCurrentVideo(res.data[0]);
        }
      })
      .catch((err) => console.log(err));
  }, [id, isLoggedIn]);

  if (!isLoggedIn || !enrolled) {
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

  const handleVideoSelect = (video) => {
    setCurrentVideo(video);
  };

  const handleDescriptionClick = () => {
    setExpandedDescription(!expandedDescription);
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <h2>{courseTitle}</h2>
      </div>
      <div className="row">
        <div className="col-lg-8">
          {currentVideo && (
            <div
              style={{
                position: "relative",
                paddingTop: "56.25%",
                marginBottom: "20px",
              }}
            >
              <ReactPlayer
                url={currentVideo.video_link}
                controls={true}
                width="100%"
                height="100%"
                style={{ position: "absolute", top: "0", left: "0" }}
              />
            </div>
          )}
          {currentVideo && (
            <div
              style={{
                marginBottom: "20px",
                padding: "10px",
                backgroundColor: "#343a40",
                color: "#ffffff",
              }}
            >
              <h2>{currentVideo.video_title}</h2>
              <div
                style={{
                  backgroundColor: "#454d55",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                <h4>Description</h4>
                <p>
                  {expandedDescription
                    ? currentVideo.video_description
                    : `${currentVideo.video_description.substring(0, 100)}...`}
                  <button
                    className="btn btn-link text-decoration-none"
                    onClick={handleDescriptionClick}
                    style={{
                      color: "#ffffff",
                      fontWeight: "bold",
                      transition: "color 0.3s",
                      cursor: "pointer",
                    }}
                  >
                    {expandedDescription ? "Show less" : "Show more"}
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Disqus Comment Section */}
          <div id="disqus_thread"></div>
          <script>
            {/* Set Disqus Configuration Variables */}
            {`
              var disqus_config = function () {
                this.page.url = '${pageUrl}';
                this.page.identifier = '${pageIdentifier}';
              };
            `}
            {(function () {
              var d = document,
                s = d.createElement("script");
              s.src = "https://skillwise.disqus.com/embed.js";
              s.setAttribute("data-timestamp", +new Date());
              (d.head || d.body).appendChild(s);
            })()}
          </script>
          <noscript>
            Please enable JavaScript to view the{" "}
            <a href="https://disqus.com/?ref_noscript">
              comments powered by Disqus.
            </a>
          </noscript>
        </div>

        <div className="col-lg-4">
          <h3>Video Queue</h3>
          <div
            className="list-group"
            style={{
              backgroundColor: "#f8f9fa",
              maxHeight: "700px",
              overflowY: "auto",
              border: "1px solid #dee2e6",
              borderRadius: "5px",
              padding: "10px",
            }}
          >
            {videoData.map((video, index) => (
              <button
                key={index}
                type="button"
                className={`list-group-item list-group-item-action ${
                  currentVideo === video ? "active" : ""
                }`}
                onClick={() => handleVideoSelect(video)}
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  marginBottom: "5px",
                }}
              >
                <span style={{ marginRight: "10px" }}>{index + 1}.</span>
                {video.video_title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCourseVideos;
