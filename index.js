var fs = require('fs');
var http = require('http');
var url = require('url');

var crypto = require('crypto');
var im = require('imagemagick');
var mime = require('mime');

/* LOCAL FUNCTIONS */

var croche = {};
croche.serveFromCache = function(request, response, dstPath, mimeType) {
  fs.readFile(dstPath, function(err, data) {
    if (err) throw new HttpException(request, response, err.message);
        
    response.writeHead(200, {'Content-Type': mimeType});  
    response.write(data, 'binary');
    response.end();
  });
};

/* ERROR HANDLING */

var HttpException = function (request, response, message, code) {
  this.request = request;
  this.response = response;
  this.message = message;
  this.code = code || 500;
}

process.on('uncaughtException', function (exception) {
  console.log('[' + exception.code + '] ' + exception.message);
  exception.response.writeHead(exception.code, {'Content-Type': 'text/plain'});  
  exception.response.end(exception.message);
});

/* SERVER */

http.createServer(function(request, response) {
  var pu = url.parse(request.url, true);
  
  if (pu.pathname === '/favicon.ico') {
    response.writeHead(200, {'Content-Type': 'image/x-icon'});
    response.end();
    return;
  }
  
  if (pu.pathname === '/') {
    
    if (!pu.query.url) {
      throw new HttpException(request, response, 'Please specify the URL of the image you want to resize.');
    }

    var srcPath = pu.query.url;
    var width = pu.query.width || 320;
    var height = pu.query.height || 240;

    var mimeType = mime.lookup(srcPath);
    var dstPath = 'cache/' + crypto.createHash('md5').update(width+'-'+height+'-'+srcPath).digest('hex');
    
    fs.exists(dstPath, function (exists) {
      
      if (!exists) {
        im.crop({
          srcPath: srcPath,
          dstPath: dstPath,
          width: width,
          height: height
        },
        function(err, stdout, stderr) {
          if (err) throw new HttpException(request, response, err.message);
          
          croche.serveFromCache(request, response, dstPath, mimeType);
        });
      }
      else {
        croche.serveFromCache(request, response, dstPath, mimeType);
      }
      
    });    
  }
  else {
    throw new HttpException(request, response, 'Page not found.', '404');
  }
  
}).listen(process.env.PORT || 3333, function() {
  console.log('croche server started and listening on port 3333');
});