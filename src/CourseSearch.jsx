import React, { useState } from 'react';
import { supabase } from './supabaseClient';

function CourseSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    setNoResults(false);
    setResults([]);

    if (value.length < 2) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('golf_courses')
      .select('id, course_name, city, state, website, tee_name, course_rating, slope_rating')
      .ilike('course_name', `%${value}%`)
      .limit(50);

    if (error) {
      console.error('Error fetching courses:', error);
    } else if (data.length === 0) {
      setNoResults(true);
    } else {
      const courseMap = new Map();

      data.forEach((item) => {
        const key = `${item.course_name}-${item.city}-${item.state}`;
        if (!courseMap.has(key)) {
          courseMap.set(key, {
            id: item.id,
            course_name: item.course_name,
            city: item.city,
            state: item.state,
            website: item.website,
            tees: []
          });
        }
        courseMap.get(key).tees.push({
          tee_name: item.tee_name,
          course_rating: item.course_rating,
          slope_rating: item.slope_rating
        });
      });

      setResults(Array.from(courseMap.values()));
    }

    setIsLoading(false);
  };

  const handleSelect = (course) => {
    setQuery(`${course.course_name}`);
    setResults([]);
    onSelect(course);
  };

  const handleScrape = async () => {
    try {
      const response = await fetch('https://qfxvsdjjptykleogsdpw.supabase.co/functions/v1/scrapeCourse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ url: customUrl })
      });

      if (!response.ok) throw new Error('Scrape failed');

      const data = await response.json();
      onSelect(data);
    } catch (error) {
      console.error('Scrape failed:', error);
      alert('Could not retrieve course data from the website.');
    }
  };

  return (
    <div className="relative w-full space-y-2">
      <input
        type="text"
        className="border p-2 w-full"
        placeholder="Search for a course..."
        value={query}
        onChange={handleSearch}
      />
      {isLoading && <div className="text-sm text-gray-500">Searching...</div>}
      {results.length > 0 && (
        <ul className="absolute bg-white border w-full max-h-60 overflow-y-auto z-10">
          {results.map((course) => (
            <li
              key={course.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(course)}
            >
              {course.course_name}, {course.city}, {course.state}
            </li>
          ))}
        </ul>
      )}
      {noResults && (
        <div className="border p-3 mt-2 rounded bg-yellow-50 text-sm">
          <p className="mb-1">Course not found. Enter the course website URL below:</p>
          <input
            type="text"
            className="border p-2 w-full mb-2"
            placeholder="https://examplecourse.com"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
          />
          <button
            onClick={handleScrape}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            disabled={!customUrl}
          >
            Fetch Course Info
          </button>
        </div>
      )}
    </div>
  );
}

export default CourseSearch;