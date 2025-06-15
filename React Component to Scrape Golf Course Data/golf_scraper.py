import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Optional, Tuple
import time

class GolfCourseScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Common URL patterns to search for golf course data
        self.common_paths = [
            '/ratings/',
            '/scorecard/',
            '/course-info/',
            '/course-details/',
            '/golf-course/',
            '/course/',
            '/tees/',
            '/slope-rating/',
            '/course-rating/'
        ]
        
        # Keywords to search for in content
        self.keywords = ['slope', 'rating', 'scorecard', 'tee', 'course rating']
        
        # Common tee colors
        self.tee_colors = ['black', 'gold', 'blue', 'white', 'red', 'yellow', 'green', 'silver']

    def scrape_golf_course_data(self, domain: str) -> Dict:
        """
        Main method to scrape golf course data from a domain
        """
        try:
            # Ensure domain has protocol
            if not domain.startswith(('http://', 'https://')):
                domain = 'https://' + domain
            
            # Try to find dedicated pages first
            course_data = self._try_dedicated_pages(domain)
            
            if not course_data['tees']:
                # Fallback: search main page and common pages
                course_data = self._search_main_site(domain)
            
            return course_data
            
        except Exception as e:
            return {
                'course_name': '',
                'tees': [],
                'error': str(e)
            }

    def _try_dedicated_pages(self, domain: str) -> Dict:
        """
        Try to find golf course data on dedicated pages
        """
        course_data = {
            'course_name': self._extract_course_name(domain),
            'tees': [],
            'error': None
        }
        
        for path in self.common_paths:
            try:
                url = urljoin(domain, path)
                response = self.session.get(url, timeout=10)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    tees = self._extract_tee_data(soup)
                    
                    if tees:
                        course_data['tees'] = tees
                        return course_data
                        
            except Exception as e:
                continue
                
        return course_data

    def _search_main_site(self, domain: str) -> Dict:
        """
        Search the main site for golf course data
        """
        course_data = {
            'course_name': self._extract_course_name(domain),
            'tees': [],
            'error': None
        }
        
        try:
            # First try the main page
            response = self.session.get(domain, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Look for links containing keywords
                links = self._find_relevant_links(soup, domain)
                
                for link in links:
                    try:
                        link_response = self.session.get(link, timeout=10)
                        if link_response.status_code == 200:
                            link_soup = BeautifulSoup(link_response.content, 'html.parser')
                            tees = self._extract_tee_data(link_soup)
                            
                            if tees:
                                course_data['tees'] = tees
                                return course_data
                                
                    except Exception:
                        continue
                
                # If no links found, try to extract from main page
                tees = self._extract_tee_data(soup)
                if tees:
                    course_data['tees'] = tees
                    
        except Exception as e:
            course_data['error'] = str(e)
            
        return course_data

    def _extract_course_name(self, domain: str) -> str:
        """
        Extract course name from domain or page title
        """
        try:
            response = self.session.get(domain, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                title = soup.find('title')
                if title:
                    # Clean up title
                    title_text = title.get_text().strip()
                    # Remove common suffixes
                    title_text = re.sub(r'\s*-\s*.*$', '', title_text)
                    return title_text
        except Exception:
            pass
            
        # Fallback: extract from domain
        parsed = urlparse(domain)
        domain_name = parsed.netloc.replace('www.', '')
        return domain_name.replace('.com', '').replace('.', ' ').title()

    def _find_relevant_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """
        Find links that might contain golf course data
        """
        links = []
        
        for keyword in self.keywords:
            # Find links with keyword in text or href
            for link in soup.find_all('a', href=True):
                link_text = link.get_text().lower()
                link_href = link['href'].lower()
                
                if keyword in link_text or keyword in link_href:
                    full_url = urljoin(base_url, link['href'])
                    if full_url not in links:
                        links.append(full_url)
                        
        return links[:5]  # Limit to first 5 relevant links

    def _extract_tee_data(self, soup: BeautifulSoup) -> List[Dict]:
        """
        Extract tee data from a BeautifulSoup object
        """
        tees = []
        
        # Method 1: Try to find table with tee data
        tees_from_table = self._extract_from_table(soup)
        if tees_from_table:
            return tees_from_table
            
        # Method 2: Try to find structured divs or lists
        tees_from_structure = self._extract_from_structure(soup)
        if tees_from_structure:
            return tees_from_structure
            
        # Method 3: Try regex patterns on text
        tees_from_text = self._extract_from_text(soup)
        if tees_from_text:
            return tees_from_text
            
        return tees

    def _extract_from_table(self, soup: BeautifulSoup) -> List[Dict]:
        """
        Extract tee data from HTML tables
        """
        tees = []
        seen_tees = set()  # Track seen tee names to avoid duplicates
        
        # Look for tables containing slope/rating data
        tables = soup.find_all('table')
        
        for table in tables:
            table_text = table.get_text().lower()
            if 'slope' in table_text and ('rating' in table_text or 'tee' in table_text):
                rows = table.find_all('tr')
                
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 2:
                        row_text = ' '.join([cell.get_text().strip() for cell in cells])
                        tee_data = self._parse_tee_row(row_text)
                        if tee_data and tee_data['tee_name'] not in seen_tees:
                            tees.append(tee_data)
                            seen_tees.add(tee_data['tee_name'])
                            
        return tees

    def _extract_from_structure(self, soup: BeautifulSoup) -> List[Dict]:
        """
        Extract tee data from structured HTML elements
        """
        tees = []
        
        # Look for divs or other elements containing tee data
        for element in soup.find_all(['div', 'p', 'li']):
            element_text = element.get_text().strip()
            if len(element_text) > 10 and len(element_text) < 200:  # Reasonable length
                tee_data = self._parse_tee_row(element_text)
                if tee_data:
                    tees.append(tee_data)
                    
        return tees

    def _extract_from_text(self, soup: BeautifulSoup) -> List[Dict]:
        """
        Extract tee data using regex patterns on page text
        """
        tees = []
        page_text = soup.get_text()
        
        # Pattern to match tee data: Color Tees: Rating/Slope
        pattern = r'(\w+)\s+(?:tees?|tee):\s*(\d+\.?\d*)[/\s]+(\d+)'
        matches = re.finditer(pattern, page_text, re.IGNORECASE)
        
        for match in matches:
            color = match.group(1).lower()
            if color in self.tee_colors:
                rating = float(match.group(2))
                slope = int(match.group(3))
                
                tees.append({
                    'tee_name': color.title(),
                    'slope': slope,
                    'rating': rating
                })
                
        return tees

    def _parse_tee_row(self, text: str) -> Optional[Dict]:
        """
        Parse a single row of text to extract tee data
        """
        text = text.lower().strip()
        
        # Look for tee color
        tee_name = None
        for color in self.tee_colors:
            if color in text:
                tee_name = color.title()
                break
                
        if not tee_name:
            return None
            
        # Extract numbers (slope and rating)
        numbers = re.findall(r'\d+\.?\d*', text)
        
        if len(numbers) >= 2:
            # Try to determine which is slope and which is rating
            # Slope is typically 100-155, rating is typically 65-80
            nums = [float(n) for n in numbers]
            
            slope = None
            rating = None
            
            for num in nums:
                if 100 <= num <= 155 and slope is None:
                    slope = int(num)
                elif 60 <= num <= 85 and rating is None:
                    rating = num
                    
            if slope and rating:
                return {
                    'tee_name': tee_name,
                    'slope': slope,
                    'rating': rating
                }
                
        return None

