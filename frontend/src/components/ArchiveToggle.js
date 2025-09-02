import React from "react";
import authService from '../utils/AuthService';

function ArchiveToggle({ freelancerId, isArchived, onToggle }) {
    const handleToggle = async () => {
        const action = isArchived ? 'unarchive' : 'archive';
        try {
            await authService.apiRequest(`http://localhost:5095/api/Freelancers/${freelancerId}/${action}`, {
                method: 'PATCH'
            });
            alert(`Freelancer has been ${action}d successfully.`);
            onToggle(!isArchived);
        } catch (error) {
            alert('Failed to toggle archive status');
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
