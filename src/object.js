/*global haven */

"use strict";

(function () {

    var objectPurpose, toString = Object.prototype.toString, entNames = [];
    
    function loadEnts(callback) {
        var entName, tempEnt;
        if (entNames.length === 0) {
            if (callback !== undefined) {
                callback.call();
            }
            return;
        }
        entName = entNames.pop();
        tempEnt = haven.getEnt(entName);
        if (tempEnt.loaded) {
            loadEnts(callback);
            return;
        }
        if (tempEnt.depsLoading) {
            throw "Dependecy Definition Error:\nobjectPurpose detected a " +
                "circular dependency for \"" + tempEnt.name + "\".";
        }
        tempEnt.depsLoading = true;
        haven(tempEnt.deps, function () {
            tempEnt.depsLoading = false;
            tempEnt.depsLoaded = true;
            haven(entName, function () {
                loadEnts(callback);
            });
        });
    }
        
    objectPurpose = function (ent, callback) {
        var tempEnt, entName, i;
        if (!objectPurpose.isForEnt(ent)) {
            throw "objectPurpose is not for this ent.  Ent must be an object without a purpose property.";
        }
        
        for (entName in ent) {
            if (ent.hasOwnProperty(entName)) {
                entNames.push(entName);
                tempEnt = haven.getEnt(entName);
                if (tempEnt === undefined) {
                    tempEnt = new haven.Ent(entName);
                }
                if (ent[entName] !== null) {
                    if (tempEnt.loaded) {
                        throw "Dependecy Definition Error:\nEnt \"" + entName + "\" was " +
                            "referred to before its dependencies were defined.";
                    }
                    tempEnt.deps.push(ent[entName]);
                    tempEnt.depsLoaded = false;
                }
            }
        }
        
        loadEnts(callback);
    };
    
    objectPurpose.isForEnt = function (ent) {
        if (typeof ent === "object" &&
            toString.call(ent) !== "[object Array]" &&
            ent.purpose === undefined) {
            return true;
        }
        return false;
    };
    
    haven({
        purpose: 'purpose',
        name: 'object',
        object: objectPurpose
    });


}());
