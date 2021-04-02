### v0.5.1

- Fix a determinism issue after snapshot restoration.

### v0.5.0

- Significantly improve the broad-phase performances when very large colliders are used.
- Add `RigidBodyDesc::setCcdEnabled` to enable Continuous Collision Detection (CCD) for this rigid-body. CCD ensures
  that a fast-moving rigid-body doesn't miss a collision (the tunneling problem).

Breaking changes:

- Removed multiple fields from `IntegrationParameters`. These were unused parameters.

### v0.4.0

- Fix a bug in ball/convex shape collision detection causing the ball to ignore penetrations with depths greater than
  its radius.

Breaking changes:

- Removed `IntegrationParameters.restitutionVelocityThreshold`
  and `IntegrationParameters.set_restitutionVelocityThreshold`.

### v0.3.1

- Fix crash happening when creating a collider with a `ColliderDesc.convexHull` shape.
- Actually remove the second argument of `RigidBodyDesc.setMass` as mentioned in the 0.3.0 changelog.
- Improve snapshotting performances.

### v0.3.0

#### Added

- Added a `RAPIER.version()` function at the root of the package to retrieve the version of Rapier as a string.

Several geometric queries have been added (the same methods have been added to the
`QueryPipeline` too):

- `World.intersectionsWithRay`: get all colliders intersecting a ray.
- `World.intersectionWithShape`: get one collider intersecting a shape.
- `World.projectPoint`: get the projection of a point on the closest collider.
- `World.intersectionsWithPoint`: get all the colliders containing a point.
- `World.castShape`: get the first collider intersecting a shape moving linearly
  (aka. sweep test).
- `World.intersectionsWithShape`: get all the colliders intersecting a shape.

Several new shape types are now supported:

- `RoundCuboid`, `Segment`, `Triangle`, `RoundTriangle`, `Polyline`, `ConvexPolygon` (2D only),
  `RoundConvexPolygon` (2D only), `ConvexPolyhedron` (3D only), `RoundConvexPolyhedron` (3D only),
  `RoundCone` (3D only).

It is possible to build `ColliderDesc` using these new shapes:

- `ColliderDesc.roundCuboid`, `ColliderDesc.segment`, `ColliderDesc.triangle`, `ColliderDesc.roundTriangle`,
  `ColliderDesc.convexHull`, `ColliderDesc.roundConvexHull`, `ColliderDesc.Polyline`,
  `ColliderDesc.convexPolyline` (2D only), `ColliderDesc.roundConvexPolyline` (2D only),
  `ColliderDesc.convexMesh` (3D only),`ColliderDesc.roundConvexMesh` (3D only), `ColliderDesc.roundCone` (3D only).

It is possible to specify different rules for combining friction and restitution coefficients of the two colliders
involved in a contact with:

- `ColliderDesc.frictionCombineRule`, and `ColliderDesc.restitutionCombineRule`.

Various RigidBody-related getter and setters have been added:

- `RigidBodyDesc.newStatic`, `RigidBodyDesc.newDynamic`, and `RigidBodyDesc.newKinematic` are new static method, short
  equivalent to `new RigidBodyDesc(BodyStatus.Static)`, etc.
- `RigidBodyDesc.setGravityScale`, `RigidBody.gravityScale`, `RigidBody.setGravityScale` to get/set the scale factor
  applied to the gravity affecting a rigid-body. Setting this to 0.0 will make the rigid-body ignore gravity.
- `RigidBody.setLinearDamping` and `RigidBody.setAngularDamping` to set the linear and angular damping of the
  rigid-body.
- `RigidBodyDesc.restrictRotations` to prevent rotations along specific coordinate axes. This replaces the three boolean
  arguments previously passed to `.setPrincipalAngularInertia`.

#### Breaking changes

Breaking changes related to rigid-bodies:

- The `RigidBodyDesc.setTranslation` and `RigidBodyDesc.setLinvel` methods now take the components of the translation
  directly as arguments instead of a single `Vector`.
- The `RigidBodyDesc.setMass` takes only one argument now. Use `RigidBodyDesc.lockTranslations` to lock the
  translational motion of the rigid-body.
- The `RigidBodyDesc.setPrincipalAngularInertia` no longer have boolean parameters to lock rotations.
  Use `RigidBodyDesc.lockRotations` or `RigidBodyDesc.restrictRotations` to lock the rotational motion of the
  rigid-body.

Breaking changes related to colliders:

- The `ColliderDesc.setTranslation` method now take the components of the translation directly as arguments instead of a
  single `Vector`.
- The `roundRadius` fields have been renamed `borderRadius`.
- The `RawShapeType.Polygon` no longer exists. For a 2D convex polygon, use `RawShapeType.ConvexPolygon`
  instead.
- All occurrences of `Trimesh` have been replaced by `TriMesh` (note the change in case).

Breaking changes related to events:

- Rename all occurrences of `Proximity` to `Intersection`.
- The `Proximity` enum has been removed.
- The `drainIntersectionEvents` (previously called `drainProximityEvent`) will now call a callback with
  arguments `(number, number, boolean)`: two collider handles, and a boolean indicating if they are intersecting.

