import md5 from 'md5';

export class RapierBackend {
    constructor(world, bodies, colliders, joints) {
        let me = this;

        import('@dimforge/rapier2d').then(function(RAPIER) {
            let raWorld = new RAPIER.World(0.0, -9.81);
            raWorld.maxVelocityIterations = world.maxVelocityIterations;
            raWorld.maxPositionIterations = world.maxPositionIterations;

            console.log("Num bodies: " + bodies.length);
            let bodyMap = bodies.map(body => {
                let bodyDesc = new RAPIER.RigidBodyDesc(body.type);
                bodyDesc.setTranslation(body.translation.x, body.translation.y);
                let raBody = raWorld.createRigidBody(bodyDesc);
                return [body.handle, raBody];
            });

            me.bodyRevMap = new Map(bodyMap.map(entry => {
                return [entry[1].handle(), entry[0]];
            }));
            me.bodyMap = new Map(bodyMap);

            let colliderMap = colliders.map(coll => {
                let parentHandle = coll.parentHandle;
                let raBody = me.bodyMap.get(parentHandle);
                let colliderDesc = null;
                let raCollider = null;

                switch (coll.type) {
                    case 'Cuboid':
                        let he = coll.halfExtents;
                        colliderDesc = RAPIER.ColliderDesc.cuboid(he.x, he.y);
                        break;
                    case 'Ball':
                        let r = coll.radius;
                        colliderDesc = RAPIER.ColliderDesc.ball(r);
                        break;
                }

                if (!!colliderDesc) {
                    colliderDesc.density = coll.density;
                    raCollider = raBody.createCollider(colliderDesc);
                } else {
                    console.log("Could not build collider from desc: ", coll);
                }

                return [coll.handle, raCollider];
            });

            me.colliderRevMap = new Map(colliderMap.map(entry => {
                return [entry[1].handle(), entry[0]];
            }))
            me.colliderMap = new Map(colliderMap);

            joints.forEach(joint => {
                let raBody1 = me.bodyMap.get(joint.handle1);
                let raBody2 = me.bodyMap.get(joint.handle2);
                let anchor1, anchor2, raAnchor1, raAnchor2;
                let raJointDesc;

                switch (joint.type) {
                    case "Ball":
                        anchor1 = joint.anchor1;
                        anchor2 = joint.anchor2;
                        raAnchor1 = new RAPIER.Vector(anchor1.x, anchor1.y);
                        raAnchor2 = new RAPIER.Vector(anchor2.x, anchor2.y);
                        raJointDesc = RAPIER.JointDesc.ball(raAnchor1, raAnchor2);
                        break;
                }

                raWorld.createJoint(raJointDesc, raBody1, raBody2);
            });

            me.world = raWorld;
            me.RAPIER = RAPIER;
        })
    }

    worldHash() {
        let snap = new Buffer(this.world.takeSnapshot());
        return md5(snap).toString();
    }

    takeSnapshot() {
        if (!!this.RAPIER && !!this.world) {
            return this.world.takeSnapshot();
        } else {
            return null;
        }
    }

    restoreSnapshot(snapshot) {
        if (!!this.RAPIER && !!snapshot) {
            this.world = this.RAPIER.World.restoreSnapshot(snapshot);

            // Restoring the snapshot creates a new physics world, so this
            // invalidates all our internal references to bodies, colliders, and joints.
            this.colliderMap = new Map();
            this.bodyMap = new Map();

            this.world.forEachCollider(collider => {
                let externalHandle = this.colliderRevMap.get(collider.handle());
                this.colliderMap.set(externalHandle, collider);
            });

            this.world.forEachRigidBody(body => {
                let externalHandle = this.bodyRevMap.get(body.handle());
                this.bodyMap.set(externalHandle, body);
            });
        }
    }

    step(velIters, posIters) {
        if (!!this.RAPIER && !!this.world) {
            this.world.maxVelocityIterations = velIters;
            this.world.maxPositionIterations = posIters;

            var t0 = new Date().getTime();
            this.world.step();
            this.stepTime = new Date().getTime() - t0;
            return true;
        } else {
            return false;
        }
    }

    colliderPositions() {
        if (!!this.RAPIER && !!this.world) {
            let result = [];

            if (this.colliderMap) {
                this.colliderMap.forEach((value, key) => {
                    let t = value.translation();
                    let r = value.rotation();
                    let entry = {
                        handle: key,
                        translation: {x: t.x, y: t.y},
                        rotation: r.angle
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