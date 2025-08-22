import React, { useState, useEffect } from 'react';

function UpdateFreelancer({ freelancer, onUpdate }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phonenum: '',
    skills: [''],
    hobbies: ['']
  });

  useEffect(() => {
    if (freelancer) {
      setFormData({
        username: freelancer.username || '',
        email: freelancer.email || '',
        phonenum: freelancer.phonenum || '',
        skills: freelancer.skills || [''],
        hobbies: freelancer.hobbies || ['']
      });
    }
  }, [freelancer]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // Add similar handlers for skills and hobbies arrays as in CreateFreelancer

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5095/api/freelancers/${freelancer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      if(response.ok) {
        const result = await response.json();
        alert('Freelancer updated successfully');
        if (onUpdate) onUpdate(result);
      } else {
        alert('Error updating freelancer');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ...similar form fields as CreateFreelancer... */}
      <button type="submit">Update</button>
    </form>
  );
}

export default UpdateFreelancer;
