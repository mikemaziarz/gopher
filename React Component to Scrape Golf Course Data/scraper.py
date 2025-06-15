from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from src.golf_scraper import GolfCourseScraper

scraper_bp = Blueprint('scraper', __name__)

@scraper_bp.route('/scrape-golf-course', methods=['POST'])
@cross_origin()
def scrape_golf_course():
    """
    Endpoint to scrape golf course data from a given domain
    """
    try:
        data = request.get_json()
        
        if not data or 'domain' not in data:
            return jsonify({
                'error': 'Domain is required'
            }), 400
            
        domain = data['domain'].strip()
        
        if not domain:
            return jsonify({
                'error': 'Domain cannot be empty'
            }), 400
            
        # Initialize scraper and get data
        scraper = GolfCourseScraper()
        result = scraper.scrape_golf_course_data(domain)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': f'An error occurred: {str(e)}'
        }), 500

@scraper_bp.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        'status': 'healthy',
        'service': 'golf-course-scraper'
    })

