// RoundForm.jsx
import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { calculateScoreDifferential } from './utils/golf';
import { supabase } from './supabaseClient';

const RoundForm = ({ mode, initialValues = {}, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    course_name: '',
    state: '',
    city: '',
    tees_played: '',
    course_rating: '',
    slope_rating: '',
    final_score: '',
    playing_partners: '',
    course_notes: '',
    website: '',
    num_holes_played: '',
    score_type: '',
    score_differential: '',
    hole_scores: '',
    putts: '',
    fairways_hit: '',
    greens_in_reg: '',
    penalties: '',
    par: '',
    ...initialValues,
  });
  console.log("📋 Initial formData state:", formData);

  useEffect(() => {
    console.log("🧬 initialValues changed:", initialValues);
    console.log("🧬 formData state:", formData);
  }, [initialValues, formData]);

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData(prev => {
        const newFormData = { ...prev, ...initialValues };
        console.log("🔁 Loaded initialValues into formData:", initialValues);
        return newFormData;
      });
    }
  }, [initialValues]);

  const [courseNames, setCourseNames] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [availableTees, setAvailableTees] = useState([]);
  const [selectedTee, setSelectedTee] = useState(formData.tees_played || '');

  useEffect(() => {
    const fetchCourseNames = async () => {
      const { data } = await supabase.from('golf_courses').select('course_name');
      const names = [...new Set(data.map(d => d.course_name))];
      setCourseNames(names);
      setCourseOptions(names.map(name => ({ value: name, label: name })));
    };
    fetchCourseNames();
  }, []);

