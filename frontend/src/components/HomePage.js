import { useNavigate } from 'react-router-dom';
import DeleteFreelancer from './DeleteFreelancer';
import ArchiveToggle from './ArchiveToggle';
import React, { useState, useEffect } from 'react';

function HomePage() {
  const navigate = useNavigate();
  const [freelancers, setFreelancers] = useState([]);
  const [pagination, setPagination] = useState({ 
    totalCount: 0,
    pageSize: 10,
    currentPageNumber: 1, 
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  });

  async function fetchFreelancers(page = 1) {
    try {
      const response = await fetch(`http://localhost:5095/api/Freelancers/filter?currentPageNumber=${page}&pageSize=${pagination.pageSize}`);
      if (response.ok) {
        const data = await response.json();
        setFreelancers(data.data || []); // Use the 'data' property from paginated response
        setPagination({
          totalCount: data.totalCount,
          pageSize: data.pageSize,
          currentPageNumber: data.currentPageNumber,
          totalPages: data.totalPages,
          hasPreviousPage: data.hasPreviousPage,
          hasNextPage: data.hasNextPage
        });
      }
    } catch (error) {
      console.error('Error fetching freelancers:', error);
    }
  }

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const unarchiveFreelancer = (idx) => {
    setFreelancers(prev =>
      prev.map((f, i) =>
        i === idx ? { ...f, isArchived: false } : f
      )
    );
  };

  const archiveFreelancer = (idx) => {
    setFreelancers(prev =>
      prev.map((f, i) =>
        i === idx ? { ...f, isArchived: true } : f
      )
    );
  };

  const deleteFreelancer = (idx) => {
    setFreelancers(prev => prev.filter((_, i) => i !== idx));
  };

  console.log('Pagination:', pagination); // Debug pagination state
  return (
    <div className="HomePage">
      <h1 className="text-center">Welcome to Freelancer UI</h1>
      <div className="d-flex justify-content-center mb-3">
        <button onClick={() => navigate('/create')} className="btn btn-primary">Create New Freelancer</button>
      </div>
      <div className="d-flex justify-content-center">
        <table className="table table-striped table-bordered w-auto">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Skillsets</th>
              <th>Hobbies</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {freelancers.map((f, idx) => (
              <tr key={f.id || idx}>
                <td>{f.username || f.Username}</td>
                <td>{f.email || f.Email}</td>
                <td>{f.phoneNum || f.PhoneNum}</td>
                <td>{Array.isArray(f.skillsets) && f.skillsets.length > 0 ? f.skillsets.map(s => s.skillName).join(', ') : '—'}</td>
                <td>{Array.isArray(f.hobbies) && f.hobbies.length > 0 ? f.hobbies.map(h => h.hobbyName).join(', ') : '—'}</td>
                <td>
                  {/* Actions: View/Archive/Unarchive/Delete */}
                  <button className="btn btn-info btn-sm" onClick={() => navigate(`/Freelancers/${f.id || idx}`)}>View</button>
                  <ArchiveToggle
                    freelancerId={f.id || idx}
                    isArchived={f.isArchived}
                    onToggle={(updatedStatus) => setFreelancers(prev => {
                      const updatedFreelancers = [...prev];
                      updatedFreelancers[idx].isArchived = updatedStatus;
                      return updatedFreelancers;
                    })}
                  />
                    <DeleteFreelancer freelancerId={f.id || idx} onDelete={() => deleteFreelancer(idx)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-center my-3">
        <div className="pagination-buttons">
          <button
            className="btn btn-secondary"
            disabled={!pagination.hasPreviousPage}
            onClick={() => fetchFreelancers(pagination.currentPageNumber - 1)}
          >
            Previous
          </button>
          <span> Page {pagination.currentPageNumber} of {pagination.totalPages} </span>
          <button
            className="btn btn-secondary"
            disabled={!pagination.hasNextPage}
            onClick={() => fetchFreelancers(pagination.currentPageNumber + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
