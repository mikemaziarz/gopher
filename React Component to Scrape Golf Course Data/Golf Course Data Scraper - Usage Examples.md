# Golf Course Data Scraper - Usage Examples

## Example 1: Basic React Component Integration

```jsx
import React from 'react'
import GolfCourseScraper from './components/GolfCourseScraper.jsx'

function MyGolfApp() {
  return (
    <div className="container mx-auto p-4">
      <h1>My Golf Course Database</h1>
      <GolfCourseScraper />
    </div>
  )
}

export default MyGolfApp
```

## Example 2: Custom Styling and API URL

```jsx
import React from 'react'
import GolfCourseScraper from './components/GolfCourseScraper.jsx'

function CustomGolfScraper() {
  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-6xl mx-auto py-8">
        <GolfCourseScraper 
          apiUrl="https://my-backend.herokuapp.com"
        />
      </div>
    </div>
  )
}
```

## Example 3: Integrating with Supabase

```jsx
import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import GolfCourseScraper from './components/GolfCourseScraper.jsx'

const supabase = createClient('your-url', 'your-key')

function GolfCourseManager() {
  const [savedCourses, setSavedCourses] = useState([])

  const handleDataScraped = async (courseData) => {
    // Save to Supabase
    const { data, error } = await supabase
      .from('golf_courses')
      .insert([
        {
          name: courseData.course_name,
          domain: courseData.domain,
          tees: courseData.tees,
          scraped_at: new Date().toISOString()
        }
      ])

    if (!error) {
      setSavedCourses([...savedCourses, data[0]])
    }
  }

  return (
    <div>
      <GolfCourseScraper onDataScraped={handleDataScraped} />
      
      <div className="mt-8">
        <h2>Saved Courses</h2>
        {savedCourses.map(course => (
          <div key={course.id} className="border p-4 rounded">
            <h3>{course.name}</h3>
            <p>{course.tees.length} tees found</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Example 4: Direct API Usage (without React component)

```javascript
// Function to scrape golf course data
async function scrapeGolfCourse(domain) {
  try {
    const response = await fetch('http://localhost:5000/api/scrape-golf-course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to scrape')
    }

    return data
  } catch (error) {
    console.error('Scraping error:', error)
    throw error
  }
}

// Usage
scrapeGolfCourse('newportnational.com')
  .then(data => {
    console.log('Course:', data.course_name)
    console.log('Tees:', data.tees)
  })
  .catch(error => {
    console.error('Error:', error)
  })
```

## Example 5: Batch Processing Multiple Courses

```javascript
async function scrapeMultipleCourses(domains) {
  const results = []
  
  for (const domain of domains) {
    try {
      console.log(`Scraping ${domain}...`)
      const data = await scrapeGolfCourse(domain)
      results.push({ domain, success: true, data })
      
      // Add delay to be respectful to servers
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      results.push({ domain, success: false, error: error.message })
    }
  }
  
  return results
}

// Usage
const golfCourses = [
  'newportnational.com',
  'pebblebeach.com',
  'augustanational.com'
]

scrapeMultipleCourses(golfCourses)
  .then(results => {
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    
    console.log(`Successfully scraped ${successful.length} courses`)
    console.log(`Failed to scrape ${failed.length} courses`)
  })
```

## Example 6: Data Processing and Analysis

```javascript
function analyzeGolfCourseData(courseData) {
  const tees = courseData.tees
  
  if (!tees || tees.length === 0) {
    return null
  }

  const analysis = {
    courseName: courseData.course_name,
    teeCount: tees.length,
    averageSlope: tees.reduce((sum, tee) => sum + tee.slope, 0) / tees.length,
    averageRating: tees.reduce((sum, tee) => sum + tee.rating, 0) / tees.length,
    hardestTee: tees.reduce((hardest, tee) => 
      tee.slope > hardest.slope ? tee : hardest
    ),
    easiestTee: tees.reduce((easiest, tee) => 
      tee.slope < easiest.slope ? tee : easiest
    ),
    teeColors: tees.map(tee => tee.tee_name)
  }

  return analysis
}

// Usage with scraped data
scrapeGolfCourse('newportnational.com')
  .then(data => {
    const analysis = analyzeGolfCourseData(data)
    console.log('Course Analysis:', analysis)
  })
```

## Example 7: Error Handling and Retry Logic

```javascript
async function scrapeWithRetry(domain, maxRetries = 3) {
  let lastError
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} for ${domain}`)
      const data = await scrapeGolfCourse(domain)
      return data
    } catch (error) {
      lastError = error
      console.log(`Attempt ${attempt} failed:`, error.message)
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`)
}
```

## Example 8: Integration with Golf Handicap Calculations

```javascript
function calculateHandicap(courseData, playerScores) {
  // Simplified handicap calculation using course data
  const calculations = courseData.tees.map(tee => {
    const coursePar = 72 // Assume standard par
    const netScore = playerScores - coursePar
    const handicapDifferential = (netScore * 113) / tee.slope
    
    return {
      teeName: tee.tee_name,
      courseRating: tee.rating,
      slopeRating: tee.slope,
      handicapDifferential: Math.round(handicapDifferential * 10) / 10
    }
  })
  
  return calculations
}

// Usage
scrapeGolfCourse('newportnational.com')
  .then(courseData => {
    const playerScore = 85
    const handicapCalcs = calculateHandicap(courseData, playerScore)
    console.log('Handicap calculations:', handicapCalcs)
  })
```

These examples demonstrate various ways to integrate and use the golf course scraper in different scenarios, from simple React components to complex data processing workflows.

