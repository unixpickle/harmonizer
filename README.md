# Overview

This file explains **harmonizer**'s purpose. It gives an overview of how **harmonizer** works and what you can do with it. If you want specifics on how to use **harmonizer**, see [USAGE.md](USAGE.md)

# The problem

Suppose you have a complex view system that draws into a `<canvas>`. You might have tooltips, animations, and various components that need to be drawn over or under each other in complex ways. The simplest way to implement something like this is to have a simple `paint()` method that repaints everything at once.

The simple `paint()` approach comes with one huge dilemma. If each component uses `window.requestAnimationFrame` to implement its own animations, then multiple animations could mean multiple paints per animation frame. What's more, some animation frames (e.g. those from a scrollbar), could dirty other components which each trigger a repaint, leading to even more redundant `paint()`s.

# The solution

While there are other solutions, the one provided by **harmonizer** is simple and elegant.

At the root of **harmonizer** is the *Harmonizer*. Taken alone, a *Harmonizer* wraps `window.requestAnimationFrame()` and adds some extra features to it. For each *Harmonizer* there is one "animation", which you can start, stop, and pause at any time. While an animation is running, you receive events for each animation frame, allowing you to request paints accordingly.

The *Harmonizer* also implements a `requestPaint()` method. This method will look at the context in which it was called, noting if an animation frame is in progress or if one has been requested. In the end, the `requestPaint()` method will cause the *Harmonizer* to fire a 'paint' event, but the context will determine when that event is fired. One side effect is that multiple paint requests during one animation frame will only trigger one 'paint' event, solving one of the traditional problems with the `paint()` technique.

The power of the *Harmonizer* comes from linking multiple *Harmonizers* together in a tree. When a *Harmonizer* has no parent, it uses `window.requestAnimationFrame()` for its animating, firing 'paint' events directly after the animation frame is done. However, when *Harmonizers* are arranged in a tree, the root *Harmonizer* propagates its animation frames down to the other harmonizers, and then propagates a 'paint' event back down the tree if necessary. This means that only one `window.requestAnimationFrame()` is used for each animation frame, and only one 'paint' event is sent out per the same animation frame.

By organizing *Harmonizers* in a tree, it is possible to create a complex hierarchy of views, each with its own *Harmonizer*, that repaints no more than once per animation frame.

# Dependencies

This depends on [eventemitter.js](https://github.com/unixpickle/eventemitter.js). It does not depend on `window.requestAnimationFrame()`, since said API can be polyfilled rather easily.

# Building

In order to build this, you will need some kind of shell and [jsbuild](https://github.com/unixpickle/jsbuild). Once you have these, simply run

    $ sh build.sh

This will generate a build directory which contains a `harmonizer.js` file. Make sure to import this before the eventemitter.js dependency.
