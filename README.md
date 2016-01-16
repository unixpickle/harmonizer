# Overview

This file explains **harmonizer**'s purpose. It gives an overview of how **harmonizer** works and what you can do with it. If you want specifics on how to use **harmonizer**, see [USAGE.md](USAGE.md)

# The problem

Suppose you have a complex view system that draws into a `<canvas>`. You might have tooltips, animations, and various components that need to be drawn over or under each other in complex ways. The simplest way to implement something like this is to have a simple `paint()` method that repaints everything at once.

The simple `paint()` approach comes with one huge dilemma. If each component uses `window.requestAnimationFrame` to implement its own animations, then multiple animations could mean multiple paints per animation frame. What's more, some animation frames (e.g. those from a scrollbar), could dirty other components which each trigger a repaint, leading to even more redundant `paint()`s.

# The solution

While there are other solutions, the one provided by **harmonizer** is simple and elegant.

Everything in a **harmonizer** takes place within a *Context*. A *Context* wraps `requestAnimationFrame()` and can postpone "repaint requests" to the end of each animation frame. During an animation frame, multiple animations may cause a view to try to repaint itself. A *Context* ensures that this painting only happens once, after the animation frame is complete.

While a *Context* is behind everything that **harmonizer** does, it is not the star of the show. At the heart of **harmonizer** is the *Harmonizer*. Taken alone, a *Harmonizer* wraps a *Context* and adds some extra features to it. For each *Harmonizer* there is one "animation", which you can start, stop, and pause at any time. While an animation is running, you receive events for each animation frame, allowing you to request paints accordingly.

While a *Harmonizer* alone is nice, what's nicer is that *Harmonizer*s can be arranged in a tree. This makes it possible to arrange a bunch of *Harmonizer*'s under a root *Harmonizer*. Generally, the root *Harmonizer* will represent a `<canvas>`, and you may not even need to use its animation. Arranging *Harmonizer*s in a tree is useful for repainting, as you will now see.

A *Harmonizer* implements a `requestPaint()` method which triggers a 'paint' event on its root *Harmonizer*. This method will look at the *Harmonizer*'s '*Context*, noting if an animation frame is in progress. If no animation frame is in progress in the *Context*, then the root *Harmonizer* will fire the 'paint' event at once. Otherwise, it will trigger the 'paint' event once the animation frame is over. One side effect of this system is that multiple paint requests from multiple "sub-views" will only trigger one 'paint' event per animation frame, solving one of the traditional problems with the `paint()` technique.

# Dependencies

This depends on [eventemitter.js](https://github.com/unixpickle/eventemitter.js). It does not depend on `window.requestAnimationFrame()`, since said API can be polyfilled rather easily.

# Building

In order to build this, you will need some kind of shell and [jsbuild](https://github.com/unixpickle/jsbuild). Once you have these, simply run

    $ sh build.sh

This will generate a build directory which contains a `harmonizer.js` file. Make sure to import this before the eventemitter.js dependency.
