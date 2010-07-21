/*global haven*/

"use strict";

(function () {

    var forestPurpose;
    
    forestPurpose = function (ent, callback) {
        var node, i, roots, ents, forestCallback = callback;
        if (!forestPurpose.isForEnt(ent)) {
            throw "forestPurpose is not for this ent.  Ent must be an object with " +
                "properties \"purpose\": \"forest\" and \"ent\": <value> defined.";
        }
        roots = ent.roots;
        ents = ent.ents;
        if (roots !== undefined) {
            haven(roots, function () {
                if (ents !== undefined) {
                    haven(ents, forestCallback);
                } else {
                    if (forestCallback !== undefined) {
                        forestCallback.call();
                    }
                }
            });
        } else if (ents !== undefined) {
            haven(ents, forestCallback);
        } else {
            if (forestCallback !== undefined) {
                forestCallback.call();
            }
        }
    };
    
    forestPurpose.isForEnt = function (ent) {
        if (typeof ent === "object" &&
            ent.purpose !== undefined &&
            ent.ents !== undefined &&
            ent.purpose === "forest") {
            return true;
        }
        return false;
    };


    haven({
        purpose: 'purpose',
        name: 'forest',
        object: forestPurpose
    });


}());
