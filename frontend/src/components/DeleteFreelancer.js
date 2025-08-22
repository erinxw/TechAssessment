import React from 'react';

function DeleteFreelancer({ freelancerId, onDelete }) {
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this freelancer?')) return;
    try {
      const response = await fetch(`http://localhost:5095/api/freelancers/${freelancerId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Freelancer deleted successfully');
        if (onDelete) onDelete(freelancerId);
      } else {
        alert('Error deleting freelancer');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error');
    }
  };

  return (
    <button onClick={handleDelete} className="btn btn-danger">Delete</button>
  );
}

export default DeleteFreelancer;
