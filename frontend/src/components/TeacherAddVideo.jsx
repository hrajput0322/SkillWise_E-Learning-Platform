import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import app from '../firebase';

const TeacherAddVideo = ({ isTeacherLoggedIn }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [video, setVideo] = useState('');
  const [videoURL, setVideoURL] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [uploading, setUploading] = useState(false); // State for showing uploading message

  const handleAddVideo = async (e) => {
    e.preventDefault();

    // Check if any fields are empty
    if (!video || !videoDescription || !videoTitle) {
      toast.error('All fields are required!');
      return;
    }

    try {
      setUploading(true); // Start showing uploading message

      // Upload video to Firebase storage
      const storage = getStorage(app);
      const storageRef = ref(storage, 'videos/' + video.name);
      await uploadBytes(storageRef, video);
      const url = await getDownloadURL(storageRef);
      setVideoURL(url);

      let token = window.localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/addVideo', {
        course_id: id,
        title: videoTitle,
        descr: videoDescription,
        url: url,
        token: token,
        isTeacherLoggedIn: isTeacherLoggedIn,
      });

      if (response.data.success) {
        toast.success('Video Uploaded');
        navigate('/teacherDashboard');
      } else {
        console.error('Error adding video:', response.data.message);
      }
    } catch (error) {
      console.error('Error adding video:', error);
    } finally {
      setUploading(false); // Stop showing uploading message
    }
  };

  return (
    <Container className="mt-4">
      <h1 style={{ textAlign: 'center' }}>Add a Video to the Course</h1>
      <Form onSubmit={handleAddVideo}>
        <FormGroup>
          <Label for="video">Video File</Label>
          <Input type="file" name="video" id="video" onChange={(e) => setVideo(e.target.files[0])} required />
        </FormGroup>
        <FormGroup>
          <Label for="videoTitle">Video Title</Label>
          <Input
            type="text"
            name="videoTitle"
            id="videoTitle"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="Enter video title"
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="videoDescription">Video Description</Label>
          <Input
            type="textarea"
            name="videoDescription"
            id="videoDescription"
            value={videoDescription}
            onChange={(e) => setVideoDescription(e.target.value)}
            placeholder="Enter video description"
            required
          />
        </FormGroup>
        {uploading && <p>Uploading your video. Please wait...</p>}
        <Button color="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Container>
  );
};

export default TeacherAddVideo;
