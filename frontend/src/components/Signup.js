import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../utils/AuthService';

function Signup() {
  const initialFreelancerState = {
    id: null,
    Username: '',
    Password: ''
  };
  const [freelancer, setFreelancer] = useState(initialFreelancerState);
  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = event => {
    const { name, value } = event.target;
    setFreelancer({ ...freelancer, [name]: value });
  };

  const validatePassword = (Password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(Password);
  };

  const saveFreelancer = async () => {
    if (!validatePassword(freelancer.Password)) {
      alert("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.");
      return;
    }
    const data = {
      Username: freelancer.Username,
      Password: freelancer.Password
    };
    console.log('Payload sent to backend:', JSON.stringify(data, null, 2));
    try {
      const result = await authService.signup(data);
      if (result.success) {
        setFreelancer({ ...freelancer, id: result.data.Id });
        setSubmitted(true);
        console.log(result);

        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        alert(result.error || 'Signup failed.');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  const newFreelancer = () => {
    navigate('/');
  };

  return (
    <div className="submit-form">
      {submitted ? (
        <div className='container mt-4'>
          <div className="card mx-auto" style={{ maxWidth: "400px" }}>
            <div className="card-body d-flex flex-column align-items-center">
              <h5>You submitted successfully!</h5>
              <button className="btn btn-primary" onClick={newFreelancer}>
                Back
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className='container mt-4'>
          <h2 className="text-center">Create An Account</h2>
          <div className="card mx-auto py-3" style={{ maxWidth: "400px" }}>
            <div className="form-group px-4 py-1">
              <label htmlFor="Username">Username</label>
              <input
                type="text"
                className="form-control"
                id="Username"
                required
                value={freelancer.Username}
                onChange={handleInputChange}
                name="Username"
              />
            </div>
            <div className="form-group px-4 py-1">
              <label htmlFor="Password">Password</label>
              <input
                type="password"
                className="form-control"
                id="Password"
                required
                value={freelancer.Password}
                onChange={handleInputChange}
                name="Password"
              />
            </div>
            <button onClick={saveFreelancer} className="mx-auto btn btn-success mt-2">
              Sign Up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;