Breaking changes related to scene queries:

- The `QueryPipeline.castRay` method now takes two additional parameters: a boolean indicating if the ray should not
  propagate if it starts inside of a shape, and a bit mask indicating the group the ray is part of and these it
  interacts with.
- The `World.castRay` and `QueryPipeline.castRay` now return a struct of type `RayColliderToi`
  which no longer contains the normal at the hit point. Use the new methods `World.castRayAndGetNormal`
  or `QueryPipeline.castRayAndGetNormal` in order to retrieve the normal too.

### v0.2.13

- Fix a bug where `RigidBodyDesc.setMass(m)` with `m != 0.0` would cause the rotations of the created rigid-body to be
  locked.

### v0.2.12

- Add a boolean argument to `RigidBodyDesc.setMass` to indicate if the mass contribution of colliders should be enabled
  for this rigid-body or not.
- Add a `RigidBody.lockRotations` method to lock all the rigid-body rotations resulting from forces.
- Add a `RigidBody.lockTranslations` method to lock all the rigid-body translations resulting from forces.
- Add a `RigidBody.setPrincipalAngularInertia` method to set the principal inertia of the rigid-body. This gives the
  ability to lock individual rotation axes of one rigid-body.

### v0.2.11

- Fix a bug where removing when immediately adding a collider would cause collisions to fail with the new collider.
- Fix a regression causing some colliders added after a few timesteps not to be properly taken into account.

### v0.2.10

- Fix a bug where removing a collider would result in a rigid-body being removed instead.
- Fix a determinism issue when running simulation on the Apple M1 processor.
- Add `JointParams.prismatic` and `JointParams.fixed` for creating prismatic joint or fixed joints.

### v0.2.9

- Add `RigidBody.setLinvel` to set the linear velocity of a rigid-body.
- Add `RigidBody.setAngvel` to set the angular velocity of a rigid-body.

### v0.2.8

- Add `RigidBodySet.remove` to remove a rigid-body from the set.
- Add `ColliderSet.remove` to remove a collider from the set.
- Add `JointSet.remove` to remove a joint from the set.
- Add `RigidBodyDesc.setLinearDamping` and `RigidBodyDesc.setAngularDamping` for setting the linear and angular damping
  coefficient of the rigid-body to create.
- Add `RigidBodyDesc.setMass`, and `RigidBodyDesc.setMassProperties` for setting the initial mass properties of a
  rigid-body.
- Add `ColliderDesc.setCollisionGroups` to use bit-masks for collision filtering between some pairs of colliders.
- Add `ColliderDesc.setSolverGroups` to use bit-masks for making the constraints solver ignore contacts between some
  pairs of colliders.
- Add `ColliderDesc.heightfield` to build a collider with an heightfield shape.
- Add `ColliderDesc.trimesh` to build a collider with a triangle mesh shape.

### v0.2.7

- Reduce snapshot size and computation times.

### v0.2.6

- Fix bug causing an unbounded memory usage when an objects falls indefinitely.

### v0.2.5

- Fix wrong result given by `RigidBody.isKinematic()` and `RigidBody.isDynamic()`.

### v0.2.4

- Add the support for round cylinder colliders (i.e. cylinders with round edges).

### v0.2.3

- Add the support for cone, cylinder, and capsule colliders.

### v0.2.2

- Fix regression causing the density and `isSensor` properties of `ColliderDesc` to not be taken into account.
- Throw an exception when the parent handle passed to `world.createCollider` is not a number.

### v0.2.1

This is a significant rewrite of the JavaScript bindings for rapier. The objective of this rewrite is to make the API
closer to Rapier's and remove most need for manual memory management.

- Calling `.free()` is now required only for objects that live for the whole duration of the simulation. This means that
  it is no longer necessary to `.free()` vectors, rays, ray intersections, colliders, rigid-bodies, etc. Object that
  continue to require an explicit `.free()` are:
    - `World` and `EventQueue`.
    - Or, if you are not using the `World` directly:
      `RigidBodySet`, `ColliderSet`, `JointSet`, `IntegrationParameters`, `PhysicsPipeline`, `QueryPipeline`
      , `SerializationPipeline`, and `EventQueue`.
- Collider.parent() now returns the `RigidBodyHandle` of its parent (instead of the `RigidBody` directly).
- Colliders are now built with `world.createCollider`, i.e., `body.createCollider(colliderDesc)`
  becomes `world.createCollider(colliderDesc, bodyHandle)`.
- Shape types are not an enumeration instead of strings: `ShapeType.Ball` and `ShapeType.Cuboid` instead of `"ball"`
  and `"cuboid"`.
- `collider.handle` is now a field instead of a function.
- `body.handle` is now a field instead of a function.
- The world's gravity is now a `Vector` instead of individual components, i.e., `let world = new RAPIER.World(x, y, z);`
  becomes `let world = new RAPIER.World(new RAPIER.Vector3(x, y, z))`.
