import {Testbed} from './Testbed';
import * as Primitives from './demos/primitives'
import * as Balls from './demos/balls'
import * as Pyramid from './demos/pyramid'
import * as Keva from './demos/keva'
import * as BallJoints from './demos/ball_joints'
import * as RevoluteJoints from './demos/revolute_joints'
import * as Fountain from './demos/fountain'

import('@dimforge/rapier3d').then(RAPIER => {
    let builders = new Map([
        ['primitives', Primitives.initWorld],
        ['balls', Balls.initWorld],
        ['fountain', Fountain.initWorld],
        ['joints: ball', BallJoints.initWorld],
        ['joints: revolute', RevoluteJoints.initWorld],
        ['keva tower', Keva.initWorld],
        ['pyramid', Pyramid.initWorld],
    ]);
    let worker = new Worker("worker.js");
    let testbed = new Testbed(RAPIER, builders, worker);
    testbed.run();
})
