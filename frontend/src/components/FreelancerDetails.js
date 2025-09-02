import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import DeleteFreelancer from './DeleteFreelancer';
import ArchiveToggle from './ArchiveToggle';
import authService from '../utils/AuthService';

function FreelancerDetails() {
    const { id } = useParams();
    const [freelancer, setFreelancer] = useState(null);

    useEffect(() => {
        const fetchFreelancer = async () => {
            try {
                const result = await authService.getFreelancerById(id);
                setFreelancer({
                    id: result.id,
                    username: result.username,
                    email: result.email,
                    phoneNum: result.phoneNum,
                    skillsets: result.skillsets,
                    hobbies: result.hobbies,
                    isArchived: result.isArchived
                });
            } catch (error) {
                console.error(error.message);
            }
        };
        fetchFreelancer();
    }, [id]);

    const [isEditing, setIsEditing] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        const payload = {
            Id: Number(id),
            Username: freelancer.username,
            Email: freelancer.email,
            PhoneNum: freelancer.phoneNum,
            Skillsets: freelancer.skillsets,
            Hobbies: freelancer.hobbies
        };
        
        try {
            console.log('Payload being sent:', payload);
            const result = await authService.updateFreelancer(id, payload);
            console.log('API response from update:', result);
            if (result !== undefined) {
                // Refetch freelancer details after successful update
                try {
                    const updated = await authService.getFreelancerById(id);
                    console.log('Refetched freelancer:', updated);
                    setFreelancer(updated);
                } catch (fetchError) {
                    console.error('Error refetching freelancer:', fetchError.message || fetchError);
                }
                setIsEditing(false);
            } else {
                console.error('Error updating freelancer: No response data');
            }
        } catch (error) {
            console.error('Error updating freelancer:', error.message || error);
        }
    };

    if (!freelancer) {
        return <div className="container mt-4">Loading...</div>;
    }

    return (
        <div className="container mt-4">
            <h2 className="text-center">Freelancer Details</h2>
            <div className="card mx-auto" style={{ maxWidth: "400px" }}>
                {isEditing ? (
                    <form onSubmit={handleSave}>
                        <div className="card-body">
                            <div className="mb-2">
                                <label htmlFor="Username" className="form-label">Username:</label>
                                <input id="Username" className="form-control form-control-sm" value={freelancer.username} onChange={e => setFreelancer(prev => ({ ...prev, username: e.target.value }))} />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="Email" className="form-label">Email:</label>
                                <input id="Email" className="form-control form-control-sm" value={freelancer.email} onChange={e => setFreelancer(prev => ({ ...prev, email: e.target.value }))} />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="PhoneNum" className="form-label">Phone Number:</label>
                                <input id="PhoneNum" className="form-control form-control-sm" value={freelancer.phoneNum} onChange={e => setFreelancer(prev => ({ ...prev, phoneNum: e.target.value }))} />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="Skillsets" className="form-label">Skillsets:</label>
                                <input id="Skillsets" className="form-control form-control-sm" value={freelancer.skillsets?.map(s => s.skillName).join(', ') || ''} onChange={e => setFreelancer(prev => ({ ...prev, skillsets: e.target.value.split(',').map(name => ({ skillName: name.trim() })) }))} />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="Hobbies" className="form-label">Hobbies:</label>
                                <input id="Hobbies" className="form-control form-control-sm" value={freelancer.hobbies?.map(h => h.hobbyName).join(', ') || ''} onChange={e => setFreelancer(prev => ({ ...prev, hobbies: e.target.value.split(',').map(name => ({ hobbyName: name.trim() })) }))} />
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
                        <div className="mx-auto d-flex justify-content-center">
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