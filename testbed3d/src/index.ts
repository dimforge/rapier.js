import {Testbed} from "./Testbed.js";
import * as Trimesh from "./demos/trimesh.js";
import * as Voxels from "./demos/voxels.js";
import * as CollisionGroups from "./demos/collisionGroups.js";
import * as Pyramid from "./demos/pyramid.js";
import * as Keva from "./demos/keva.js";
import * as Joints from "./demos/joints.js";
import * as Fountain from "./demos/fountain.js";
import * as Damping from "./demos/damping.js";
import * as Heightfield from "./demos/heightfield.js";
import * as LockedRotations from "./demos/lockedRotations.js";
import * as ConvexPolyhedron from "./demos/convexPolyhedron.js";
import * as CCD from "./demos/ccd.js";
import * as Platform from "./demos/platform.js";
import * as CharacterController from "./demos/characterController.js";
import * as PidController from "./demos/pidController.js";
import * as glbToTrimesh from "./demos/glbToTrimesh.js";
import * as glbToConvexHull from "./demos/glbtoConvexHull.js";

import("@dimforge/rapier3d").then((RAPIER) => {
    let builders = new Map([
        ["collision groups", CollisionGroups.initWorld],
        ["character controller", CharacterController.initWorld],
        ["convex polyhedron", ConvexPolyhedron.initWorld],
        ["CCD", CCD.initWorld],
        ["damping", Damping.initWorld],
        ["fountain", Fountain.initWorld],
        ["heightfield", Heightfield.initWorld],
        ["joints", Joints.initWorld],
        ["keva tower", Keva.initWorld],
        ["locked rotations", LockedRotations.initWorld],
        ["pid controller", PidController.initWorld],
        ["platform", Platform.initWorld],
        ["pyramid", Pyramid.initWorld],
        ["triangle mesh", Trimesh.initWorld],
        ["voxels", Voxels.initWorld],
        ["GLTF to convexHull", glbToConvexHull.initWorld],
        ["GLTF to trimesh", glbToTrimesh.initWorld],
    ]);
    let testbed = new Testbed(RAPIER, builders);
    testbed.run();
});
