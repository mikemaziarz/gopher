import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import { calculateScoreDifferential } from './utils/golf';
import CreatableSelect from 'react-select/creatable';
import RoundForm from './RoundForm';

const AddRound = () => {
  const lastInputTimeRef = useRef(Date.now());
  const [courseNames, setCourseNames] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [formData, setFormData] = useState({
    date: (() => {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    })(),
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
  });

  const [message, setMessage] = useState('');

  const [availableTees, setAvailableTees] = useState([]);
  const [selectedTee, setSelectedTee] = useState(null);
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchCourseNames = async () => {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('course_name');

      if (!error && data) {
        const uniqueNames = [...new Set(data.map(item => item.course_name))];
        setCourseNames(uniqueNames);
        setCourseOptions(uniqueNames.map(name => ({ value: name, label: name })));
      }
    };
    fetchCourseNames();
  }, []);

  // Fetch tees for the selected course whenever course_name changes
  useEffect(() => {
    console.log("🎯 useEffect triggered for course_name:", formData.course_name);
    const fetchTeesForCourse = async () => {
      console.log("🧪 Checking if course_name is truthy...");
      if (!formData.course_name) {
        setAvailableTees([]);
        return;
      }

      const { data, error } = await supabase
        .from('golf_courses')
        .select('tee_name, course_rating, slope_rating')
        .eq('course_name', formData.course_name);

      console.log("Fetched tees from Supabase for course:", formData.course_name, data);

      if (!error && data) {
        setAvailableTees(data);
        console.log("📋 Available tees set:", data);
      } else {
        setAvailableTees([]);
      }
    };

    fetchTeesForCourse();
  }, [formData.course_name]);

  const handleSubmit = async (formDataToSubmit) => {
    setMessage('Submitting...');

    const cleanFormData = { ...formDataToSubmit };

    // Handle empty or invalid date input
    if (!cleanFormData.date || cleanFormData.date.trim() === '') {
      cleanFormData.date = null;
    }

    // Ensure numeric fields are parsed or set to null
    const numericFields = {
      course_rating: 'float',
      slope_rating: 'int',
      final_score: 'int',
      num_holes_played: 'int',
      putts: 'int',
      fairways_hit: 'int',
      greens_in_reg: 'int',
      penalties: 'int',
      par: 'int',
      score_differential: 'float',
    };

    Object.entries(numericFields).forEach(([field, type]) => {
      const value = cleanFormData[field];
      if (value === '' || value === null || value === undefined) {
        cleanFormData[field] = null;
      } else if (type === 'float') {
        const parsed = parseFloat(value);
        cleanFormData[field] = isNaN(parsed) ? null : parsed;
      } else if (type === 'int') {
        const parsed = parseInt(value, 10);
        cleanFormData[field] = isNaN(parsed) ? null : parsed;
      }
    });

    // Ensure score_type is either valid or null, and convert empty/whitespace strings to null
    const validScoreTypes = ['Home', 'Away', 'Championship'];
    const scoreTypeRaw = cleanFormData.score_type;
    const scoreType = typeof scoreTypeRaw === 'string' ? scoreTypeRaw.trim() : '';
    cleanFormData.score_type = validScoreTypes.includes(scoreType) ? scoreType : null;

    // Ensure course_id is null if missing or blank
    if (!cleanFormData.course_id || cleanFormData.course_id.trim() === '') {
      cleanFormData.course_id = null;
    }

    // Ensure course_name is passed correctly even if course is not selected from dropdown
    if (!cleanFormData.course_name || cleanFormData.course_name.trim() === '') {
      cleanFormData.course_name = formData.course_name;
    }

    if (cleanFormData.final_score && cleanFormData.course_rating && cleanFormData.slope_rating && cleanFormData.num_holes_played) {
      console.log("⚙️ Inputs to differential:", {
        finalScore: cleanFormData.final_score,
        courseRating: cleanFormData.course_rating,
        slopeRating: cleanFormData.slope_rating,
        holesPlayed: cleanFormData.num_holes_played
      });
      const differential = calculateScoreDifferential(
        parseFloat(cleanFormData.final_score),
        parseFloat(cleanFormData.course_rating),
        parseInt(cleanFormData.slope_rating, 10),
        parseInt(cleanFormData.num_holes_played, 10)
      );
      console.log("📊 Calculated Differential:", differential);
      cleanFormData.score_differential = differential;
    }

    console.log("🚀 Submitting the following round data to Supabase:", cleanFormData);

    const { error, data } = await supabase.from('rounds').insert([
      {
        ...cleanFormData,
        user_id: 'test-user-1'
      }
    ]).select();

    console.log('Data:', data);
    console.error('Error:', error);

    if (error) {
      console.error(error);
      setMessage('Error submitting round.');
    } else {
      setMessage('');
      setFormData({
        date: '',
        course_name: '',
        course_id: '',
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
      });

      if (data && data.length > 0 && data[0].id) {
        navigate(`/dashboard`);
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <RoundForm
      mode="add"
      initialData={formData}
      courseOptions={courseOptions}
      availableTees={availableTees}
      selectedTee={selectedTee}
      setSelectedTee={setSelectedTee}
      setFormData={setFormData}
      message={message}
      onSubmit={handleSubmit}
    />
  );
};

export default AddRound;