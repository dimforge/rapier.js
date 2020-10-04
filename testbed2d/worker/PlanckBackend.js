import * as PLANCK from "planck-js"

export class PlanckBackend {
    constructor(RAPIER, world, bodies, colliders, joints) {
        let gravity = new PLANCK.Vec2(0.0, -9.81);
        this.world = new PLANCK.World(gravity);


        this.bodyMap = new Map(bodies.map(body => {
            let pos = body.translation;
            let b2BodyDef = {
                type: body.type == RAPIER.BodyStatus.Dynamic ? "dynamic" : "static",
                position: PLANCK.Vec2(pos.x, pos.y)
            };
            let b2Body = this.world.createBody(b2BodyDef);
            return [body.handle, b2Body];
        }));

        this.colliderMap = new Map(colliders.map(coll => {
            let handle = coll.parentHandle;
            let b2FixtureDef = {
                density: coll.density,
                friction: coll.friction
            };
            let b2Body = this.bodyMap.get(handle);

            switch (coll.type) {
                case RAPIER.ShapeType.Cuboid:
                    let he = coll.halfExtents;
                    b2FixtureDef.shape = new PLANCK.Box(he.x, he.y);
                    break;
                case RAPIER.ShapeType.Ball:
                    let r = coll.radius;
                    b2FixtureDef.shape = new PLANCK.Circle(r);
                    break;
            }

            b2Body.createFixture(b2FixtureDef);
            return [coll.handle, b2Body];
        }));


        joints.forEach(joint => {
            let handle1 = joint.handle1;
            let handle2 = joint.handle2;
            let b2Body1 = this.bodyMap.get(handle1);
            let b2Body2 = this.bodyMap.get(handle2);
            let b2Def;

            switch (joint.type) {
                case RAPIER.JointType.Ball:
                    let revJoint = PLANCK.RevoluteJoint({}, b2Body1, b2Body2);
                    revJoint.m_localAnchorA = new PLANCK.Vec2(joint.anchor1.x, joint.anchor1.y);
                    revJoint.m_localAnchorB = new PLANCK.Vec2(joint.anchor2.x, joint.anchor2.y);
                    this.world.createJoint(revJoint);
                    break;
                default:
                    return;
            }
        });
    }

    step(numVelIters, numPosIters) {
        if (!!this.world) {
            var t0 = new Date().getTime();
            this.world.step(0.016, numVelIters, numPosIters);
            this.stepTime = new Date().getTime() - t0;
        }
    }

    colliderPositions() {
        if (!!this.world) {
            let result = [];

            if (this.bodyMap) {
                this.bodyMap.forEach((b2Body, handle) => {
                    let t = b2Body.getPosition();
                    let r = b2Body.getAngle();

                    let entry = {
                        handle: handle,
                        translation: {x: t.x, y: t.y},
                        rotation: r
                    };

                    result.push(entry);
                });
            }

            return {
                stepTime: this.stepTime,
                positions: result,
            }
        }
    }
}