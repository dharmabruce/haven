/*global haven document */

"use strict";

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
