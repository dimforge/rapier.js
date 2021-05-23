import {Testbed} from './Testbed';
import * as Trimesh from './demos/trimesh'
import * as CollisionGroups from './demos/collisionGroups'
import * as Pyramid from './demos/pyramid'
import * as Keva from './demos/keva'
import * as Joints from './demos/joints'
import * as Fountain from './demos/fountain'
import * as Damping from './demos/damping'
import * as Heightfield from './demos/heightfield'
import * as LockedRotations from './demos/lockedRotations'
import * as ConvexPolyhedron from './demos/convexPolyhedron'
import * as CCD from './demos/ccd'
import * as Platform from './demos/platform'

import('@dimforge/rapier3d').then(RAPIER => {
    let builders = new Map([
        ['collision groups', CollisionGroups.initWorld],
        ['convex polyhedron', ConvexPolyhedron.initWorld],
        ['CCD', CCD.initWorld],
        ['damping', Damping.initWorld],
        ['fountain', Fountain.initWorld],
        ['heightfield', Heightfield.initWorld],
        ['joints', Joints.initWorld],
        ['keva tower', Keva.initWorld],
        ['locked rotations', LockedRotations.initWorld],
        ['platform', Platform.initWorld],
        ['pyramid', Pyramid.initWorld],
        ['triangle mesh', Trimesh.initWorld],
    ]);
    let worker = new Worker("worker.js");
    let testbed = new Testbed(RAPIER, builders, worker);
    testbed.run();
})
