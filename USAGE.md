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

# Creating a *Harmonizer*

Now, your scripts can create new harmonizers very simply:

```js
var myHarmonizer = new window.harmonizer.Harmonizer();
```

It is also possible to create a harmonizer that is automatically a child of another harmonizer. To do this, you may do:

```js
var subHarmonizer = myHarmonizer.spawnChild();
```

# Animations

Each harmonizer controls a single animation. After the animation is started, the harmonizer emits 'animationFrame' events periodically with a timestamp argument. The timestamp passed to 'animationFrame' specifies the number of milliseconds that have elapsed since the start of the animation. When an animation is paused and later resumed, this value is preserved so that it appears not to jump between pause and resume.

The following methods on a *Harmonizer* can be used to control an animation:

 * start() - start or resume the animation. If an animation is already running, this will have no effect.
 * stop() - stop the current animation. If an animation is paused, it will be cancelled. If an animation is not running, this will have no effect.
 * pause() - pause the current animation. If no animation is running, this will have no effect.

It is common to use a *Harmonizer*'s animation for single animation frames. For instance, one might use a *Harmonizer* to buffer mouse movements, starting the animation when the mouse moves and processing the event on the next paint. In this case, the 'animationFrame' handler might look something like this:

```js
harmonizer.on('animationFrame', function() {
  harmonizer.stop();
  harmonizer.requestPaint();
});
```

Since such a handler is useful in a number of cases, there is a convenience method for it:

 * makeSingleShot() - register an 'animationFrame' handler on this *Harmonizer* that stops the animation and requests a paint.

# *Harmonizer* trees

*Harmonizer* instances can be arranged into a tree. Naturally, a *Harmonizer* has one parent and can have multiple children. Excepting the root *Harmorizer*, each *Harmonizer* depends on its parent for animation frames. This is called self-reliant mode. When a *Harmonizer* is removed from a tree, it enters self-reliant mode since it no longer has a parent. When a *Harmonizer* is added to a tree, it leaves self-reliant mode.

When a *Harmonizer* gets an animation frame, it emits an 'animationFrame' event. After this event has been fired, it notes all of its children and passes the 'animationFrame' to the children that need it. The order in which children receive events is not specified. If a child removes itself from the tree while an animation frame is propagating before it receives the animation from, it is guaranteed not to receive the animation frame. However, a *Harmonizer* which is added to a tree during a propagating animation frame will **not** receive the animation frame under any circumstances.

Here are the methods which allow you to modify the tree structure:

 * appendChild(child) - add a child *Harmonizer* to this harmonizer. The child must not have an existing parent.
 * removeChild(child) - remove a child *Harmonizer* from this harmonizer.
 * getParent() - get the parent *Harmonizer*. This returns `null` if there is no parent.

# Painting

Any *Harmonizer* can request a paint at any time. This request gets sent to the *Harmonizer*'s root parent and processed accordingly. If the root *Harmonizer* is busy propagating animation frames, it will note the request and emit a 'paint' event after the propagation is complete. If it is not busy, it will emit the 'paint' event immediately.

There are some edge cases to consider. If the root *Harmonizer* is in the middle of emitting its 'paint' event when a request comes in, it will ignore the request. If a *Harmonizer* requests a paint but is removed from the tree before the root finishes propagating the animation frame, then the root will still emit a 'paint' event. If a *Harmonizer* requests a paint from its root, r<sub>1</sub>, and then that root is added to a bigger tree rooted at r<sub>2</sub> while r<sub>1</sub> is animating, then r<sub>1</sub> will emit a 'paint' event but r<sub>2</sub> will not. In general, a propagating *Harmonizer* will only emit a 'paint' event if it was the root node while it began propagating animation frames, and if one of its children requested an animation frame during the propagation.

The method to request a paint is as follows:

 * requestPaint() - tell the root parent of this *Harmonizer* to repaint as soon as possible.
