#!/usr/bin/env python3
"""
Netflix Clone Backend API Testing Suite
Tests all backend endpoints including health, movies, auth, and watchlist functionality
"""

import requests
import json
import sys
import time
from typing import Dict, Any, Optional

# Backend URL from frontend .env
BACKEND_URL = "https://trailer-hub-890.preview.emergentagent.com/api"

class NetflixAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.auth_token = None
        self.test_user_data = {
            "name": "John Netflix",
            "email": "john.netflix@example.com", 
            "password": "netflix123"
        }
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    
    def log_result(self, test_name: str, success: bool, message: str = "", response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        
        if success:
            self.results["passed"] += 1
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {message}")
        print()
    
    def make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}{endpoint}"
        headers = kwargs.get('headers', {})
        
        if self.auth_token:
            headers['Authorization'] = f'Bearer {self.auth_token}'
        
        kwargs['headers'] = headers
        kwargs['timeout'] = 30
        
        return self.session.request(method, url, **kwargs)
    
    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = self.make_request('GET', '/health')
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy':
                    self.log_result("Health Check", True, f"Status: {data.get('status')}")
                else:
                    self.log_result("Health Check", False, f"Unexpected status: {data}")
            else:
                self.log_result("Health Check", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Health Check", False, f"Exception: {str(e)}")
    
    def test_movies_featured(self):
        """Test featured movie endpoint"""
        try:
            response = self.make_request('GET', '/movies/featured')
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'title', 'overview', 'poster_path', 'backdrop_path']
                
                if all(field in data for field in required_fields):
                    # Check if TMDB URLs are properly formatted
                    poster_valid = data.get('poster_path', '').startswith('https://image.tmdb.org')
                    backdrop_valid = data.get('backdrop_path', '').startswith('https://image.tmdb.org')
                    
                    if poster_valid and backdrop_valid:
                        self.log_result("Featured Movie", True, f"Movie: {data.get('title')}")
                    else:
                        self.log_result("Featured Movie", False, "Invalid TMDB image URLs")
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Featured Movie", False, f"Missing fields: {missing}")
            else:
                self.log_result("Featured Movie", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Featured Movie", False, f"Exception: {str(e)}")
    
    def test_movies_popular(self):
        """Test popular movies endpoint"""
        try:
            response = self.make_request('GET', '/movies/popular')
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list) and len(data) > 0:
                    movie = data[0]
                    required_fields = ['id', 'title', 'overview', 'poster_path', 'backdrop_path']
                    
                    if all(field in movie for field in required_fields):
                        # Check TMDB integration
                        poster_valid = movie.get('poster_path', '').startswith('https://image.tmdb.org')
                        backdrop_valid = movie.get('backdrop_path', '').startswith('https://image.tmdb.org')
                        
                        if poster_valid and backdrop_valid:
                            self.log_result("Popular Movies", True, f"Found {len(data)} movies")
                        else:
                            self.log_result("Popular Movies", False, "Invalid TMDB image URLs")
                    else:
                        missing = [f for f in required_fields if f not in movie]
                        self.log_result("Popular Movies", False, f"Missing fields: {missing}")
                else:
                    self.log_result("Popular Movies", False, "No movies returned or invalid format")
            else:
                self.log_result("Popular Movies", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Popular Movies", False, f"Exception: {str(e)}")
    
    def test_movies_trending(self):
        """Test trending content endpoint"""
        try:
            response = self.make_request('GET', '/movies/trending')
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list) and len(data) > 0:
                    content = data[0]
                    required_fields = ['id', 'title', 'overview', 'media_type']
                    
                    if all(field in content for field in required_fields):
                        self.log_result("Trending Content", True, f"Found {len(data)} trending items")
                    else:
                        missing = [f for f in required_fields if f not in content]
                        self.log_result("Trending Content", False, f"Missing fields: {missing}")
                else:
                    self.log_result("Trending Content", False, "No trending content returned")
            else:
                self.log_result("Trending Content", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Trending Content", False, f"Exception: {str(e)}")
    
    def test_movies_by_genre(self):
        """Test movies by genre endpoint (Action = 28)"""
        try:
            response = self.make_request('GET', '/movies/genre/28')
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list) and len(data) > 0:
                    movie = data[0]
                    if 'id' in movie and 'title' in movie:
                        self.log_result("Movies by Genre", True, f"Found {len(data)} action movies")
                    else:
                        self.log_result("Movies by Genre", False, "Invalid movie data structure")
                else:
                    self.log_result("Movies by Genre", False, "No movies returned for genre")
            else:
                self.log_result("Movies by Genre", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Movies by Genre", False, f"Exception: {str(e)}")
    
    def test_movies_search(self):
        """Test movie search endpoint"""
        try:
            response = self.make_request('GET', '/movies/search', params={'q': 'avengers'})
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) > 0:
                        movie = data[0]
                        if 'id' in movie and 'title' in movie:
                            # Check if search results contain "avengers" related content
                            titles = [m.get('title', '').lower() for m in data[:3]]
                            has_avengers = any('avengers' in title for title in titles)
                            
                            if has_avengers:
                                self.log_result("Movie Search", True, f"Found {len(data)} search results")
                            else:
                                self.log_result("Movie Search", True, f"Search working, found {len(data)} results")
                        else:
                            self.log_result("Movie Search", False, "Invalid search result structure")
                    else:
                        self.log_result("Movie Search", True, "Search working but no results for 'avengers'")
                else:
                    self.log_result("Movie Search", False, "Invalid search response format")
            else:
                self.log_result("Movie Search", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Movie Search", False, f"Exception: {str(e)}")
    
    def test_user_registration(self):
        """Test user registration"""
        try:
            response = self.make_request('POST', '/auth/register', json=self.test_user_data)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'access_token' in data and 'user' in data:
                    self.auth_token = data['access_token']
                    user = data['user']
                    
                    if user.get('email') == self.test_user_data['email']:
                        self.log_result("User Registration", True, f"User created: {user.get('name')}")
                    else:
                        self.log_result("User Registration", False, "User data mismatch")
                else:
                    self.log_result("User Registration", False, "Missing access_token or user in response")
            elif response.status_code == 400:
                # User might already exist, try login instead
                self.log_result("User Registration", True, "User already exists (expected)")
                self.test_user_login()
            else:
                self.log_result("User Registration", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("User Registration", False, f"Exception: {str(e)}")
    
    def test_user_login(self):
        """Test user login"""
        try:
            login_data = {
                "email": self.test_user_data["email"],
                "password": self.test_user_data["password"]
            }
            response = self.make_request('POST', '/auth/login', json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'access_token' in data and 'user' in data:
                    self.auth_token = data['access_token']
                    self.log_result("User Login", True, f"Login successful")
                else:
                    self.log_result("User Login", False, "Missing access_token or user in response")
            else:
                self.log_result("User Login", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("User Login", False, f"Exception: {str(e)}")
    
    def test_get_user_profile(self):
        """Test getting user profile with authentication"""
        if not self.auth_token:
            self.log_result("Get User Profile", False, "No auth token available")
            return
        
        try:
            response = self.make_request('GET', '/auth/me')
            
            if response.status_code == 200:
                data = response.json()
                
                if 'id' in data and 'email' in data:
                    self.log_result("Get User Profile", True, f"Profile retrieved: {data.get('name')}")
                else:
                    self.log_result("Get User Profile", False, "Invalid profile data structure")
            else:
                self.log_result("Get User Profile", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Get User Profile", False, f"Exception: {str(e)}")
    
    def test_add_to_watchlist(self):
        """Test adding movie to watchlist"""
        if not self.auth_token:
            self.log_result("Add to Watchlist", False, "No auth token available")
            return
        
        try:
            # Use a popular movie ID (The Avengers)
            movie_id = 24428
            response = self.make_request('POST', f'/watchlist/{movie_id}')
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data:
                    self.log_result("Add to Watchlist", True, data['message'])
                else:
                    self.log_result("Add to Watchlist", False, "Invalid response format")
            elif response.status_code == 400:
                # Movie might already be in watchlist
                self.log_result("Add to Watchlist", True, "Movie already in watchlist (expected)")
            else:
                self.log_result("Add to Watchlist", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Add to Watchlist", False, f"Exception: {str(e)}")
    
    def test_get_watchlist(self):
        """Test getting user watchlist"""
        if not self.auth_token:
            self.log_result("Get Watchlist", False, "No auth token available")
            return
        
        try:
            response = self.make_request('GET', '/watchlist/')
            
            if response.status_code == 200:
                data = response.json()
                
                if 'watchlist' in data and 'count' in data:
                    watchlist = data['watchlist']
                    count = data['count']
                    
                    if isinstance(watchlist, list):
                        self.log_result("Get Watchlist", True, f"Watchlist retrieved with {count} movies")
                    else:
                        self.log_result("Get Watchlist", False, "Invalid watchlist format")
                else:
                    self.log_result("Get Watchlist", False, "Missing watchlist or count in response")
            else:
                self.log_result("Get Watchlist", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Get Watchlist", False, f"Exception: {str(e)}")
    
    def test_remove_from_watchlist(self):
        """Test removing movie from watchlist"""
        if not self.auth_token:
            self.log_result("Remove from Watchlist", False, "No auth token available")
            return
        
        try:
            # Use the same movie ID we added
            movie_id = 24428
            response = self.make_request('DELETE', f'/watchlist/{movie_id}')
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data:
                    self.log_result("Remove from Watchlist", True, data['message'])
                else:
                    self.log_result("Remove from Watchlist", False, "Invalid response format")
            elif response.status_code == 404:
                self.log_result("Remove from Watchlist", True, "Movie not in watchlist (expected)")
            else:
                self.log_result("Remove from Watchlist", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Remove from Watchlist", False, f"Exception: {str(e)}")
    
    def test_invalid_auth(self):
        """Test invalid authentication scenarios"""
        try:
            # Save current token
            original_token = self.auth_token
            
            # Test with invalid token
            self.auth_token = "invalid_token_123"
            response = self.make_request('GET', '/auth/me')
            
            if response.status_code == 401:
                self.log_result("Invalid Auth Test", True, "Properly rejected invalid token")
            else:
                self.log_result("Invalid Auth Test", False, f"Expected 401, got {response.status_code}")
            
            # Restore original token
            self.auth_token = original_token
            
        except Exception as e:
            self.log_result("Invalid Auth Test", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🎬 Netflix Clone Backend API Testing Suite")
        print("=" * 50)
        print(f"Testing backend at: {self.base_url}")
        print()
        
        # Health and basic functionality
        self.test_health_check()
        
        # Movies API tests
        self.test_movies_featured()
        self.test_movies_popular()
        self.test_movies_trending()
        self.test_movies_by_genre()
        self.test_movies_search()
        
        # Authentication flow
        self.test_user_registration()
        if not self.auth_token:
            self.test_user_login()
        
        # Protected endpoints
        self.test_get_user_profile()
        
        # Watchlist functionality
        self.test_add_to_watchlist()
        self.test_get_watchlist()
        self.test_remove_from_watchlist()
        
        # Error handling
        self.test_invalid_auth()
        
        # Summary
        print("=" * 50)
        print("🎯 TEST SUMMARY")
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📊 Success Rate: {(self.results['passed'] / (self.results['passed'] + self.results['failed']) * 100):.1f}%")
        
        if self.results['errors']:
            print("\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        return self.results['failed'] == 0

if __name__ == "__main__":
    tester = NetflixAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)