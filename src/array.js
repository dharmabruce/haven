/*global haven */

"use strict";

(function () {

    var arrayPurpose, toString = Object.prototype.toString;
    
    function parallelLoadedFn(group) {
        return function () {
            group.count--;
            if (group.count === 0) {
                if (group.callback !== undefined) {
                    group.callback.call();
                }
            }
        };
    }
    
    function loadParallelEnts(inEnts, callback) {
        var i, group = {
            count: inEnts.length,
            callback: callback
        }, fn = parallelLoadedFn(group);
        
        for (i = 0; i < inEnts.length; i++) {
            haven(inEnts[i], fn);
        }
    }    
    
    arrayPurpose = function (ent, callback) {
        var node, i, arr = ent;
        if (!arrayPurpose.isForEnt(ent)) {
            throw "arrayPurpose is not for this ent.  Ent must be an array.";
        }
        loadParallelEnts(arr, callback);
    };
    
    arrayPurpose.isForEnt = function (ent) {
        if (toString.call(ent) === "[object Array]") {
            return true;
        }
        return false;
    };


    haven({
        purpose: 'purpose',
        name: 'array',
        object: arrayPurpose
    });


}());
