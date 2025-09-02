import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../utils/AuthService';

function CreateFreelancer() {
  const initialFreelancerState = {
    id: null,
    Username: '',
    Email: '',
    PhoneNum: '',
    Skillsets: [{ SkillName: '' }],
    Hobbies: [{ HobbyName: '' }]
  };
  const [freelancer, setFreelancer] = useState(initialFreelancerState);
  const [submitted, setSubmitted] = useState(false);

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
    const data = {
      Username: freelancer.Username,
      Email: freelancer.Email,
      PhoneNum: freelancer.PhoneNum,
      Skillsets: freelancer.Skillsets,
      Hobbies: freelancer.Hobbies
    };
    console.log('Payload sent to backend:', JSON.stringify(data, null, 2));
    try {
      const response = await authService.createFreelancer(data);
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
          <h2 className="text-center">Create A New Freelancer</h2>
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
                  <button type="button" className="btn btn-danger" onClick={() => removeSkillset(idx)} disabled={freelancer.Skillsets.length === 1}>Remove</button>
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
                  <button type="button" className="btn btn-danger" onClick={() => removeHobby(idx)} disabled={freelancer.Hobbies.length === 1}>Remove</button>
                </div>
              ))}
              <button type="button" className="btn btn-primary" onClick={addHobby}>Add</button>
            </div>
            <button onClick={saveFreelancer} className="mx-auto btn btn-success mt-2">
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateFreelancer;
