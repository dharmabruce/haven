/*global haven */

"use strict";

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
            if (this.loaded) {
                
            }
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

}(haven));