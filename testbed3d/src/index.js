import { Testbed } from './Testbed';
import * as Cubes from './demos/cubes'
import * as Balls from './demos/balls'
import * as Pyramid from './demos/pyramid'
import * as Keva from './demos/keva'
import * as BallJoints from './demos/ball_joints'
import * as RevoluteJoints from './demos/revolute_joints'

import('rapier3d').then(Rapier => {
    let builders = new Map([
        ['cubes', Cubes.init_world],
        ['balls', Balls.init_world],
        ['joints: ball', BallJoints.init_world],
        ['joints: revolute', RevoluteJoints.init_world],
        ['keva tower', Keva.init_world],
        ['pyramid', Pyramid.init_world],
    ]);
    let worker = new Worker("worker.js");
    let testbed = new Testbed(Rapier, builders, worker);
    testbed.run();
})
