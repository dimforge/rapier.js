import md5 from 'md5';

export class RapierBackend {
    constructor(world, bodies, colliders, joints) {
        let me = this;

        import('rapier3d').then(function(RAPIER) {
            let ra_world = new RAPIER.World(0.0, -9.81, 0.0);
            ra_world.max_velocity_iterations = world.max_velocity_iterations;
            ra_world.max_position_iterations = world.max_position_iterations;

            let bodyMap = bodies.map(body => {
                let body_desc = new RAPIER.RigidBodyDesc(body.type);
                body_desc.set_translation(body.translation.x, body.translation.y, body.translation.z);
                let ra_body = ra_world.create_rigid_body(body_desc);
                return [body.handle, ra_body];
            });

            me.bodyRevMap = new Map(bodyMap.map(entry => {
                return [entry[1].handle(), entry[0]];
            }));
            me.bodyMap = new Map(bodyMap);

            let colliderMap = colliders.map(coll => {
                let parent_handle = coll.parent_handle;
                let ra_body = me.bodyMap.get(parent_handle);
                let collider_desc = null;
                let ra_collider = null;

                switch (coll.type) {
                    case 'Cuboid':
                        let he = coll.half_extents;
                        collider_desc = RAPIER.ColliderDesc.cuboid(he.x, he.y, he.z);
                        break;
                    case 'Ball':
                        let r = coll.radius;
                        collider_desc = RAPIER.ColliderDesc.ball(r);
                        break;
                }

                if (!!collider_desc) {
                    collider_desc.density = coll.density;
                    ra_collider = ra_body.create_collider(collider_desc);
                } else {
                    console.log("Could not build collider from desc: ", coll);
                }

                return [coll.handle, ra_collider];
            });

            me.colliderRevMap = new Map(colliderMap.map(entry => {
                return [entry[1].handle(), entry[0]];
            }))
            me.colliderMap = new Map(colliderMap);

            joints.forEach(joint => {
                let ra_body1 = me.bodyMap.get(joint.handle1);
                let ra_body2 = me.bodyMap.get(joint.handle2);
                let anchor1, anchor2, ra_anchor1, ra_anchor2;
                let ra_joint_desc;

                switch (joint.type) {
                    case "Ball":
                        anchor1 = joint.anchor1;
                        anchor2 = joint.anchor2;
                        ra_anchor1 = new RAPIER.Vector(anchor1.x, anchor1.y, anchor1.z);
                        ra_anchor2 = new RAPIER.Vector(anchor2.x, anchor2.y, anchor2.z);
                        ra_joint_desc = RAPIER.JointDesc.ball(ra_anchor1, ra_anchor2);
                        break;
                    case "Revolute":
                        anchor1 = joint.anchor1;
                        anchor2 = joint.anchor2;
                        let axis1 = joint.axis1;
                        let axis2 = joint.axis2;
                        ra_anchor1 = new RAPIER.Vector(anchor1.x, anchor1.y, anchor1.z);
                        ra_anchor2 = new RAPIER.Vector(anchor2.x, anchor2.y, anchor2.z);
                        let ra_axis1 = new RAPIER.Vector(axis1.x, axis1.y, axis1.z);
                        let ra_axis2 = new RAPIER.Vector(axis2.x, axis2.y, axis2.z);
                        ra_joint_desc = RAPIER.JointDesc.revolute(ra_anchor1, ra_axis1, ra_anchor2, ra_axis2);
                        break;
                }

                ra_world.create_joint(ra_joint_desc, ra_body1, ra_body2);
            });

            me.world = ra_world;
            me.RAPIER = RAPIER;
        })
    }

    worldHash() {
        let snap = new Buffer(this.world.take_snapshot());
        return md5(snap).toString();
    }

    takeSnapshot() {
        if (!!this.RAPIER && !!this.world) {
            return this.world.take_snapshot();
        } else {
            return null;
        }
    }

    restoreSnapshot(snapshot) {
        if (!!this.RAPIER && !!snapshot) {
            this.world = this.RAPIER.World.restore_snapshot(snapshot);

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
            this.world.max_velocity_iterations = velIters;
            this.world.max_position_iterations = posIters;

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