useEffect(() => {
  const fetchTees = async () => {
    if (!formData.course_name) return;

    const { data, error } = await supabase
      .from('golf_courses')
      .select('tee_name, course_rating, slope_rating, city, state, website')
      .eq('course_name', formData.course_name);

    if (error || !Array.isArray(data) || data.length === 0) {
      console.error('Error fetching tees or no data returned:', error);
      setAvailableTees([]);
      return;
    }

    if (!data || data.length === 0) return;

    setAvailableTees(data);
    console.log("🎯 Tees fetched for course:", formData.course_name, data);
    const firstMatch = data[0];
    if (firstMatch) {
      setFormData(prev => ({
        ...prev,
        city: firstMatch.city || '',
        state: firstMatch.state || '',
        website: firstMatch.website || '',
        tees_played: firstMatch.tee_name || '',
        course_rating: firstMatch.course_rating || '',
        slope_rating: firstMatch.slope_rating || ''
      }));
    }
  };
  fetchTees();
}, [formData.course_name]);

  const handleChange = (e) => {
    console.log("✏️ Field changed:", e.target.name, "=>", e.target.value);
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };


  console.log("🧱 Rendering RoundForm with mode:", mode);

  // Conditional loading block for edit mode and empty initialValues
  if (mode === 'edit' && (!initialValues || Object.keys(initialValues).length === 0)) {
    return <div className="p-4 text-red-500">Loading round data...</div>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const sanitizedFormData = Object.fromEntries(
          Object.entries(formData).map(([key, value]) => {
            if (key === 'date' && (!value || value === '')) {
              return [key, new Date().toISOString().split('T')[0]];
            }
            if (value === '') return [key, null];
            return [key, value];
          })
        );

        // Ensure hole_scores is null if empty
        if (!sanitizedFormData.hole_scores) {
          sanitizedFormData.hole_scores = null;
        }

        console.log("🚀 Submitting sanitized form data:", sanitizedFormData);
        if (typeof onSubmit === 'function') {
          onSubmit(sanitizedFormData);
        } else {
          console.error('❌ onSubmit is not a function:', onSubmit);
        }
      }}
      className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg space-y-6"
    >
      <h2 className="text-2xl font-semibold mb-4">{mode === 'edit' ? 'Edit Round' : 'Add a New Round'}</h2>

      <div className="border-b pb-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Course Info</h3>
      </div>

      <div className="grid grid-cols-[160px_1fr] gap-y-4 gap-x-6">

        <label htmlFor="course_name" className="text-right font-medium text-sm text-gray-700">
          Course Name
        </label>
        <CreatableSelect
          id="course_name"
          isClearable
          options={courseOptions}
          value={formData.course_name ? { value: formData.course_name, label: formData.course_name } : null}
          onChange={opt => setFormData(f => ({ ...f, course_name: opt?.value || '' }))}
          onCreateOption={input => setFormData(f => ({ ...f, course_name: input }))}
          className="w-full"
          styles={{
            control: (base) => ({ ...base, width: '100%' }),
            container: (base) => ({ ...base, width: '100%' }),
            valueContainer: (base) => ({ ...base, width: '100%' })
          }}
        />

        <label htmlFor="website" className="text-right font-medium text-sm text-gray-700">Website</label>
        <input
          id="website"
          type="text"
          name="website"
          value={formData.website ?? ''}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded-md shadow-sm text-sm"
        />

        <label htmlFor="city" className="text-right font-medium text-sm text-gray-700">City</label>
        <input
          id="city"
          type="text"
          name="city"
          value={formData.city ?? ''}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded-md shadow-sm text-sm"
        />

        <label htmlFor="state" className="text-right font-medium text-sm text-gray-700">State</label>
        <input
          id="state"
          type="text"
          name="state"
          value={formData.state ?? ''}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded-md shadow-sm text-sm"
        />

      </div>

      <div className="border-b pb-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Round Setup</h3>
      </div>

      <div className="grid grid-cols-[160px_1fr] gap-y-4 gap-x-6">

        <label htmlFor="date" className="text-right font-medium text-sm text-gray-700">Date</label>
        <input
          id="date"
          type="date"
          name="date"
          value={formData.date !== '' ? formData.date : new Date().toISOString().split('T')[0]}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded-md shadow-sm text-sm"
        />

        {formData.course_name && availableTees.length > 0 && (
          <>
            <label htmlFor="tees_played" className="text-right font-medium text-sm text-gray-700">Tees Played</label>
            <select
              id="tees_played"
              className="w-full border border-gray-300 p-2 rounded-md shadow-sm text-sm"
              value={selectedTee}
              onChange={(e) => {
                const tee = availableTees.find(t => t.tee_name === e.target.value);
                setSelectedTee(e.target.value);
                setFormData(f => ({
                  ...f,
                  tees_played: tee.tee_name,
                  course_rating: tee.course_rating,
                  slope_rating: tee.slope_rating
                }));
              }}
            >
              <option value="">Select a tee</option>
              {availableTees.map((t, idx) => (
                <option key={idx} value={t.tee_name}>{t.tee_name}</option>
              ))}
            </select>
          </>
        )}

        <label htmlFor="course_rating" className="text-right font-medium text-sm text-gray-700">Course Rating</label>
        <input
          id="course_rating"
          type="text"
          name="course_rating"
          value={formData.course_rating ?? ''}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded-md shadow-sm text-sm"
        />

        <label htmlFor="slope_rating" className="text-right font-medium text-sm text-gray-700">Slope Rating</label>
        <input
          id="slope_rating"
          type="text"
          name="slope_rating"
          value={formData.slope_rating ?? ''}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded-md shadow-sm text-sm"
        />

      </div>

      <div className="border-b pb-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Performance</h3>
      </div>

      <h1 className="text-red-600 font-bold">🧪 This is LIVE v3 RoundForm</h1>

      <div className="grid grid-cols-[160px_1fr] gap-y-4 gap-x-6">
        {formData &&
          Object.keys(formData)
            .filter(k => !['course_name', 'tees_played', 'course_rating', 'slope_rating', 'date', 'website', 'id', 'user_id', 'city', 'state'].includes(k))
            .map(key => (
              <React.Fragment key={key}>
                <label htmlFor={key} className="text-right font-medium text-sm text-gray-700">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                </label>
                <input
                  id={key}
                  type="text"
                  name={key}
                  value={formData[key] ?? ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded-md shadow-sm text-sm"
                />
              </React.Fragment>
        ))}
      </div>

      <div>
        <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow">Submit</button>
      </div>
    </form>
  );
};

export default RoundForm;
