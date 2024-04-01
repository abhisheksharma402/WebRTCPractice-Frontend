import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  // State variables for username and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('patient');

  const navigate = useNavigate();

  // Function to handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    // Here you can add your logic to handle login authentication
    console.log('Username:', email);
    console.log('Password:', password);
    // Clearing form fields after submission

    if (userType == "patient") {

      axios.post('http://localhost:9190/patient/login', { email, password, userType })
        .then((res) => {
          console.log(res);
          localStorage.setItem("user", JSON.stringify(res.data));
          setEmail('');
          setPassword('');
          navigate('/patient-dashboard');
        })
        .catch((err) => {
          setEmail('');
          setPassword('');
          console.log(err);
        });
    }
    else{
      axios.post('http://localhost:9190/doctor/login', { email, password, userType })
        .then((res) => {
          console.log(res);
          localStorage.setItem("user", JSON.stringify(res.data));
          setEmail('');
          setPassword('');
          navigate('/doctor-dashboard');
        })
        .catch((err) => {
          setEmail('');
          setPassword('');
          console.log(err);
        });
    }


  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>

        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>User Type:</label>
          <div>
            <input
              type="radio"
              id="patient"
              value="patient"
              checked={userType === 'patient'}
              onChange={() => setUserType('patient')}
            />
            <label htmlFor="patient">Patient</label>
          </div>
          <div>
            <input
              type="radio"
              id="doctor"
              value="doctor"
              checked={userType === 'doctor'}
              onChange={() => setUserType('doctor')}
            />
            <label htmlFor="doctor">Doctor</label>
          </div>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
