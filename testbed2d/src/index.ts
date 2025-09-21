import {Testbed} from "./Testbed.js";
import * as CollisionGroups from "./demos/collisionGroups.js";
import * as Cubes from "./demos/cubes.js";
import * as Keva from "./demos/keva.js";
import * as Heightfield from "./demos/heightfield.js";
import * as Polyline from "./demos/polyline.js";
import * as RevoluteJoints from "./demos/revoluteJoints.js";
import * as LockedRotations from "./demos/lockedRotations.js";
import * as ConvexPolygons from "./demos/convexPolygons.js";
import * as CharacterController from "./demos/characterController.js";
import * as PidController from "./demos/pidController.js";
import * as Voxels from "./demos/voxels.js";

import("@dimforge/rapier2d").then((RAPIER) => {
    let builders = new Map([
        ["collision groups", CollisionGroups.initWorld],
        ["character controller", CharacterController.initWorld],
        ["convex polygons", ConvexPolygons.initWorld],
        ["cubes", Cubes.initWorld],
        ["heightfield", Heightfield.initWorld],
        ["joints: revolute", RevoluteJoints.initWorld],
        ["keva tower", Keva.initWorld],
        ["locked rotations", LockedRotations.initWorld],
        ["pid controller", PidController.initWorld],
        ["polyline", Polyline.initWorld],
        ["voxels", Voxels.initWorld],
    ]);
    let testbed = new Testbed(RAPIER, builders);
    testbed.run();
});
