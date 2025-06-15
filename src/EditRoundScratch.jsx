import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import RoundForm from './RoundForm';

function EditRoundScratch() {
  const { roundId } = useParams();
  const navigate = useNavigate();
  const [roundData, setRoundData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRound() {
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('id', roundId)
        .single();

      if (error) {
        console.error('Error fetching round:', error);
        setError(error);
      } else {
        setRoundData(data);
      }
      setLoading(false);
    }

    if (roundId) {
      fetchRound();
    }
  }, [roundId]);

  async function handleUpdate(updatedValues) {
    const { error } = await supabase
      .from('rounds')
      .update(updatedValues)
      .eq('id', roundId);

    if (error) {
      console.error('Error updating round:', error);
      setError(error);
    } else {
      navigate(`/rounds/${roundId}`);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!roundData) return <p>No round data found.</p>;

  return (
    <RoundForm
      key={roundId}
      mode="edit"
      initialValues={roundData}
      availableTees={[]} // optionally populate
      courseNames={[]}   // optionally populate
      onSubmit={handleUpdate}
    />
  );
}

export default EditRoundScratch;