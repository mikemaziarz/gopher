import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'Missing course URL' }), {
        status: 400,
      });
    }

    // Simulated scraped data – replace this with real scraping logic later
    const scrapedData = {
      course_name: 'Scraped Course',
      city: 'Sampletown',
      state: 'MA',
      website: url,
      tees: [
        { tee_name: 'Blue', course_rating: 71.2, slope_rating: 129 },
        { tee_name: 'White', course_rating: 69.1, slope_rating: 124 },
        { tee_name: 'Red', course_rating: 66.3, slope_rating: 119 },
      ],
    };

    return new Response(JSON.stringify(scrapedData), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Error scraping course:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
});