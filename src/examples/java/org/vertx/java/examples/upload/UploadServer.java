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

package org.vertx.java.examples.upload;

import org.vertx.java.core.CompletionHandler;
import org.vertx.java.core.Future;
import org.vertx.java.core.Handler;
import org.vertx.java.core.SimpleHandler;
import org.vertx.java.core.Verticle;
import org.vertx.java.core.file.AsyncFile;
import org.vertx.java.core.file.FileSystem;
import org.vertx.java.core.http.HttpServer;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.streams.Pump;

import java.util.UUID;

public class UploadServer implements Verticle {

  private HttpServer server;

  public void start() {

    server = new HttpServer().requestHandler(new Handler<HttpServerRequest>() {
      public void handle(final HttpServerRequest req) {

        // We first pause the request so we don't receive any data between now and when the file is opened
        req.pause();

        final String filename = "upload/file-" + UUID.randomUUID().toString() + ".upload";

        FileSystem.instance.open(filename).handler(new CompletionHandler<AsyncFile>() {
          public void handle(Future<AsyncFile> deferred) {
            final AsyncFile file = deferred.result();
            final Pump pump = new Pump(req, file.getWriteStream());
            final long start = System.currentTimeMillis();
            req.endHandler(new SimpleHandler() {
              public void handle() {
                file.close().handler(new CompletionHandler<Void>() {
                  public void handle(Future<Void> deferred) {
                    if (deferred.succeeded()) {
                      req.response.end();
                      long end = System.currentTimeMillis();
                      System.out.println("Uploaded " + pump.getBytesPumped() + " bytes to " + filename + " in " + (end - start) + " ms");
                    } else {
                      deferred.exception().printStackTrace(System.err);
                    }
                  }
                });
              }
            });
            pump.start();
            req.resume();
          }
        });
      }
    }).listen(8080);
  }

  public void stop() {
    server.close();
  }
}
