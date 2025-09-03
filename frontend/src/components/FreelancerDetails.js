import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import DeleteFreelancer from './DeleteFreelancer';
import ArchiveToggle from './ArchiveToggle';

function FreelancerDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [freelancer, setFreelancer] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchFreelancer = async () => {
            // Get token directly
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('You must be logged in');
                navigate('/login');
                return;
            }

            try {
                console.log('Fetching freelancer ID:', id);
                
                const response = await fetch(`http://localhost:5095/api/freelancers/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    alert('Session expired. Please login again.');
                    localStorage.clear();
                    navigate('/login');
                    return;
                }

                if (response.ok) {
                    const result = await response.json();
                    console.log('Freelancer data:', result);
                    
                    setFreelancer({
                        id: result.id,
                        username: result.username,
                        email: result.email,
                        phoneNum: result.phoneNum,
                        skillsets: result.skillsets || [],
                        hobbies: result.hobbies || [],
                        isArchived: result.isArchived
                    });
                } else {
                    console.error('Failed to fetch freelancer:', response.status);
                    alert('Failed to load freelancer details');
                    navigate('/');
                }
            } catch (error) {
                console.error('Network error:', error);
                alert('Network error loading freelancer');
                navigate('/');
            }
        };
        
        fetchFreelancer();
    }, [id, navigate]);

    const handleSave = async (e) => {
        e.preventDefault();
        
        // Get token directly
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('You must be logged in');
            navigate('/login');
            return;
        }

        const payload = {
            Id: Number(id),
            Username: freelancer.username,
            Email: freelancer.email,
            PhoneNum: freelancer.phoneNum,
            Skillsets: freelancer.skillsets,
            Hobbies: freelancer.hobbies
        };
        
        try {
            console.log('Updating freelancer with payload:', payload);
            
            const response = await fetch(`http://localhost:5095/api/freelancers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 401) {
                alert('Session expired. Please login again.');
                localStorage.clear();
                navigate('/login');
                return;
            }

            if (response.ok) {
                console.log('Update successful');
                alert('Freelancer updated successfully');
                
                // Refetch freelancer details after successful update
                try {
                    const updatedResponse = await fetch(`http://localhost:5095/api/freelancers/${id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (updatedResponse.ok) {
                        const updated = await updatedResponse.json();
                        console.log('Refetched freelancer:', updated);
                        setFreelancer({
                            id: updated.id,
                            username: updated.username,
                            email: updated.email,
                            phoneNum: updated.phoneNum,
                            skillsets: updated.skillsets || [],
                            hobbies: updated.hobbies || [],
                            isArchived: updated.isArchived
                        });
                    }
                } catch (fetchError) {
                    console.error('Error refetching freelancer:', fetchError);
                }
                
                setIsEditing(false);
            } else {
                let errorMessage = 'Update failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Keep default error message
                }
                console.error('Update failed:', response.status, errorMessage);
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Network error updating freelancer:', error);
            alert('Network error updating freelancer');
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
                                <input 
                                    id="Username" 
                                    className="form-control form-control-sm" 
                                    value={freelancer.username || ''} 
                                    onChange={e => setFreelancer(prev => ({ ...prev, username: e.target.value }))} 
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="Email" className="form-label">Email:</label>
                                <input 
                                    id="Email" 
                                    className="form-control form-control-sm" 
                                    value={freelancer.email || ''} 
                                    onChange={e => setFreelancer(prev => ({ ...prev, email: e.target.value }))} 
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="PhoneNum" className="form-label">Phone Number:</label>
                                <input 
                                    id="PhoneNum" 
                                    className="form-control form-control-sm" 
                                    value={freelancer.phoneNum || ''} 
                                    onChange={e => setFreelancer(prev => ({ ...prev, phoneNum: e.target.value }))} 
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="Skillsets" className="form-label">Skillsets:</label>
                                <input 
                                    id="Skillsets" 
                                    className="form-control form-control-sm" 
                                    value={freelancer.skillsets?.map(s => s.skillName).join(', ') || ''} 
                                    onChange={e => setFreelancer(prev => ({ 
                                        ...prev, 
                                        skillsets: e.target.value.split(',').map(name => ({ skillName: name.trim() })) 
                                    }))} 
                                />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="Hobbies" className="form-label">Hobbies:</label>
                                <input 
                                    id="Hobbies" 
                                    className="form-control form-control-sm" 
                                    value={freelancer.hobbies?.map(h => h.hobbyName).join(', ') || ''} 
                                    onChange={e => setFreelancer(prev => ({ 
                                        ...prev, 
                                        hobbies: e.target.value.split(',').map(name => ({ hobbyName: name.trim() })) 
                                    }))} 
                                />
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
                        <p><strong>Skillsets:</strong> {freelancer.skillsets?.map(s => s.skillName).join(', ')}</p>
                        <p><strong>Hobbies:</strong> {freelancer.hobbies?.map(h => h.hobbyName).join(', ')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FreelancerDetails;