import React from 'react';
import authService from '../utils/AuthService';

function DeleteFreelancer({ freelancerId, onDelete }) {
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this freelancer?')) return;
    try {
      await authService.apiRequest(`http://localhost:5095/api/freelancers/${freelancerId}`, {
        method: 'DELETE'
      });
      alert('Freelancer deleted successfully');
      if (onDelete) onDelete(freelancerId);
    } catch (error) {
      alert('Error deleting freelancer');
    }
  };

  return (
    <button onClick={handleDelete} className="btn btn-danger btn-sm ms-1">Delete</button>
  );
}

export default DeleteFreelancer;
