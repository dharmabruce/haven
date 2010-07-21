/*global haven document */

"use strict";

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