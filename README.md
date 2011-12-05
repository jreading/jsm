JsModuleBoilerplate
=====================

A simple Class-based, AMD compliant module setup using jQuery. 

----------------------------------------

### What it is:

A starter kit for creating AMD modules for UI interactions and browser utils. 

----------------------------------------

### How it works:

Demos, etc.

----------------------------------------

### What's included:

#### JSMBP API

* init: use this function to initialize any global/non-modular helpers (lazy loaders, cookies, page tracking, etc.)
* plugin: binds the module to a specific element. Use 'html' as the element, if the module is not bound to an UI element.

#### Module API

* init: initializes any global/non-modular helpers (lazy loaders, cookies, page tracking, etc.)
* publish: triggers a custom event from the element that the module is bound to
* subscribe: subscribes to an event from any element and runs the callback 
* log: logs messages to the console if the debug option is set to true
* callback: 
/**
 * used to activate modules on ajax loaded content or hidden elements.
 * @usage this.callback('.wrapper');
 *
 * @param elements  A set of elements to execute the method on
 */


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
