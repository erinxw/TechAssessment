import React from "react";

function ArchiveToggle({ freelancerId, isArchived, onToggle }) {
    const handleToggle = async () => {
        // Get token directly
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('You must be logged in');
            window.location.href = '/login';
            return;
        }

        const action = isArchived ? 'unarchive' : 'archive';
        
        try {
            console.log(`${action}ing freelancer ID:`, freelancerId);
            
            const response = await fetch(`http://localhost:5095/api/Freelancers/${freelancerId}/${action}`, {
                method: 'PATCH',
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
                alert(`Freelancer has been ${action}d successfully.`);
                onToggle(!isArchived);
            } else {
                console.error(`${action} failed:`, response.status);
                alert(`Failed to ${action} freelancer`);
            }
        } catch (error) {
            console.error('Network error:', error);
            alert(`Network error while trying to ${action} freelancer`);
        }
    };

    return (
        <button
            className={`btn btn-sm ms-1 ${isArchived ? 'btn-success' : 'btn-warning'}`}
            style={{ width: '80px' }}
            onClick={handleToggle}
        >
            {isArchived ? 'Unarchive' : 'Archive'}
        </button>
    );
}

export default ArchiveToggle;