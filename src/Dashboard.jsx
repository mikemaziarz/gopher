import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Import supabase client
import { supabase } from './supabaseClient';
import ScoreTrendChart from './ScoreTrendChart';

const Dashboard = () => {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teeFilter, setTeeFilter] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  useEffect(() => {
    const fetchRounds = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://qfxvsdjjptykleogsdpw.supabase.co/functions/v1/getRounds', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch rounds');
        }

        const data = await response.json();
        setRounds(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error('Error fetching rounds:', err);
        setError('Failed to load rounds.');
      } finally {
        setLoading(false);
      }
    };

    fetchRounds();
  }, []);

  const calculateHandicap = (rounds) => {
    const differentials = rounds
      .filter(r => r.course_rating && r.slope_rating && r.final_score)
      .map(r => ((r.final_score - r.course_rating) * 113) / r.slope_rating)
      .sort((a, b) => a - b)
      .slice(0, 8);

    if (differentials.length === 0) return null;

    const average = differentials.reduce((acc, val) => acc + val, 0) / differentials.length;
    const handicap = Math.floor(average * 0.96 * 10) / 10;
    return handicap.toFixed(1);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this round?')) return;
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', id);
      if (error) {
        throw error;
      }
      // Remove from local state
      setRounds(prevRounds => prevRounds.filter(round => round.id !== id));
    } catch (err) {
      console.error('Error deleting round:', err);
      setError('Failed to delete round.');
    }
  };

  const filteredRounds = rounds
    .filter(round =>
      round.course_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (teeFilter === '' || round.tees_played === teeFilter) &&
      (selectedCourse === '' || round.course_name === selectedCourse)
    );

  const sortedRounds = [...filteredRounds].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome to Gopher 🏌️‍♂️</h1>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate('/add-round')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Round
        </button>
      </div>
      <div className="mb-6">
        <p className="text-xl font-medium">Your Handicap:</p>
        <p className="text-4xl font-bold text-green-600">
          {calculateHandicap(rounds) ?? 'N/A'}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Round Stats</h3>
        <ul className="list-disc list-inside text-gray-700">
          <li>Total Rounds: {rounds.length}</li>
          <li>Best Score: {Math.min(...rounds.map(r => r.final_score || Infinity))}</li>
          <li>Average Score: {
            rounds.length > 0
              ? (rounds.reduce((sum, r) => sum + (r.final_score || 0), 0) / rounds.length).toFixed(1)
              : 'N/A'
          }</li>
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-2">All Rounds</h2>
        {loading ? (
          <p className="text-gray-500">Loading rounds...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <input
                type="text"
                placeholder="Search by course name"
                className="border px-3 py-2 rounded w-full sm:w-1/2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="border px-3 py-2 rounded w-full sm:w-1/4"
                value={teeFilter}
                onChange={(e) => setTeeFilter(e.target.value)}
              >
                <option value="">All Tees</option>
                {[...new Set(rounds.map(r => r.tees_played))].map(tee => (
                  <option key={tee} value={tee}>{tee}</option>
                ))}
              </select>
              <select
                className="border px-3 py-2 rounded w-full sm:w-1/4"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">All Courses</option>
                {[...new Set(rounds.map(r => r.course_name))].map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-2 border-b">Edit</th>
                  <th className="py-2 px-2 border-b">Delete</th>
                  <th className="py-2 px-4 border-b cursor-pointer" onClick={() => requestSort('date')}>
                    Date {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                  </th>
                  <th className="py-2 px-4 border-b cursor-pointer" onClick={() => requestSort('course_name')}>
                    Course {sortConfig.key === 'course_name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                  </th>
                  <th className="py-2 px-4 border-b cursor-pointer" onClick={() => requestSort('final_score')}>
                    Score {sortConfig.key === 'final_score' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRounds.map((round, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="py-2 px-2 border-b">
                      <Link to={`/edit-round/${round.id}`} className="text-blue-600 hover:text-blue-800" title="Edit Round">
                        ✏️
                      </Link>
                    </td>
                    <td className="py-2 px-2 border-b">
                      <button
                        onClick={() => handleDelete(round.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Round"
                        aria-label={`Delete round on ${new Date(round.date).toLocaleDateString()}`}
                      >
                        🗑️
                      </button>
                    </td>
                    <td className="py-2 px-4 border-b">{new Date(round.date).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b">
                      <Link to={`/round/${round.id}`} className="text-blue-600 underline hover:text-blue-800">
                        {round.course_name}
                      </Link>
                    </td>
                    <td className="py-2 px-4 border-b">{round.final_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
      <ScoreTrendChart rounds={filteredRounds} />
    </div>
  );
};

export default Dashboard;