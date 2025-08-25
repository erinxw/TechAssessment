import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DeleteFreelancer from './DeleteFreelancer';
import ArchiveToggle from './ArchiveToggle';
import UpdateFreelancer from './UpdateFreelancer';

function FreelancerDetails() {
    const { id } = useParams();
    const [freelancer, setFreelancer] = useState(null);

    console.log('ID from params:', id); // Debug line

    useEffect(() => {
        console.log('Fetching freelancer with ID:', id);
        fetch(`http://localhost:5095/api/Freelancers/${id}`)
            .then(response => {
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Fetched data:', data);
                setFreelancer(data);
            })
            .catch(error => {
                console.error('Error fetching freelancer:', error);
            });
    }, [id]);

    if (!freelancer) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mt-4">
            <h2 className="text-center">Freelancer Details</h2>
            <div className="card mx-auto" style={{ maxWidth: "400px" }}>
                <div className="card-body">
                    <p><strong>Username:</strong> {freelancer.username}</p>
                    <p><strong>Email:</strong> {freelancer.email}</p>
                    <p><strong>Phone Number:</strong> {freelancer.phoneNum}</p>
                    <p><strong>Skillsets:</strong> {freelancer.skillsets?.map(s => s.skillName).join(', ') || 'No skillsets'}</p>
                    <p><strong>Hobbies:</strong> {freelancer.hobbies?.map(h => h.hobbyName).join(', ') || 'No hobbies'}</p>
                </div>
                <div className="mx-auto mb-4">
                  {/* Actions: Update/Archive/Unarchive/Delete */}
                  <UpdateFreelancer freelancer={freelancer} />&nbsp;|&nbsp;
                  <ArchiveToggle
                    freelancerId={freelancer.id}
                    isArchived={freelancer.isArchived}
                    onToggle={(updatedStatus) => setFreelancer(prev => ({ ...prev, isArchived: updatedStatus }))}
                  />&nbsp;|&nbsp;
                  <DeleteFreelancer freelancerId={freelancer.id} />
                </div>
            </div>
        </div>
    );
}

export default FreelancerDetails;