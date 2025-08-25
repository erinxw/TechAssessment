import { useNavigate } from 'react-router-dom';
import DeleteFreelancer from './DeleteFreelancer';
import ArchiveToggle from './ArchiveToggle';
import React, { useState, useEffect, use } from 'react';

function HomePage() {
  const navigate = useNavigate();
  const [freelancers, setFreelancers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchPhrase, setSearchPhrase] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pagination, setPagination] = useState({
    totalCount: 0,
    pageSize: 10,
    currentPageNumber: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  });

  async function fetchFreelancers(page = 1, searchPhraseParam) {
    try {
      let url = `http://localhost:5095/api/Freelancers/filter?currentPageNumber=${page}&pageSize=${pagination.pageSize}`;
      if (filter === 'archived') url += '&isArchived=true';
      else if (filter === 'unarchived') url += '&isArchived=false';
      const phraseToUse = typeof searchPhraseParam === 'string' ? searchPhraseParam : searchPhrase;
      if (phraseToUse && phraseToUse.length >= 2) url += `&searchPhrase=${encodeURIComponent(phraseToUse)}`;
      const response = await fetch(url);
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
  }, [filter, searchPhrase]);
  // ...existing code...

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

  const sortFreelancers = (freelancersArray) => {
    return [...freelancersArray].sort((a, b) => {
      const aValue = (a.username || '').toLowerCase();
      const bValue = (b.username || '').toLowerCase();

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const sortedAndFilteredFreelancers = sortFreelancers(freelancers);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  console.log('Pagination:', pagination); // Debug pagination state
  return (
    <div className="HomePage">
      <h1 className="text-center">Welcome to Freelancer UI</h1>

      {/* Search Bar */}
      <div className="d-flex justify-content-center mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by username or email"
          value={searchPhrase}
          onChange={e => setSearchPhrase(e.target.value)}
        />
      </div>

      {/* Freelancer Table */}
      <div className="d-flex justify-content-center">
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2" style={{ width: '100%' }}>
              <div className="d-flex align-items-center">
{/* Filter Button Group */}
            <div className="btn-group me-2" role="group">
              <button className={`btn btn-outline-primary btn-sm${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>All</button>
              <button className={`btn btn-outline-success btn-sm${filter === 'unarchived' ? ' active' : ''}`} onClick={() => setFilter('unarchived')}>Unarchived</button>
              <button className={`btn btn-outline-warning btn-sm${filter === 'archived' ? ' active' : ''}`} onClick={() => setFilter('archived')}>Archived</button>
            </div>
            {/* Sort Button */}
            <button className="btn btn-light me-2" onClick={toggleSortOrder}>
              <span className="me-1">Sort</span>
              {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
            </button>
            </div>
          
            {/* Create Button */}
            <button onClick={() => navigate('/create')} className="btn btn-dark">New</button>
          </div>
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
              {sortedAndFilteredFreelancers.map((f, idx) => (
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
                      onToggle={() => fetchFreelancers(pagination.currentPageNumber)}
                    />
                    <DeleteFreelancer freelancerId={f.id || idx} onDelete={() => deleteFreelancer(idx)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
