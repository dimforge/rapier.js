import {Testbed} from './Testbed';
import * as CollisionGroups from './demos/collisionGroups'
import * as Cubes from './demos/cubes'
import * as Pyramid from './demos/pyramid'
import * as Keva from './demos/keva'
import * as Heightfield from './demos/heightfield'
import * as Polyline from './demos/polyline'
import * as BallJoints from './demos/ballJoints'
import * as LockedRotations from './demos/lockedRotations'
import * as ConvexPolygons from './demos/convexPolygons'

import('@dimforge/rapier2d').then(RAPIER => {
    let builders = new Map([
        ['collision groups', CollisionGroups.initWorld],
        ['convex polygons', ConvexPolygons.initWorld],
        ['cubes', Cubes.initWorld],
        ['heightfield', Heightfield.initWorld],
        ['joints: ball', BallJoints.initWorld],
        ['keva tower', Keva.initWorld],
        ['locked rotations', LockedRotations.initWorld],
        ['polyline', Polyline.initWorld],
        ['pyramid', Pyramid.initWorld],
    ]);
    let worker = new Worker("worker.js");
    let testbed = new Testbed(RAPIER, builders, worker);
    testbed.run();
})
