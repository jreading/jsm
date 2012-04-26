JsModuleBoilerplate
=====================

v0.9

A simple Class-based, AMD compliant module setup using jQuery. 

----------------------------------------

### What it is:

A starter kit for creating widgets from AMD modules. 

----------------------------------------

### How it works:

AMD modules are loaded and bound to UI elements. Data attributes are used to set options for each module instance. 
The JsMBp uses a registered module object to store instance references.  

For an example, look at the [demo](https://github.com/jreading/JsModuleBoilerplate/tree/master/demo). 

----------------------------------------

### What's included:

#### JSMBP API

* init: use this function to initialize any global/non-modular helpers (lazy loaders, cookies, page tracking, etc.)
* plugin: binds the module to a specific element. Use 'html' as the element, if the module is not bound to an UI element.

#### Module API

* init: initializes the object with the options and couple it with the element.
 * @param {object literal} options An array of options.
 * @param {HTMLElement} element A DOM element.
* publish: triggers a custom event from the element that the module is bound to
* subscribe: subscribes to an event from any element and runs the callback 
* log: output to the console if it exists and debugging is enabled in the sub-class.
 * @param Accepts any number of arguments, any type.


----------------------------------------

### More info:

Modular Js:
http://briancavalier.com/presentations/pgh-js-amd-10-2011/#0

AMD is better for the web than CommonJS Modules:
http://blog.millermedeiros.com/2011/09/amd-is-better-for-the-web-than-commonjs-modules/

Using AMD loaders:
http://unscriptable.com/code/Using-AMD-loaders/

Class.js based off Resig's Simple Javascript Inheritance: 
http://ejohn.org/blog/simple-javascript-inheritance/

----------------------------------------

### Thanks goes to...

These guys (whether they know it or not):

  Adam Abouraya, Arne Strout, Bret Crosby, Jonathan Zuckerman, Sasha Sklar, Todd Driscoll

And these guys (they don't know it):

  Alex Sexton, Brian Cavalier, John Hann, John Resig
