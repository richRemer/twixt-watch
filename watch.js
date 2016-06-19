var EventTarget = require("twixt-event-target"),
    watches = new WeakMap();

/**
 * Create a watch proxy for an object.
 * @param {object} obj
 * @returns {Proxy}
 */
function Watch(obj) {
    var triggered,
        i = 0;
        changes = {};

    if (!obj.addEventListener) {
        obj = EventTarget(obj);
    }
    
    function trigger() {
        i++;
        
        if (triggered) return;
        
        triggered = setTimeout(function() {
            var evt = new Event("watch");

            Object.freeze(changes);
            evt.changes = changes;
            evt.triggers = i;

            triggered = null;
            changes = {};
            i = 0;

            obj.dispatchEvent(evt);
        }, 0);
    }
    
    return new Proxy(obj, {
        deleteProperty: function(target, property) {
            if (property in target) {
                if (!(property in changes)) {
                    changes[property] = target[property];
                }
                
                delete target[property];
                trigger();
            }
            
            return true;
        },
        defineProperty: function(target, property, descriptor) {
            var value = target[property];
            
            Object.defineProperty(target, property, descriptor);

            if (!(property in changes)) {
                if (target[property] !== value) {
                    changes[property] = value;
                    trigger();
                }
            }
        },
        set: function(target, property, value, receiver) {
            if (value !== target[property]) {
                if (!(property in changes)) {
                    changes[property] = target[property];
                }
                
                target[property] = value;
                trigger();
            }
        }
    });
}

/**
 * Return a Watch proxy for the object.
 * @param {object} obj
 * @returns {Watch}
 */
function watch(obj) {
    if (!watches.has(obj)) {
        watches.set(obj, Watch(obj));
    }
    
    return watches.get(obj);
}

module.exports = watch;