- Most methods that took individual components as argument (`setPosition`, `setKinematicPosition`, `setRotation`, etc.)
  now take a `Vector` or `Rotation` structure instead. For example `rigid_body.setKinematicPosition(x, y, z)`
  becomes `rigid_body.setKinematicPosition(new RAPIER.Vector3(x, y, z))`.
- `world.stepWithEvents` becomes `world.step` (the event queue is the last optional argument).
- `RigidBodyDesc` and `ColliderDesc` now use the builder pattern. For example
  `let bodyDesc = new RAPIER.RigidBodyDesc("dynamic"); bodyDesc.setTranslation(x, y, z)` becomes
  `new RigidBodyDesc(BodyStatus.Dynamic).setTranslation(new Vector(x, y, z))`.
- `ray.dir` and `ray.origin` are now fields instead of methods.
- 2D rotations are now just a `number` instead of a `Rotation` struct. So instead of doing `rotation.angle`, single use
  the number as the rotation angle.
- 3D rotations are now represented by the interface `Rotation` (with fields `{x,y,z,w}`) or the class `Quaternion`. Any
  object with these `{x, y, z, w}` fields can be used wherever a `Rotation` is required.
- 2D vectors are now represented by the interface `Vector` (with fields `{x,y}`) or the class `Vector2`). Any object
  with these `{x,y}` fields can be used wherever a `Vector` is required.
- 3D vectors are now represented by the interface `Vector` (with fields `{x,y,z}`) or the class `Vector3`). Any object
  with these `{x,y,z}` fields can be used wherever a `Vector` is required.

### v0.2.0

See changelogs for v0.2.1 instead. The NPM package for v0.2.0 were missing some files.

### v0.1.17

- Fix bug when ghost forces and/or crashes could be observed when a kinematic body touches a static body.

### v0.1.16

- Fix kinematic rigid-body not waking up dynamic bodies it touches.
- Added `new Ray(origin, direction)` constructor instead of `Ray.new(origin, direction)`.

### v0.1.15

- Fix crash when removing a kinematic rigid-body from the World.

### v0.1.14

- Fix issues where force application functions took ownership of the JS vector, preventing the user from freeing
  with `Vector.free()` afterwards.

### v0.1.13

- Added `rigidBody.setNextKinematicTranslation` to set the translation of a kinematic rigid-body at the next timestep.
- Added `rigidBody.setNextKinematicRotation` to set the rotation of a kinematic rigid-body at the next timestep.
- Added `rigidBody.predictedTranslation` to get the translation of a kinematic rigid-body at the next timestep.
- Added `rigidBody.predictedRotation` to set the rotation of a kinematic rigid-body at the next timestep.
- Added `Ray` and `RayIntersection` structures for ray-casting.
- Added `world.castRay` to compute the first hit of a ray with the physics scene.
- Fix a bug causing a kinematic rigid-body not to teleport as expected after a `rigidBody.setPosition`.

### v0.1.12

- Added `world.removeCollider(collider)` to remove a collider from the physics world.
- Added `colliderDesc.setTranslation(...)` to set the relative translation of the collider to build wrt. the rigid-body
  it is attached to.
- Added `colliderDesc.setRotation(...)` to set the relative rotation of the collider to build wrt. the rigid-body it is
  attached to.

### v0.1.11

- Fix a bug causing a crash when the broad-phase proxy handles were recycled.

### v0.1.10

- Fix a determinism problem that could cause rigid-body handle allocation to be non-deterministic after a snapshot
  restoration.

### v0.1.9

- Added `world.getCollider(handle)` that retrieves a collider from its integer handle.
- Added `joint.handle()` that returns the integer handle of the joint.

### v0.1.8

- Added `world.forEachRigidBodyHandle(f)` to apply a closure on the integer handle of each rigid-body on the world.
- Added `world.forEachActiveRigidBody(f)` to apply a closure on each rigid-body on the world.
- Added `world.forEachActiveRigidBodyHandle(f)` to apply a closure on the integer handle of each rigid-body on the
  world.
- Added `rigidBody.applyForce`, `.applyTorque`, `.applyImpulse`, `.applyTorqueImpulse`, `.applyForceAtPoint`, and
  `.applyImpulseAtPoint` to apply a manual force or torque to a rigid-body.
- Added the `EventQueue` structure that can be used to collect and iterate through physics events.
- Added the `Proximity` enum that represents the proximity state of a sensor collider and another collider.
- Added the `world.stepWithEvents(eventQueue)` which executes a physics timestep and collects the physics events into
  the given event queue.

### v0.1.7

- Added `world.getRigidBody(handle)` to retrieve a rigid-body from its handle.
- Added `world.getJoint(handle)` to retrieve a joint from its handle.
- Added `rigidBody.rotation()` to retrieve its world-space orientation as a quaternion.
- Added `rigidBody.setTranslation(...)` to set the translation of a rigid-body.
- Added `rigidBody.setRotation(...)` to set the orientation of a rigid-body.
- Added `rigidBody.wakeUp()` to manually wake up a rigid-body.
- Added `rigidBody_desc.setRotation(...)` to set tho orientation of the rigid-body to be created.

### v0.1.6

- Added `world.removeRigidBody(...)` to remove a rigid-body from the world.