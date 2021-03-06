/*
 * Copyright 2011 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.vertx.java.examples.sockjs;

import org.vertx.java.core.Handler;
import org.vertx.java.core.Verticle;
import org.vertx.java.core.buffer.Buffer;
import org.vertx.java.core.http.HttpServer;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.LoggerFactory;
import org.vertx.java.core.sockjs.AppConfig;
import org.vertx.java.core.sockjs.SockJSServer;
import org.vertx.java.core.sockjs.SockJSSocket;

public class SockJSExample implements Verticle {

  private static final Logger log = LoggerFactory.getLogger(SockJSExample.class);

  private HttpServer server;

  public void start() {
    server = new HttpServer();

    SockJSServer sockServer = new SockJSServer(server);

    sockServer.installApp(new AppConfig().setPrefix("/testapp"), new Handler<SockJSSocket>() {
      public void handle(final SockJSSocket sock) {
        sock.dataHandler(new Handler<Buffer>() {
          public void handle(Buffer data) {
            sock.writeBuffer(data); // Echo it back
          }
        });
      }
    });

    server.requestHandler(new Handler<HttpServerRequest>() {
      public void handle(HttpServerRequest req) {
        if (req.path.equals("/")) req.response.sendFile("sockjs/index.html"); // Serve the html
      }
    }).listen(8080);

  }

  public void stop() {
    server.close();
  }
}
