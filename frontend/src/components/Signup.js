import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const initialFreelancerState = {
    id: null,
    Username: '',
    Email: '',
    Password: '',
    PhoneNum: '',
    Skillsets: [{ SkillName: '' }],
    Hobbies: [{ HobbyName: '' }]
  };
  const [freelancer, setFreelancer] = useState(initialFreelancerState);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = event => {
    const { name, value } = event.target;
    setFreelancer({ ...freelancer, [name]: value });
  };

  // Handlers for Skillsets and Hobbies arrays
  const handleSkillsetChange = (idx, value) => {
    const updated = [...freelancer.Skillsets];
    updated[idx].SkillName = value;
    setFreelancer({ ...freelancer, Skillsets: updated });
  };
  const addSkillset = () => setFreelancer({ ...freelancer, Skillsets: [...freelancer.Skillsets, { SkillName: '' }] });
  const removeSkillset = idx => setFreelancer({ ...freelancer, Skillsets: freelancer.Skillsets.filter((_, i) => i !== idx) });

  const handleHobbyChange = (idx, value) => {
    const updated = [...freelancer.Hobbies];
    updated[idx].HobbyName = value;
    setFreelancer({ ...freelancer, Hobbies: updated });
  };
  const addHobby = () => setFreelancer({ ...freelancer, Hobbies: [...freelancer.Hobbies, { HobbyName: '' }] });
  const removeHobby = idx => setFreelancer({ ...freelancer, Hobbies: freelancer.Hobbies.filter((_, i) => i !== idx) });

  const saveFreelancer = async () => {
    // Prepare data
    const data = {
      Username: freelancer.Username.trim(),
      Email: freelancer.Email.trim(),
      Password: freelancer.Password,
      PhoneNum: freelancer.PhoneNum.trim(),
      Skillsets: freelancer.Skillsets.filter(skill => skill.SkillName.trim() !== ''),
      Hobbies: freelancer.Hobbies.filter(hobby => hobby.HobbyName.trim() !== '')
    };

    // Basic validation
    if (!data.Username || !data.Email || !data.Password || !data.PhoneNum) {
      alert('Please fill in all required fields');
      return;
    }

    if (data.Password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    console.log('=== SIGNUP DEBUG ===');
    console.log('Payload:', JSON.stringify(data, null, 2));

    try {
      const response = await fetch('http://localhost:5095/api/account/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      console.log('Signup response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Signup successful:', result);

        // Store auth data directly
        if (result.accessToken) localStorage.setItem('accessToken', result.accessToken);
        if (result.Username) localStorage.setItem('username', result.Username);
        if (result.Id) localStorage.setItem('userId', result.Id.toString());

        setSubmitted(true);
        
        // Auto redirect after success
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        let errorMessage = "An error occurred";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.log('Signup error:', errorData);
        } catch (jsonError) {
          console.log('Could not parse error response');
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please try again.');
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
              <h5>Account created successfully!</h5>
              <p>Redirecting to homepage...</p>
              <button className="btn btn-primary" onClick={newFreelancer}>
                Go Now
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
              <label htmlFor="Email">Email</label>
              <input
                type="email"
                className="form-control"
                id="Email"
                required
                value={freelancer.Email}
                onChange={handleInputChange}
                name="Email"
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
                placeholder="At least 8 characters"
              />
            </div>
            <div className="form-group px-4 py-1">
              <label htmlFor="PhoneNum">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                id="PhoneNum"
                required
                value={freelancer.PhoneNum}
                onChange={handleInputChange}
                name="PhoneNum"
              />
            </div>
            <div className="form-group px-4 py-1">
              <label>Skillsets</label>
              {freelancer.Skillsets.map((skill, idx) => (
                <div key={idx} className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    value={skill.SkillName}
                    onChange={e => handleSkillsetChange(idx, e.target.value)}
                    placeholder={`Skillset #${idx + 1}`}
                  />
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={() => removeSkillset(idx)} 
                    disabled={freelancer.Skillsets.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-primary" onClick={addSkillset}>Add</button>
            </div>
            <div className="form-group px-4 py-1">
              <label>Hobbies</label>
              {freelancer.Hobbies.map((hobby, idx) => (
                <div key={idx} className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    value={hobby.HobbyName}
                    onChange={e => handleHobbyChange(idx, e.target.value)}
                    placeholder={`Hobby #${idx + 1}`}
                  />
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={() => removeHobby(idx)} 
                    disabled={freelancer.Hobbies.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-primary" onClick={addHobby}>Add</button>
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