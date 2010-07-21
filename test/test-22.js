/*global */

"use strict";

haven.lock("test-22.js");

$.getScript("test-23.js", function () {
    setTimeout(function () {
        haven.unlock("test-22.js");
    }, 1000);
});

