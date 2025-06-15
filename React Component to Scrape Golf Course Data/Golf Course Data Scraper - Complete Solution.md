# Golf Course Data Scraper - Complete Solution

## Overview

This project provides a complete solution for scraping golf course data (course name, tee name, slope rating, and course rating) from golf course websites. It consists of a Python Flask backend for web scraping and a React frontend component for user interaction.

## Architecture

### Backend (Flask)
- **Framework**: Flask with CORS support
- **Scraping Engine**: BeautifulSoup + Requests
- **API Endpoint**: `/api/scrape-golf-course`
- **Features**: 
  - Multi-strategy scraping (tables, structured elements, text patterns)
  - Automatic fallback mechanisms
  - Duplicate data prevention
  - Error handling and validation

### Frontend (React)
- **Framework**: React with Vite
- **UI Library**: shadcn/ui components with Tailwind CSS
- **Features**:
  - Clean, responsive interface
  - Real-time scraping with loading states
  - Data visualization in cards
  - JSON download functionality
  - Error handling and user feedback

## Installation & Setup

### Backend Setup
```bash
cd golf_scraper
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

### Frontend Setup
```bash
cd golf-course-scraper-ui
pnpm install
pnpm run dev --host
```

## API Documentation

### POST /api/scrape-golf-course
Scrapes golf course data from a given domain.

**Request Body:**
```json
{
  "domain": "newportnational.com"
}
```

**Response:**
```json
{
  "course_name": "Golf Courses | Newport, RI | Newport National Golf Club",
  "error": null,
  "tees": [
    {
      "tee_name": "Black",
      "slope": 139,
      "rating": 74.1
    },
    {
      "tee_name": "Gold", 
      "slope": 132,
      "rating": 71.6
    },
    {
      "tee_name": "White",
      "slope": 127,
      "rating": 68.3
    },
    {
      "tee_name": "Red",
      "slope": 123,
      "rating": 69.5
    }
  ]
}
```

## React Component Usage

### Basic Usage
```jsx
import GolfCourseScraper from './components/GolfCourseScraper.jsx'

function App() {
  return (
    <div>
      <GolfCourseScraper />
    </div>
  )
}
```

### With Custom API URL
```jsx
<GolfCourseScraper apiUrl="https://your-backend-url.com" />
```

## Scraping Strategy

The scraper uses a multi-layered approach:

1. **Dedicated Pages**: Searches for common golf course data pages like `/ratings/`, `/scorecard/`, `/course-info/`
2. **Link Discovery**: Finds relevant links containing keywords like "slope", "rating", "scorecard"
3. **Data Extraction**: Uses multiple methods:
   - HTML table parsing
   - Structured element extraction
   - Regex pattern matching on text

## Supported Data Formats

The scraper can handle various website structures:
- HTML tables with slope/rating data
- Structured divs and lists
- Text-based data with patterns like "Black Tees: 74.1/139"

## Testing Results

✅ **Successfully tested with Newport National Golf Club**
- Domain: newportnational.com
- Data extracted: 4 tees (Black, Gold, White, Red)
- All slope and rating values correctly identified
- No duplicate data issues

## File Structure

```
golf_scraper/
├── src/
│   ├── golf_scraper.py      # Main scraping logic
│   ├── routes/
│   │   └── scraper.py       # Flask API routes
│   └── main.py              # Flask application entry point
└── requirements.txt

golf-course-scraper-ui/
├── src/
│   ├── components/
│   │   └── GolfCourseScraper.jsx  # Main React component
│   └── App.jsx              # Application wrapper
└── package.json
```

## Key Features

### Backend Features
- **Robust Scraping**: Multiple extraction strategies with fallbacks
- **Error Handling**: Comprehensive error handling and validation
- **CORS Support**: Allows cross-origin requests from frontend
- **Deduplication**: Prevents duplicate tee data
- **Flexible Input**: Accepts domains with or without protocol

### Frontend Features
- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Visual feedback during scraping operations
- **Error Display**: Clear error messages for failed requests
- **Data Export**: Download scraped data as JSON
- **Professional UI**: Clean, modern interface using shadcn/ui

## Limitations & Considerations

1. **Website Structure Dependency**: Success depends on how golf courses structure their data
2. **Rate Limiting**: No built-in rate limiting (should be added for production use)
3. **JavaScript Rendering**: Currently doesn't handle JavaScript-rendered content (would need Selenium for that)
4. **Legal Compliance**: Users should ensure compliance with website terms of service

## Future Enhancements

1. **Selenium Integration**: Handle JavaScript-rendered content
2. **Caching**: Add Redis caching for frequently requested courses
3. **Batch Processing**: Support multiple domains in one request
4. **Data Validation**: Enhanced validation of extracted slope/rating values
5. **Database Storage**: Store scraped data for historical tracking

## Deployment

### Backend Deployment
The Flask backend can be deployed using the provided deployment tools or any WSGI server.

### Frontend Deployment
The React frontend can be built and deployed as a static site:
```bash
pnpm run build
```

## Support

For issues or questions, refer to the scraping strategy documentation and test results included in this package.

