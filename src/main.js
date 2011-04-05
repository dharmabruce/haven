/*global $ window document*/

"use strict";

(function (window) {

    var haven, purposes = [], purposeLoader, browser;
    
    function giveEntPurpose(ent, callback) {
        var i;
        
        for (i = 0; i < purposes.length; i++) {
            if (purposes[i].object.isForEnt(ent)) {
                purposes[i].object.call(purposes[i].object, ent, callback);
                return true;
            }
        }
        return false;
    }



    haven = function (ent, callback) {
        giveEntPurpose(ent, callback);
    };

    // purposeLoader is a bootstrap purpose
    purposeLoader = function (ent, callback) {
        if (!purposeLoader.isForEnt(ent)) {
            throw "purposeLoader is not for this Ent.";
        }
        if (ent.name === undefined) {
            throw "purpose doesn't have a name defined";
        }
        if (ent.object === undefined) {
            throw "purpose " + ent.name + " doesn't have an object defined.";
        }
        if (ent.object.isForEnt === undefined) {
            throw "purpose " + ent.name + " doesn't have the isForEnt method defined.";
        }
        purposes.push(ent);
        
        if (callback !== undefined) {
            callback.call();
        }
    };

    purposeLoader.isForEnt = function (ent) {
        if (typeof ent === "object" &&
            ent.purpose !== undefined &&
            ent.purpose === "purpose") {
            return true;
        }
        return false;
    };
    
    purposes.push({
        "purpose": "purpose",
        "name": "purpose",
        "object": purposeLoader
    });
    
    window.haven = haven;

}(window));
