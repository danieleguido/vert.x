/*
 * Copyright 2011-2012 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

load('test_utils.js')
load('vertx.js')

var tu = new TestUtils();

var server = new vertx.HttpServer();
var client = new vertx.HttpClient().setPort(8080);
var logger = vertx.getLogger();

// This is just a basic test. Most testing occurs in the Java tests

function testGET() {
  httpMethod(false, "GET", false)
}

function testGetSSL() {
  httpMethod(true, "GET", false)
}

function testPUT() {
  httpMethod(false, "PUT", false)
}

function testPUTSSL() {
  httpMethod(true, "PUT", false)
}

function testPOST() {
  httpMethod(false, "POST", false)
}

function testPOSTSSL() {
  httpMethod(true, "POST", false)
}

function testHEAD() {
  httpMethod(false, "HEAD", false)
}

function testHEADSSL() {
  httpMethod(true, "HEAD", false)
}

function testOPTIONS() {
  httpMethod(false, "OPTIONS", false)
}

function testOPTIONSSSL() {
  httpMethod(true, "OPTIONS", false)
}
function testDELETE() {
  httpMethod(false, "DELETE", false)
}

function testDELETESSL() {
  httpMethod(true, "DELETE", false)
}

function testTRACE() {
  httpMethod(false, "TRACE", false)
}

function testTRACESSL() {
  httpMethod(true, "TRACE", false)
}

function testCONNECT() {
  httpMethod(false, "CONNECT", false)
}

function testCONNECTSSL() {
  httpMethod(true, "CONNECT", false)
}

function testPATCH() {
  httpMethod(false, "PATCH", false)
}

function testPATCHSSL() {
  httpMethod(true, "PATCH", false)
}




function testGETChunked() {
  httpMethod(false, "GET", true)
}

function testGetSSLChunked() {
  httpMethod(true, "GET", true)
}

function testPUTChunked() {
  httpMethod(false, "PUT", true)
}

function testPUTSSLChunked() {
  httpMethod(true, "PUT", true)
}

function testPOSTChunked() {
  httpMethod(false, "POST", true)
}

function testPOSTSSLChunked() {
  httpMethod(true, "POST", true)
}

function testHEADChunked() {
  httpMethod(false, "HEAD", true)
}

function testHEADSSLChunked() {
  httpMethod(true, "HEAD", true)
}

function testOPTIONSChunked() {
  httpMethod(false, "OPTIONS", true)
}

function testOPTIONSSSLChunked() {
  httpMethod(true, "OPTIONS", true)
}

function testDELETEChunked() {
  httpMethod(false, "DELETE", true)
}

function testDELETESSLChunked() {
  httpMethod(true, "DELETE", true)
}

function testTRACEChunked() {
  httpMethod(false, "TRACE", true)
}

function testTRACESSLChunked() {
  httpMethod(true, "TRACE", true)
}

function testCONNECTChunked() {
  httpMethod(false, "CONNECT", true)
}

function testCONNECTSSLChunked() {
  httpMethod(true, "CONNECT", true)
}

function testPATCHChunked() {
  httpMethod(false, "PATCH", true)
}

function testPATCHSSLChunked() {
  httpMethod(true, "PATCH", true)
}


function httpMethod(ssl, method, chunked) {

  // logger.info("In method " + method);

  if (ssl) {
    server.setSSL(true);
    server.setKeyStorePath('./src/tests/keystores/server-keystore.jks');
    server.setKeyStorePassword('wibble');
    server.setTrustStorePath('./src/tests/keystores/server-truststore.jks');
    server.setTrustStorePassword('wibble');
    server.setClientAuthRequired(true);
  }

  var path = "/someurl/blah.html";
  var query = "param1=vparam1&param2=vparam2";
  var uri = (ssl ? "https" : "http") +"://localhost:8080" + path + "?" + query;

  server.requestHandler(function(req) {
    tu.checkContext()
    tu.azzert(uri === req.uri);
    tu.azzert(req.method === method);
    tu.azzert(req.path === path);
    tu.azzert(req.query === query);
    tu.azzert(req.headers()['header1'] === 'vheader1');
    tu.azzert(req.headers()['header2'] === 'vheader2');
    tu.azzert(req.params()['param1'] === 'vparam1');
    tu.azzert(req.params()['param2'] === 'vparam2');
    req.response.putHeader('rheader1', 'vrheader1');
    req.response.putHeader('rheader2', 'vrheader2');
    var body = new vertx.Buffer(0);
    req.dataHandler(function(data) {
      tu.checkContext();
      body.appendBuffer(data);
    });
    req.response.setChunked(chunked);
    req.endHandler(function() {
      tu.checkContext();
      if (!chunked) {
        req.response.putHeader('Content-Length', '' + body.length())
      }
      req.response.writeBuffer(body);
      if (chunked) {
        req.response.putTrailer('trailer1', 'vtrailer1');
        req.response.putTrailer('trailer2', 'vtrailer2');
      }
      req.response.end();
    });
  });
  server.listen(8080);

  if (ssl) {
    client.setSSL(true);
    client.setKeyStorePath('./src/tests/keystores/client-keystore.jks');
    client.setKeyStorePassword('wibble');
    client.setTrustStorePath('./src/tests/keystores/client-truststore.jks');
    client.setTrustStorePassword('wibble');
  }

  var sent_buff = tu.generateRandomBuffer(1000);

  var request = client.request(method, uri, function(resp) {
    tu.checkContext();
    tu.azzert(200 === resp.statusCode);
    tu.azzert('vrheader1' === resp.headers()['rheader1']);
    tu.azzert('vrheader2' === resp.headers()['rheader2']);
    var body = new vertx.Buffer(0);
    resp.dataHandler(function(data) {
      tu.checkContext();
      body.appendBuffer(data);
    });

    resp.endHandler(function() {
      tu.checkContext();
      tu.azzert(tu.buffersEqual(sent_buff, body));
      if (chunked) {
        tu.azzert('vtrailer1' === resp.trailers()['trailer1']);
        tu.azzert('vtrailer2' === resp.trailers()['trailer2']);
      }
      tu.testComplete();
    });
  });

  request.setChunked(chunked);
  request.putHeader('header1', 'vheader1');
  request.putHeader('header2', 'vheader2');
  if (!chunked) {
    request.putHeader('Content-Length', '' + sent_buff.length())
  }

  request.writeBuffer(sent_buff);

  request.end();
}

tu.registerTests(this);
tu.appReady();

function vertxStop() {
  client.close();
  server.close(function() {
    tu.unregisterAll();
    tu.appStopped();
  });
}

