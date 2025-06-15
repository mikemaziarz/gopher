

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';

function RoundDetails() {
  const { id } = useParams();
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRound = async () => {
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching round:', error);
      } else {
        setRound(data);
      }

      setLoading(false);
    };

    fetchRound();
  }, [id]);

  if (loading) return <p>Loading round details...</p>;
  if (!round) return <p>Round not found.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Round Details</h1>
      <ul className="list-disc ml-6">
        <li><strong>Date:</strong> {round.date}</li>
        <li><strong>Course Name:</strong> {round.course_name}</li>
        <li><strong>State:</strong> {round.state}</li>
        <li><strong>Tees Played:</strong> {round.tees_played}</li>
        <li><strong>Course Rating:</strong> {round.course_rating}</li>
        <li><strong>Slope Rating:</strong> {round.slope_rating}</li>
        <li><strong>Final Score:</strong> {round.final_score}</li>
        <li><strong>Playing Partners:</strong> {round.playing_partners}</li>
        <li><strong>Course Notes:</strong> {round.course_notes}</li>
        <li><strong>Website:</strong> <a href={round.course_website} className="text-blue-600 underline">{round.course_website}</a></li>
      </ul>
      <div className="mt-4">
        <Link
          to={`/edit-round/${round.id}`}
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Edit Round
        </Link>
      </div>
    </div>
  );
}

export default RoundDetails;