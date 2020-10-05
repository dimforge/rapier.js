import * as Box2D from './Box2D_v2.3.1_min.js'
import * as Box2DWasm from './Box2D_v2.3.1_min.wasm.js'

class Box2DBackend {
    constructor(RAPIER, Box2D, world, bodies, colliders, joints) {
        var me = this;
        Box2D().then(function (BOX2D) {
            let gravity = new BOX2D.b2Vec2(0.0, -9.81);
            me.world = new BOX2D.b2World(gravity);


            me.bodyMap = new Map(bodies.map(body => {
                let pos = body.translation;
                let b2BodyDef = new BOX2D.b2BodyDef();
                b2BodyDef.set_type(body.type == RAPIER.BodyStatus.Dynamic ? BOX2D.b2_dynamicBody : BOX2D.b2_staticBody);
                b2BodyDef.set_position(new BOX2D.b2Vec2(pos.x, pos.y));
                let b2Body = me.world.CreateBody(b2BodyDef);
                return [body.handle, b2Body];
            }));

            me.colliderMap = new Map(colliders.map(coll => {
                let handle = coll.parentHandle;
                let b2FixtureDef = new BOX2D.b2FixtureDef();
                b2FixtureDef.density = coll.density;
                b2FixtureDef.friction = coll.friction;
                let b2Body = me.bodyMap.get(handle);
                let b2Geom;

                switch (coll.type) {
                    case RAPIER.ShapeType.Cuboid:
                        let he = coll.halfExtents;
                        b2Geom = new BOX2D.b2PolygonShape();
                        b2Geom.SetAsBox(he.x, he.y);
                        break;
                    case RAPIER.ShapeType.Ball:
                        let r = coll.radius;
                        b2Geom = new BOX2D.b2CircleShape();
                        b2Geom.set_m_radius(r);
                        break;
                }

                b2Body.CreateFixture(b2Geom, b2FixtureDef);
                return [coll.handle, b2Body];
            }));


            joints.forEach(joint => {
                let handle1 = joint.handle1;
                let handle2 = joint.handle2;
                let b2Body1 = me.bodyMap.get(handle1);
                let b2Body2 = me.bodyMap.get(handle2);
                let anchor1, anchor2, b2Anchor1, b2Anchor2;
                let b2Def;

                switch (joint.type) {
                    case RAPIER.JointType.Ball:
                        b2Def = new BOX2D.b2RevoluteJointDef();
                        b2Def.bodyA = b2Body1,
                            b2Def.bodyB = b2Body2;
                        b2Def.localAnchorA = new BOX2D.b2Vec2(joint.anchor1.x, joint.anchor1.y);
                        b2Def.localAnchorB = new BOX2D.b2Vec2(joint.anchor2.x, joint.anchor2.y);
                        me.world.CreateJoint(b2Def);
                        break;
                    default:
                        return;
                }
            });

            me.BOX2D = BOX2D;
        });
    }

    step(numVelIters, numPosIters) {
        if (!!this.BOX2D && !!this.world) {
            var t0 = new Date().getTime();
            this.world.Step(0.016, numVelIters, numPosIters);
            this.stepTime = new Date().getTime() - t0;
        }
    }

    colliderPositions() {
        if (!!this.BOX2D && !!this.world) {
            let result = [];

            if (!!this.bodyMap) {
                this.bodyMap.forEach((b2Body, handle) => {
                    let t = b2Body.GetPosition();
                    let r = b2Body.GetAngle();

                    let entry = {
                        handle: handle,
                        translation: {x: t.get_x(), y: t.get_y()},
                        rotation: r
                    };

                    result.push(entry);
                });
            }

            return {
                stepTime: this.stepTime,
                positions: result
            }
        }
    }
}

export class Box2DJSBackend extends Box2DBackend {
    constructor(RAPIER, world, bodies, colliders, joints) {
        super(RAPIER, Box2D, world, bodies, colliders, joints)
    }
}

export class Box2DWASMBackend extends Box2DBackend {
    constructor(RAPIER, world, bodies, colliders, joints) {
        super(RAPIER, Box2DWasm, world, bodies, colliders, joints)
    }
}