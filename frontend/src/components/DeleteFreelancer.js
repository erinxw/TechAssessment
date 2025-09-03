import React from 'react';

function DeleteFreelancer({ freelancerId, onDelete }) {
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this freelancer?')) return;
    
    // Get token directly
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('You must be logged in');
      window.location.href = '/login';
      return;
    }

    try {
      console.log('Deleting freelancer ID:', freelancerId);
      
      const response = await fetch(`http://localhost:5095/api/freelancers/${freelancerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        alert('Freelancer deleted successfully');
        if (onDelete) onDelete(freelancerId);
      } else {
        console.error('Delete failed:', response.status);
        alert('Error deleting freelancer');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error deleting freelancer');
    }
  };

  return (
    <button onClick={handleDelete} className="btn btn-danger btn-sm ms-1">
      Delete
    </button>
  );
}

export default DeleteFreelancer;