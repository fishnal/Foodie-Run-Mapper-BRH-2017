import json
import os
from math import sin, cos, sqrt, atan2, radians

import requests
import tornado.httpserver
import tornado.ioloop
import tornado.web

# This client code can run on Python 2.x or 3.x.  Your imports can be
# simpler if you only need one of those.
try:
    # For Python 3.0 and later
    from urllib.error import HTTPError
    from urllib.parse import quote
    from urllib.parse import urlencode
except ImportError:
    # Fall back to Python 2's urllib2 and urllib
    from urllib2 import HTTPError
    from urllib import quote
    from urllib import urlencode

# OAuth credential placeholders that must be filled in by users.
# You can find them on
# https://www.yelp.com/developers/v3/manage_app
CLIENT_ID = "kLhCU7hjwii78yYOxVD89w"
CLIENT_SECRET = "WuCQrfshvNV7LDAOQeSZrfqzrYden8qIBu7nOe84OMBpOJfDzFTC7eZjrzcYaFdl"

# API constants, you shouldn't have to change these.
API_HOST = 'https://api.yelp.com'
SEARCH_PATH = '/v3/businesses/search'
BUSINESS_PATH = '/v3/businesses/'  # Business ID will come after slash.
TOKEN_PATH = '/oauth2/token'
GRANT_TYPE = 'client_credentials'


def obtain_bearer_token(host, path):
    """Given a bearer token, send a GET request to the API.
    Args:
        host (str): The domain host of the API.
        path (str): The path of the API after the domain.
        url_params (dict): An optional set of query parameters in the request.
    Returns:
        str: OAuth bearer token, obtained using client_id and client_secret.
    Raises:
        HTTPError: An error occurs from the HTTP request.
    """
    url = '{0}{1}'.format(host, quote(path.encode('utf8')))
    assert CLIENT_ID, "Please supply your client_id."
    assert CLIENT_SECRET, "Please supply your client_secret."
    data = urlencode({
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': GRANT_TYPE,
    })
    headers = {
        'content-type': 'application/x-www-form-urlencoded',
    }
    response = requests.request('POST', url, data=data, headers=headers)
    bearer_token = response.json()['access_token']
    return bearer_token


def request(host, path, bearer_token, url_params=None):
    """Given a bearer token, send a GET request to the API.
    Args:
        host (str): The domain host of the API.
        path (str): The path of the API after the domain.
        bearer_token (str): OAuth bearer token, obtained using client_id and client_secret.
        url_params (dict): An optional set of query parameters in the request.
    Returns:
        dict: The JSON response from the request.
    Raises:
        HTTPError: An error occurs from the HTTP request.
    """
    url_params = url_params or {}
    url = '{0}{1}'.format(host, quote(path.encode('utf8')))
    headers = {
        'Authorization': 'Bearer %s' % bearer_token,
    }

    print(u'Querying {0} ...'.format(url))

    response = requests.request('GET', url, headers=headers, params=url_params)

    return response.json()


# http://www.movable-type.co.uk/scripts/latlong.html
# https://stackoverflow.com/questions/19412462/getting-distance-between-two-points-based-on-latitude-longitude
def convert_to_meters(lat1, long1, lat2, long2):
    r = 6373e3;
    lat1 = radians(lat1)
    long1 = radians(long1)
    lat2 = radians(lat2)
    long2 = radians(long2)

    dlat = lat2 - lat1
    dlon = long2 - long1

    a = sin(dlat / 2) ** 2 + cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distance = r * c

    print(distance)

    return distance


def query_api(lat_start, long_start, lat_end, long_end, price_levels):
    lat_mid = (lat_start + lat_end) / 2
    long_mid = (long_start + long_end) / 2
    delta_lat = int(convert_to_meters(lat_start, 0, lat_end, 0))
    delta_long = int(convert_to_meters(0, long_start, 0, long_end))
    radius = delta_lat if delta_lat > delta_long else delta_long

    # print(lat_mid)
    # print(long_mid)
    # print(radius)
    # print(price_levels)

    bearer_token = obtain_bearer_token(API_HOST, TOKEN_PATH)
    url_params = {
        'term': 'restaurant',
        'latitude': lat_mid,
        'longitude': long_mid,
        'radius': radius,
        'price': price_levels,
        'limit': 50,
        'sort_by': 'rating'
    }

    return request(API_HOST, SEARCH_PATH, bearer_token, url_params=url_params)


class ApiHandler(tornado.web.RequestHandler):
    def get(self):

        lat_start= self.get_argument("lat_start", None, True)
        long_start= self.get_argument("long_start", None, True)
        lat_end= self.get_argument("lat_end", None, True)
        long_end= self.get_argument("long_end", None, True)
        price_levels= self.get_argument("price_levels", None, True)
        rating= self.get_argument("rating", None, True)
        num_stops= self.get_argument("num_stops", None, True)
        print(price_levels)
        response = query_api(float(lat_start), float(long_start), float(lat_end), float(long_end), price_levels)

        self.write(json.dumps(response))


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('public/index.html')


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/", MainHandler),
            # (r"/api/(([^&]+&)*([^&]+))", ApiHandler),
            (r"/api?.*", ApiHandler),
            (r'/public/(.*)', tornado.web.StaticFileHandler, {'path': 'public/'}),
        ]
        settings = {
            "debug": True,
            "static_path": os.path.join(os.path.dirname(__file__), "public")
        }
        tornado.web.Application.__init__(self, handlers, **settings)


def main():
    app = Application()
    http_server = tornado.httpserver.HTTPServer(app)
    port = int(os.environ.get("PORT", 8000))
    http_server.listen(port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
