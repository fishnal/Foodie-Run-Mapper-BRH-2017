import json
import os
from time import sleep

import tornado.httpserver
import tornado.ioloop
import tornado.web

class ApiHandler(tornado.web.RequestHandler):
    def get(self):
        url_params={
            "lat_start" : self.get_argument("lat_start", None, True),
            "long_start" : self.get_argument("long_start", None, True),
            "lat_end" : self.get_argument("lat_end", None, True),
            "long_end" : self.get_argument("long_end", None, True),
            "price_levels" : self.get_argument("price_levels", None, True),
            "rating" : self.get_argument("rating", None, True),
            "num_stops" : self.get_argument("num_stops", None, True),
        }

        '''
        request
        '''
        sleep(2)

        self.write(json.dumps(url_params))

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('public/index.html')

class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
        (r"/", MainHandler),
        #(r"/api/(([^&]+&)*([^&]+))", ApiHandler),
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