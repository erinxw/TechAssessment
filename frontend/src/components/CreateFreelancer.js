
import React, { useState } from 'react';

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
  const addSkillset = () => setFreelancer({ ...freelancer, Skillsets: [...freelancer.Skillsets, { Name: '' }] });
  const removeSkillset = idx => setFreelancer({ ...freelancer, Skillsets: freelancer.Skillsets.filter((_, i) => i !== idx) });

  const handleHobbyChange = (idx, value) => {
    const updated = [...freelancer.Hobbies];
    updated[idx].HobbyName = value;
    setFreelancer({ ...freelancer, Hobbies: updated });
  };
  const addHobby = () => setFreelancer({ ...freelancer, Hobbies: [...freelancer.Hobbies, { Name: '' }] });
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
  const response = await fetch('https://localhost:7202/api/Freelancers', {
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
        alert('Error submitting form');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error');
    }
  };

  const newFreelancer = () => {
    setFreelancer(initialFreelancerState);
    setSubmitted(false);
  };

  return (
    <div className="submit-form">
      {submitted ? (
        <div>
          <h4>You submitted successfully!</h4>
          <button className="btn btn-success" onClick={newFreelancer}>
            Add
          </button>
        </div>
      ) : (
        <div>
          <div className="form-group">
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
          <div className="form-group">
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
          <div className="form-group">
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
          <div className="form-group">
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
            <button type="button" className="btn btn-primary" onClick={addSkillset}>Add Skillset</button>
          </div>
          <div className="form-group">
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
            <button type="button" className="btn btn-primary" onClick={addHobby}>Add Hobby</button>
          </div>
          <button onClick={saveFreelancer} className="btn btn-success">
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

export default CreateFreelancer;
