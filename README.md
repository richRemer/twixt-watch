twixt-watch Function
====================

```js
var Watch = require("twixt-watch"),
    obj = {};

Watch(obj).addEventListener("watch", function(evt) {
    var was, is;
    
    for (var prop in evt.changes) {
        was = evt.changes[prop];
        is = this[prop];
        console.log(prop, "changed from", was, "to", is);
    }
});
```

