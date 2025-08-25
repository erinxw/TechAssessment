import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function UpdateFreelancer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [skillsets, setSkillsets] = useState([{ SkillName: '' }]);
  const [hobbies, setHobbies] = useState([{ HobbyName: '' }]);

  useEffect(() => {
    fetch(`http://localhost:5095/api/Freelancers/${id}`)
      .then(response => response.json())
      .then(data => {
        setUsername(data.username);
        setEmail(data.email);
        setPhoneNum(data.phoneNum);
        setSkillsets(data.skillsets);
        setHobbies(data.hobbies);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      Id: Number(id),
      Username: username,
      Email: email,
      PhoneNum: phoneNum,
      Skillsets: skillsets,
      Hobbies: hobbies
    };
    const response = await fetch(`http://localhost:5095/api/Freelancers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      alert('Freelancer updated!');
      navigate(`/freelancers/${id}`);
    } else {
      alert('Error updating freelancer');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ...fields for username, email, phoneNum, skillsets, hobbies... */}
      <button className="btn btn-primary btn-sm" type="submit">Update</button>
    </form>
  );
}

export default UpdateFreelancer;