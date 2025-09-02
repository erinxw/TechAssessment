import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const initialFreelancerState = {
    id: null,
    Username: '',
    Password: ''
  };
  const [freelancer, setFreelancer] = useState(initialFreelancerState);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = event => {
    const { name, value } = event.target;
    setFreelancer({ ...freelancer, [name]: value });
  };

  const saveFreelancer = async () => {
    const data = {
      Username: freelancer.Username,
      Password: freelancer.Password
    };
    console.log('Payload sent to backend:', JSON.stringify(data, null, 2));
    try {
      const response = await fetch('http://localhost:5095/api/account/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const result = await response.json();
        setFreelancer({ ...freelancer, id: result.id });
        setSubmitted(true);
        console.log(result);
      } else {
        let errorMessage = "An error occurred";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, keep default error message
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error');
    }
  };

  const navigate = useNavigate();
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
