import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const AddCourse = () => {
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [website, setWebsite] = useState('');
  const [tees, setTees] = useState([{ tee_name: '', course_rating: '', slope_rating: '' }]);
  // No changes needed here for AddCourse

  const handleTeeChange = (index, field, value) => {
    const updatedTees = [...tees];
    updatedTees[index][field] = value;
    setTees(updatedTees);
  };

  const addTee = () => {
    setTees([...tees, { tee_name: '', course_rating: '', slope_rating: '' }]);
  };

  const removeTee = (index) => {
    const updatedTees = tees.filter((_, i) => i !== index);
    setTees(updatedTees);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: courseData, error: courseError } = await supabase
      .from('golf_courses')
      .insert(
        tees.map(tee => ({
          course_name: courseName,
          city,
          state,
          website,
          tee_name: tee.tee_name,
          course_rating: parseFloat(tee.course_rating),
          slope_rating: parseInt(tee.slope_rating),
        }))
      );

    if (courseError) {
      console.error('Error adding course:', courseError);
      return;
    }

    navigate('/');
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Add a New Course</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Course Name"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="url"
          placeholder="Website (optional)"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <h2 className="text-lg font-semibold mt-4">Tee Information</h2>
        {tees.map((tee, index) => (
          <div key={index} className="space-y-2 border p-3 rounded">
            <input
              type="text"
              placeholder="Tee Name"
              value={tee.tee_name}
              onChange={(e) => handleTeeChange(index, 'tee_name', e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Course Rating"
              value={tee.course_rating}
              step="0.1"
              onChange={(e) => handleTeeChange(index, 'course_rating', e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Slope Rating"
              value={tee.slope_rating}
              onChange={(e) => handleTeeChange(index, 'slope_rating', e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <button type="button" onClick={() => removeTee(index)} className="text-red-500">Remove Tee</button>
          </div>
        ))}

        <button type="button" onClick={addTee} className="text-blue-500">+ Add Another Tee</button>

        <button type="submit" className="block w-full bg-green-500 text-white py-2 rounded">
          Submit Course
        </button>
      </form>
    </div>
  );
};

export default AddCourse;
