# Importing

To import **harmonizer**, you must follow the [build instructions](README.md#building) in the README. Then, you can import it, along with its dependency, as follows:

```html
<head>
  ...
  <script src="eventemitter.js"></script>
  <script src="harmonizer.js"></script>
  ...
</head>
```

# Getting a *Context*

The API automatically creates a default *Context*. You can access this as follows:

```js
var context = window.harmonizer.defaultContext;
```

If you want to create a separate *Context*, you can do so like this:

```js
var context = new window.harmonizer.Context();
```

You will probably never need to create a separate *Context*, but there are some reasons you might do so. For instance, you might have a component in a web page whose DOM state reflects its internal state. In this case, a change to your internal state (via animation) should immediately update the DOM state (via a paint), before anything else in the application gets an animation frame.

If you have a *Harmonizer*, you can use the following method on it to get its *Context*

 * getContext() - get the *Context* of a *Harmonizer*.

# Creating a *Harmonizer*

Your scripts can create new *Harmonizer* instances very simply:

```js
var myHarmonizer = new window.harmonizer.Harmonizer();
```

This will create a *Harmonizer* in the default *Context*. If you wish to create a *Harmonizer* in a specific *Context*, you can pass the context as a constructor argument:

```js
var myHarmonizer = new window.harmonizer.Harmonizer(context);
```

It is also possible to create a *Harmonizer* that is automatically a child of another *Harmonizer*. To do this, you may do:

```js
var subHarmonizer = myHarmonizer.spawnChild();
```

When you use `spawnChild()`, you do not need to specify the *Context* since a *Harmonizer* must have the same *Context* as its parent.

# Animations

Each *Harmonizer* controls a single animation. After the animation is started, the *Harmonizer* emits 'animationFrame' events periodically with a timestamp argument. The timestamp passed to 'animationFrame' specifies the number of milliseconds that have elapsed since the start of the animation. When an animation is paused and later resumed, this value is preserved so that it appears not to jump between pause and resume.

The following methods on a *Harmonizer* can be used to control an animation:

 * start() - start or resume the animation. If an animation is already running, this will have no effect.
 * stop() - stop the current animation. If an animation is paused, it will be cancelled. If an animation is not running, this will have no effect.
 * pause() - pause the current animation. If no animation is running, this will have no effect.
 * isAnimating() - returns true if the animation is currently running.
 * isPaused() - returns true if the animation is currently paused.

It is common to use a *Harmonizer*'s animation to paint a view once on the next animation frame. In this case, the 'animationFrame' handler might look something like this:

```js
harmonizer.on('animationFrame', function() {
  harmonizer.stop();
  harmonizer.requestPaint();
});
```

Since such a handler is useful in a number of cases, there is a convenience method for it:

 * makeSingleShot([handler]) - register an 'animationFrame' handler on this *Harmonizer* that stops the animation and calls the given handler function. If the handler function is not specified (as it is optional), the harmonizer will request a paint after stopping the animation.

You should use some caution with *makeSingleShot()* when you pass it no arguments. Suppose, for instance, that you want a *Harmonizer* to buffer mouse movements and forward them to a view, v<sub>1</sub>, during each animation frame. If you do this inside a 'paint' handler, and if v<sub>1</sub> calls `requestPaint()` as a result, it will be in vain. Why? Because *Context* ignores paint requests when it is already painting. Thus, if you want to contact some other view on the next animation frame (e.g. to tell it about a mouse movement), you should specify your own handler to *makeSingleShot()* instead of using a 'paint' handler.

# *Harmonizer* trees

*Harmonizer* instances can be arranged into a tree. Naturally, a *Harmonizer* has one parent and can have multiple children. Every *Harmonizer* in a tree has a common *Context*. Arranging *Harmonizer*s in a tree is useful for painting, as you will see in the [Painting](#painting) section.

Here are the methods which allow you to modify the tree structure:

 * appendChild(child) - add a child *Harmonizer* to this harmonizer. The child must not have an existing parent.
 * removeChild(child) - remove a child *Harmonizer* from this harmonizer.
 * getParent() - get the parent *Harmonizer*. This returns `null` if there is no parent.

# Painting

Any *Harmonizer* can request a paint at any time. This request gets sent to the *Harmonizer*'s root parent, called h<sub>root</sub>. If the *Context* is busy handling animation frames, h<sub>root</sub> will note the request and emit a 'paint' event when the animation frame is complete. If the *Context* is not busy, h<sub>root</sub> will emit the 'paint' event immediately.

If a root *Harmonizer* receives a paint request while it is emitting a 'paint' event, it ignores the request.

The method to request a paint is as follows:

 * requestPaint() - tell the root parent of this *Harmonizer* to repaint as soon as possible.
