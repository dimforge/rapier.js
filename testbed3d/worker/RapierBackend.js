import md5 from 'md5';
import {
    INIT,
    Vector,
    World,
    RigidBodyDesc,
    ColliderDesc,
    ShapeType,
    EventQueue,
    JointParams,
    JointType
} from '@dimforge/rapier3d'

export class RapierBackend {
    constructor(world, bodies, colliders, joints) {
        let me = this;

        INIT.then(function (RAPIER) {
            let gravity = new Vector(0.0, -9.81, 0.0);
            let raWorld = new World(RAPIER, gravity);
            raWorld.maxVelocityIterations = world.maxVelocityIterations;
            raWorld.maxPositionIterations = world.maxPositionIterations;

            let bodyMap = bodies.map(body => {
                let bodyDesc = new RigidBodyDesc(body.type)
                    .setTranslation(new Vector(body.translation.x, body.translation.y, body.translation.z));
                let raBody = raWorld.createRigidBody(bodyDesc);
                return [body.handle, raBody];
            });

            me.bodyRevMap = new Map(bodyMap.map(entry => {
                return [entry[1].handle, entry[0]];
            }));
            me.bodyMap = new Map(bodyMap);

            let colliderMap = colliders.map(coll => {
                let parentHandle = coll.parentHandle;
                let raBody = me.bodyMap.get(parentHandle);
                let colliderDesc = null;
                let raCollider = null;

                switch (coll.type) {
                    case ShapeType.Cuboid:
                        let he = coll.halfExtents;
                        colliderDesc = ColliderDesc.cuboid(he.x, he.y, he.z);
                        break;
                    case ShapeType.Ball:
                        let r = coll.radius;
                        colliderDesc = ColliderDesc.ball(r);
                        break;
                }

                if (!!colliderDesc) {
                    colliderDesc.density = coll.density;
                    colliderDesc.isSensor = coll.isSensor;
                    raCollider = raWorld.createCollider(colliderDesc, parentHandle);
                } else {
                    console.log("Could not build collider from desc: ", coll);
                }

                return [coll.handle, raCollider];
            });

            me.colliderRevMap = new Map(colliderMap.map(entry => {
                return [entry[1].handle, entry[0]];
            }))
            me.colliderMap = new Map(colliderMap);

            joints.forEach(joint => {
                let raBody1 = me.bodyMap.get(joint.handle1);
                let raBody2 = me.bodyMap.get(joint.handle2);
                let anchor1, anchor2, raAnchor1, raAnchor2;
                let raJointParams;

                switch (joint.type) {
                    case JointType.Ball:
                        anchor1 = joint.anchor1;
                        anchor2 = joint.anchor2;
                        raAnchor1 = new Vector(anchor1.x, anchor1.y, anchor1.z);
                        raAnchor2 = new Vector(anchor2.x, anchor2.y, anchor2.z);
                        raJointParams = JointParams.ball(raAnchor1, raAnchor2);
                        break;
                    case JointType.Revolute:
                        anchor1 = joint.anchor1;
                        anchor2 = joint.anchor2;
                        let axis1 = joint.axis1;
                        let axis2 = joint.axis2;
                        raAnchor1 = new Vector(anchor1.x, anchor1.y, anchor1.z);
                        raAnchor2 = new Vector(anchor2.x, anchor2.y, anchor2.z);
                        let raAxis1 = new Vector(axis1.x, axis1.y, axis1.z);
                        let raAxis2 = new Vector(axis2.x, axis2.y, axis2.z);
                        raJointParams = JointParams.revolute(raAnchor1, raAxis1, raAnchor2, raAxis2);
                        break;
                }

                raWorld.createJoint(raJointParams, raBody1, raBody2);
            });

            me.world = raWorld;
            me.events = new EventQueue(RAPIER, true);
            me.RAPIER = RAPIER;
        })
    }

    worldHash() {
        let snap = new Buffer(this.world.takeSnapshot());
        return md5(snap).toString();
    }

    takeSnapshot() {
        if (!!this.world) {
            return this.world.takeSnapshot();
        } else {
            return null;
        }
    }

    free() {
        if (!!this.world)
            this.world.free();
        this.world = null;
    }

    restoreSnapshot(snapshot) {
        if (!!this.RAPIER && !!snapshot) {
            const oldWorld = this.world;
            this.world = World.restoreSnapshot(this.RAPIER, snapshot);
            oldWorld.free();

            // Restoring the snapshot creates a new physics world, so this
            // invalidates all our internal references to bodies, colliders, and joints.
            this.colliderMap = new Map();
            this.bodyMap = new Map();

            this.world.forEachCollider(collider => {
                let externalHandle = this.colliderRevMap.get(collider.handle);
                this.colliderMap.set(externalHandle, collider);
            });

            this.world.forEachRigidBody(body => {
                let externalHandle = this.bodyRevMap.get(body.handle);
                this.bodyMap.set(externalHandle, body);
            });
        }
    }

    step(velIters, posIters) {
        if (!!this.world) {
            this.world.maxVelocityIterations = velIters;
            this.world.maxPositionIterations = posIters;

            var t0 = new Date().getTime();
            this.world.step(this.events);
            this.stepTime = new Date().getTime() - t0;
            return true;
        } else {
            return false;
        }
    }

    colliderPositions() {
        if (!!this.world) {
            let result = [];

            if (this.colliderMap) {
                this.colliderMap.forEach((value, key) => {
                    let t = value.translation();
                    let r = value.rotation();
                    let entry = {
                        handle: key,
                        translation: {x: t.x, y: t.y, z: t.z},
                        rotation: {x: r.x, y: r.y, z: r.z, w: r.w}
                    };
                    result.push(entry)
                });
            }

            return {
                stepTime: this.stepTime,
                positions: result,
            };
        }
    }
}