/*global $ haven*/

"use strict";

(function () {

    var jsonPurpose;
    
    jsonPurpose = function (ent, callback) {
        var jsonPurposeCallback = callback;
        if (!jsonPurpose.isForEnt(ent)) {
            throw "jsonPurpose is not for this ent.  Ent must be a string ending in .json.";
        }
        
        if ($.getJSON === undefined) {
            throw "jQuery must be loaded for haven json support.";
        }
        $.getJSON(ent, function (data) {
             haven(data, jsonPurposeCallback);
        });
	
    };
    
    jsonPurpose.isForEnt = function (ent) {
        if (typeof ent === "string" &&
            /\.json$/.test(ent)) {
            return true;
        }
        return false;
    };
    
    haven({
        purpose: 'purpose',
        name: 'json',
        object: jsonPurpose
    });


}());
