import {Engine, World, Bodies, Body, Constraint} from 'matter-js';

export class MatterBackend {
    constructor(RAPIER, world, bodies, colliders, joints) {
        this.engine = Engine.create();
        this.engine.world.gravity.x = 0.0;
        this.engine.world.gravity.y = -0.1;

        let body2colliders = new Map();
        colliders.forEach(coll => {
            if (!body2colliders.get(coll.parentHandle)) {
                body2colliders.set(coll.parentHandle, []);
            }

            body2colliders.get(coll.parentHandle).push(coll);
        });

        this.bodyMap = new Map(bodies.map(body => {
            let pos = body.translation;
            let collider = body2colliders.get(body.handle)[0];
            let maBody;

            switch (collider.type) {
                case RAPIER.ShapeType.Ball:
                    let r = collider.radius;
                    maBody = Bodies.circle(0, 0, r)
                    break;
                case RAPIER.ShapeType.Cuboid:
                    let he = collider.halfExtents;
                    maBody = Bodies.rectangle(0, 0, he.x * 2.0, he.y * 2.0);
                    break;
            }

            Body.setPosition(maBody, pos);
            Body.setStatic(maBody, body.type != RAPIER.BodyStatus.Dynamic);
            World.add(this.engine.world, [maBody]);
            maBody.colliderHandle = collider.handle;

            return [body.handle, maBody];
        }));

        joints.forEach(joint => {
            let handle1 = joint.handle1;
            let handle2 = joint.handle2;
            let maBody1 = this.bodyMap.get(handle1);
            let maBody2 = this.bodyMap.get(handle2);
            let anchor1, anchor2, maAnchor1, maAnchor2;
            let maConstraint;

            switch (joint.type) {
                case RAPIER.JointType.Ball:
                    maConstraint = Constraint.create({
                        bodyA: maBody1,
                        bodyB: maBody2,
                        pointA: joint.anchor1,
                        pointB: joint.anchor2,
                    })
                    break;
                default:
                    return; // matter.js does not support any other constraint type.
            }

            World.add(this.engine.world, [maConstraint]);
        });
    }

    step(numVelIters) {
        if (!!this.engine) {
            this.engine.world.constraintIterations = numVelIters;

            var t0 = new Date().getTime();
            Engine.update(this.engine, 1000.0 / 60.0, 1);
            this.stepTime = new Date().getTime() - t0;
        }
    }

    colliderPositions() {
        if (!!this.engine) {
            let result = [];

            if (this.bodyMap) {
                this.bodyMap.forEach(maBody => {
                    let t = maBody.position;
                    let r = maBody;
                    let entry = {
                        handle: maBody.colliderHandle,
                        translation: {x: t.x, y: t.y},
                        rotation: r
                    };
                    result.push(entry)
                });
            }

            return {
                stepTime: this.stepTime,
                positions: result,
            }
        }
    }
}