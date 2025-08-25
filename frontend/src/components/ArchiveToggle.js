import React from "react";

function ArchiveToggle({ freelancerId, isArchived, onToggle }) {
    const handleToggle = async () => {
        const action = isArchived ? 'unarchive' : 'archive';
        try {
            const response = await fetch(`http://localhost:5095/api/Freelancers/${freelancerId}/${action}`, {
                method: 'PATCH',
            });
            if (response.ok) {
                alert(`Freelancer has been ${action}d successfully.`);
                onToggle(!isArchived);
            } else {
                alert('Failed to toggle archive status');
            }
        } catch (error) {
            alert('Network error');
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
