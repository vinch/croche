var fs = require('fs');
var http = require('http');
var path = require('path');
var url = require('url');

var crypto = require('crypto');
var im = require('imagemagick');
var mime = require('mime');

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

http.createServer(function(request, response) {
  var pu = url.parse(request.url, true);
  
  if (pu.pathname === '/favicon.ico') {
    response.writeHead(200, {'Content-Type': 'image/x-icon'});
    response.end();
    return;
  }
  
  if (pu.pathname === '/resize') {
    
    if (!pu.query.url) {
      throw new HttpException(request, response, 'Please specify the URL of the image you want to resize.');
    }

    var srcPath = pu.query.url;
    var width = (pu.query.width) ? pu.query.width : 150;
    var height = (pu.query.height) ? pu.query.height : 150;

    var mimeType = mime.lookup(srcPath);
    var dstPath = 'cache/' + crypto.createHash('md5').update(width+height+srcPath).digest('hex');
    
    path.exists(dstPath, function (exists) {
      
      if (!exists) {
        im.crop({
          srcPath: srcPath,
          dstPath: dstPath,
          width: width,
          height: height
        },
        function(err, stdout, stderr) {
          if (err) throw new HttpException(request, response, err.message);
          
          fs.readFile(dstPath, function(err, data) {
            if (err) throw new HttpException(request, response, err.message);
        
            response.writeHead(200, {'Content-Type': mimeType});  
            response.write(data, 'binary');
            response.end();
          });
        });
      }
      else {
        // TODO: clean duplicate code here
        fs.readFile(dstPath, function(err, data) {
          if (err) throw new HttpException(request, response, err.message);
        
          response.writeHead(200, {'Content-Type': mimeType});  
          response.write(data, 'binary');
          response.end();
        });
      }
      
    });    
  }
  else {
    throw new HttpException(request, response, 'Page not found.', '404');
  }
  
}).listen(3333);