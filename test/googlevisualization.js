/*global haven google*/

"use strict";

haven.lock("googlevisualization.js");
function visualizationLoaded() {
    haven.unlock("googlevisualization.js");
}

function jsapiLoaded() {
    google.load('visualization', '1', {'packages': ['corechart'],
                'callback': visualizationLoaded});
}

haven({
    "purpose": "javascript",
    "name": "http://www.google.com/jsapi?callback=jsapiLoaded"
});

