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

var eb = vertx.EventBus;

function testWorkQueue() {
  var numMessages = 100;

  var count = 0;
  var doneHandler = function() {
    if (++count == numMessages) {
      eb.unregisterHandler("done", doneHandler);
      tu.testComplete();
    }
  };

  eb.registerHandler("done", doneHandler);

  for (var i = 0; i < numMessages; i++) {
    eb.send('test.orderQueue', {
      blah: "somevalue: " + i
    })
  }
}

tu.registerTests(this);
var queueConfig = {address: 'test.orderQueue'}
var queueID = vertx.deployWorkerVerticle('busmods/work_queue.js', queueConfig, 1, function() {
  tu.appReady();
});

function vertxStop() {
  tu.unregisterAll();
  tu.appStopped();
}