import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import DeleteFreelancer from './DeleteFreelancer';
import ArchiveToggle from './ArchiveToggle';

function FreelancerDetails() {
    const { id } = useParams();
    const [freelancer, setFreelancer] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5095/api/Freelancers/${id}`)
            .then(response => response.json())
            .then(data => setFreelancer(data))
            .catch(error => console.error('Error fetching freelancer:', error));
    }, [id]);

    const [isEditing, setIsEditing] = useState(false);

    if (!freelancer) {
        return <div>Loading...</div>;
    }

    const handleSave = async (e) => {
        e.preventDefault();
        const payload = {
            id: Number(id),
            username: freelancer.username,
            email: freelancer.email,
            phoneNum: freelancer.phoneNum,
            skillsets: freelancer.skillsets,
            hobbies: freelancer.hobbies
        };
        try {
            const response = await fetch(`http://localhost:5095/api/Freelancers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const text = await response.text();
                if (text) {
                    const updatedFreelancer = JSON.parse(text);
                    setFreelancer(updatedFreelancer);
                }
                setIsEditing(false);
            } else {
                console.error('Error updating freelancer:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating freelancer:', error);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center">Freelancer Details</h2>
            <div className="card mx-auto" style={{ maxWidth: "400px" }}>
                {isEditing ? (
                    <form onSubmit={handleSave}>
                        <div className="card-body">
                            <div className="mb-2">
                                <label htmlFor="username" className="form-label">Username:</label>
                                <input id="username" className="form-control form-control-sm" value={freelancer.username} onChange={e => setFreelancer(prev => ({ ...prev, Username: e.target.value }))} />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="email" className="form-label">Email:</label>
                                <input id="email" className="form-control form-control-sm" value={freelancer.email} onChange={e => setFreelancer(prev => ({ ...prev, Email: e.target.value }))} />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="phoneNum" className="form-label">Phone Number:</label>
                                <input id="phoneNum" className="form-control form-control-sm" value={freelancer.phoneNum} onChange={e => setFreelancer(prev => ({ ...prev, PhoneNum: e.target.value }))} />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="skillsets" className="form-label">Skillsets:</label>
                                <input id="skillsets" className="form-control form-control-sm" value={freelancer.skillsets?.map(s => s.skillName).join(', ') || ''} onChange={e => setFreelancer(prev => ({ ...prev, skillsets: e.target.value.split(',').map(name => ({ skillName: name.trim() })) }))} />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="hobbies" className="form-label">Hobbies:</label>
                                <input id="hobbies" className="form-control form-control-sm" value={freelancer.hobbies?.map(h => h.hobbyName).join(', ') || ''} onChange={e => setFreelancer(prev => ({ ...prev, hobbies: e.target.value.split(',').map(name => ({ hobbyName: name.trim() })) }))} />
                            </div>
                        </div>
                        <div className="card-footer bg-white border-0 d-flex justify-content-end">
                            <button className="btn btn-primary btn-sm" type="submit">Save</button>
                            <button className="btn btn-secondary btn-sm ms-2" type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <div className="card-body">
                        <p><strong>Username:</strong> {freelancer.username}</p>
                        <p><strong>Email:</strong> {freelancer.email}</p>
                        <p><strong>Phone Number:</strong> {freelancer.phoneNum}</p>
                        <p><strong>Skillsets:</strong> {freelancer.skillsets?.map(s => s.skillName).join(', ') || 'No skillsets'}</p>
                        <p><strong>Hobbies:</strong> {freelancer.hobbies?.map(h => h.hobbyName).join(', ') || 'No hobbies'}</p>
                        <div className="mx-auto mb-4">
                            <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>Edit</button>
                            <ArchiveToggle
                                freelancerId={freelancer.id}
                                isArchived={freelancer.isArchived}
                                onToggle={(updatedStatus) => setFreelancer(prev => ({ ...prev, isArchived: updatedStatus }))}
                            />
                            <DeleteFreelancer freelancerId={freelancer.id} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FreelancerDetails;