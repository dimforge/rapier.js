# rapier.js
JavaScript bindings for the Rapier physics engine.

## Getting started
The 3D version of Rapier is available as a NPM package. You may add the following to
your `package.json`:

```json
  "dependencies": {
    "@dimforge/rapier3d": "^0.1.5",
  }
```

Because Rapier is actually a WebAssembly module, it has to be loaded asynchronously:

```js
import('@dimforge/rapier3d').then(RAPIER => {
  // Use the RAPIER module here.
  let world = new RAPIER.World(0.0, -9.81, 0.0);
})
```

See the `testbed3d/src/demos` folder for examples on how to initialize a Rapier physics world
using these bindings.
