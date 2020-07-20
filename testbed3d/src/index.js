import { Testbed } from './Testbed';
import * as Cubes from './demos/cubes'
import * as Balls from './demos/balls'
import * as Pyramid from './demos/pyramid'
import * as Keva from './demos/keva'
import * as BallJoints from './demos/ball_joints'
import * as RevoluteJoints from './demos/revolute_joints'

import('rapier3d').then(Rapier => {
    let builders = new Map([
        ['cubes', Cubes.initWorld],
        ['balls', Balls.initWorld],
        ['joints: ball', BallJoints.initWorld],
        ['joints: revolute', RevoluteJoints.initWorld],
        ['keva tower', Keva.initWorld],
        ['pyramid', Pyramid.initWorld],
    ]);
    let worker = new Worker("worker.js");
    let testbed = new Testbed(Rapier, builders, worker);
    testbed.run();
})
