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
/*global haven */


(function (haven) {
    
    var ents = {};
    
    haven.getEnt = function (name) {
        return ents[name];
    };

    haven.Ent = function (name, callback) {
        
        if (name === undefined ||
            name === null ||
            name === "") {
            throw "Ent must have a name defined";
        }
        
        if (ents[name] !== undefined) {
            throw "Ent \"" + name + "\" already exists";
        }
        
        this.name = name;
        this.loading = false;
        this.loaded = false;
        this.locks = 0;
        this.deps = [];
        this.depsLoading = false;
        this.depsLoaded = true;
        this.callbacks = [callback];
        
        this.lock = function () {
            this.locks++;
        };
        
        this.unlock = function () {
            this.locks--;
            this.callCallbacks();
        };
        
        this.callCallbacks = function () {
            var cb;
            if (this.locks === 0 && this.loaded) {
                while (this.callbacks.length !== 0) {
                    cb = this.callbacks.shift();
                    if (cb !== undefined) {
                        cb.call();
                    }
                }
            }
        };
        
        ents[name] = this;
        return this;
    };
    
    haven.lock = function (entName) {
        var ent = haven.getEnt(entName);
        if (ent === undefined) {
            ent = new haven.Ent(entName);
        }
        ent.lock();
    };
    
    haven.unlock = function (entName) {
        var ent = haven.getEnt(entName);
        if (ent === undefined) {
            return;
        }
        ent.unlock();
    }

}(haven));
/*global haven document */


(function (haven) {
    var javascriptPurpose, head = document.getElementsByTagName("head")[0];
    
    function scriptLoadedFn(ent) {
        return function (evt) {
            var node = evt.currentTarget || evt.srcElement, script, i;
            if (evt.type === "load" || /^(complete|loaded)$/.test(node.readyState)) {
        
                script = node.getAttribute("src");
        
                ////Clean up script binding.
                //if (node.removeEventListener) {
                //    node.removeEventListener("load", scriptLoaded, false);
                //} else {
                //    //Probably IE.
                //    node.detachEvent("onreadystatechange", scriptLoaded);
                //}
                
                ent.loaded = true;
                ent.loading = false;
                ent.callCallbacks();
            }
        };
        
    }    
    
    function attachScript(ent) {
        var node = document.createElement("script");
        node.type = "text/javascript";
        node.charset = "utf-8";

        node.setAttribute("async", "async");

        //Set up load listener.
        if (node.addEventListener) {
            node.addEventListener("load", scriptLoadedFn(ent), false);
        } else {
            //Probably IE.
            node.attachEvent("onreadystatechange", scriptLoadedFn(ent));
        }
        node.src = ent.name;

        return head.appendChild(node);
    }    
    
    function loadScript(ent, callback) {
        if (ent.loaded) {
            ent.callbacks.push(callback);
            ent.callCallbacks();
            return;
        }
        if (ent.loading) {
            ent.callbacks.push(callback);
            return;
        }
        if (ent.defined !== undefined) {
            if (typeof ent.defined === "function") {
                ent.callbacks.push(callback);
                ent.loading = true;
                ent.defined.call();
                ent.loaded = true;
                ent.loading = false;
                ent.callCallbacks();
                return;
            } else {
                haven(ent.defined, callback);
            }
            return;
        }
	
        ent.loading = true;
        
        attachScript(ent);
    }

    javascriptPurpose = function (ent, callback) {
        var newEnt, entName = ent;
        if (!javascriptPurpose.isForEnt(ent)) {
            throw "javascriptPurpose is not for this Ent.  Ent must be a string ending in .js.";
        }
        
        if (typeof ent === "object") {
            entName = ent.name;
        }
        
        newEnt = haven.getEnt(entName);
        if (newEnt !== undefined) {
            newEnt.callbacks.push(callback);
            if (newEnt.loaded) {
                newEnt.callCallbacks();
                return;
            }
            if (!newEnt.depsLoaded) {
                if (newEnt.depsLoading) {
                    throw "Dependecy Definition Error:\njavascriptPurpose detected " +
                        "circular dependency for \"" + newEnt.name + "\".";
                }
                newEnt.depsLoading = true;
                haven(newEnt.deps, function () {
                    newEnt.depsLoading = false;
                    newEnt.depsLoaded = true;
                    loadScript(newEnt, callback);
                });
            } else {
                loadScript(newEnt, callback);
            }
        } else {
            newEnt = new haven.Ent(entName, callback);
            loadScript(newEnt, callback);
        }

    };
    
    javascriptPurpose.isForEnt = function (ent) {
        if ((typeof ent === "object" &&
            ent.purpose !== undefined &&
            ent.purpose === "javascript" &&
            ent.name !== undefined) ||
            (typeof ent === "string" &&
            /\.js$/.test(ent))) {
            return true;
        }
        return false;
    };
        
    haven({
        purpose: 'purpose',
        name: 'javascript',
        object: javascriptPurpose
    });
    
}(haven));
/*global haven document */


(function () {

    var cssPurpose, toString = Object.prototype.toString, head = document.getElementsByTagName("head")[0];
    
    cssPurpose = function (ent, callback) {
        var node, i, links, re;
        if (!cssPurpose.isForEnt(ent)) {
            throw "cssPurpose is not for this ent.  Ent must end in .css.";
        }
        
        function callCallback() {
            if (callback !== undefined) {
                callback.call();
            }
        }
    
        // Don't attach another stylesheet if it's already attached
        links = document.getElementsByTagName("link");
        re = new RegExp("(^" + ent + "$)|/" + ent + "$");
        for (i = 0; i < links.length; i++) {
            if (re.test(links[i].href)) {
                callCallback();
                return;
            }
        }
        
        node = document.createElement("link");
        node.href = ent;
        node.rel = "stylesheet";
        node.type = "text/css";
        
        head.appendChild(node);
        
        callCallback();
        
    };
    
    cssPurpose.isForEnt = function (ent) {
        if (typeof ent === "string" &&
            /\.css$/.test(ent)) {
            return true;
        }
        return false;
    };

    haven({
        purpose: 'purpose',
        name: 'css',
        object: cssPurpose
    });


}());
/*global haven */


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
/*global haven */


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
/*global haven*/


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
/*global $ haven*/


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
