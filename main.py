import os
import tornado.httpserver
import tornado.ioloop
import tornado.web

class testHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('public/index.html')

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('public/index.html')

def main():
    application = tornado.web.Application([
        (r"/", MainHandler),
        (r"/hello", testHandler),
        (r'/public/(.*)', tornado.web.StaticFileHandler, {'path': 'public/'}),
    ])
    http_server = tornado.httpserver.HTTPServer(application)
    port = int(os.environ.get("PORT", 8000))
    http_server.listen(port)
    tornado.ioloop.IOLoop.instance().start()
 
if __name__ == "__main__":
    main()