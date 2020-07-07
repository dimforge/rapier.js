import * as OIMO from 'oimo';


export class OimoBackend {
    constructor(world, bodies, colliders, joints) {
        this.world = new OIMO.World({
            timestep: 0.016,
            iterations: world.max_velocity_iterations,
            broadphase: 2,
            worldscale: 1,
            random: false,
            info: false,
            gravity: [0, -9.81, 0]
        });

        let body2colliders = new Map();
        colliders.forEach(coll => {
            if (!body2colliders.get(coll.parent_handle)) {
                body2colliders.set(coll.parent_handle, []);
            }

            body2colliders.get(coll.parent_handle).push(coll);
        });

        this.bodyMap = new Map(bodies.map(body => {
            let pos = body.translation;
            let collider = body2colliders.get(body.handle)[0];
            let oi_type;
            let oi_size;

            switch (collider.type) {
                case 'Ball':
                    let r = collider.radius;
                    oi_type = 'sphere';
                    oi_size = [r, r, r];
                    break;
                case 'Cuboid':
                    let he = collider.half_extents;
                    oi_type = 'box';
                    oi_size = [he.x * 2.0, he.y * 2.0, he.z * 2.0];
                    break;
            }

            let oi_body_desc = {
                type: oi_type,
                size: oi_size,
                pos: [pos.x, pos.y, pos.z],
                move: body.type == "dynamic",
                density: collider.density,
                friction: collider.friction,
                restitution: 0.0,
            };

            if (body.type != "dynamic") {
                // Keeping the density field when the body is
                // not dynamic appears to cause a NaN and breaks
                // the simulation. Very likely due to the density
                // being set to 0, which does not seem to be supported
                // by Oimo.
                delete oi_body_desc.density;
            }

            let oi_body = this.world.add(oi_body_desc);
            oi_body.colliderHandle = collider.handle;

            return [ body.handle, oi_body ];
        }));

        joints.forEach(joint => {
            let handle1 = joint.handle1;
            let handle2 = joint.handle2;
            let oi_body1 = this.bodyMap.get(handle1);
            let oi_body2 = this.bodyMap.get(handle2);
            let anchor1, anchor2, oi_anchor1, oi_anchor2;
            let oi_constraint;

            switch (joint.type) {
                case "Ball":
                    anchor1 = joint.anchor1;
                    anchor2 = joint.anchor2;
                    oi_anchor1 = [anchor1.x, anchor1.y, anchor1.z];
                    oi_anchor2 = [anchor2.x, anchor2.y, anchor2.z];
                    oi_constraint = {
                        type: "jointBall",
                        body1: oi_body1,
                        body2: oi_body2,
                        pos1: oi_anchor1,
                        pos2: oi_anchor2
                    };
                    break;
                case "Revolute":
                    anchor1 = joint.anchor1;
                    anchor2 = joint.anchor2;
                    let axis1 = joint.axis1;
                    let axis2 = joint.axis2;
                    oi_anchor1 = [anchor1.x, anchor1.y, anchor1.z];
                    oi_anchor2 = [anchor2.x, anchor2.y, anchor2.z];
                    let oi_axis1 = [axis1.x, axis1.y, axis1.z];
                    let oi_axis2 = [axis2.x, axis2.y, axis2.z];
                    oi_constraint = {
                        type: "jointHinge",
                        body1: oi_body1,
                        body2: oi_body2,
                        pos1: oi_anchor1,
                        pos2: oi_anchor2,
                        axe1: oi_axis1,
                        axe2: oi_axis2,
                    };
                    break;
            }

            this.world.add(oi_constraint);
        });
    }

    step(numVelIters) {
        if (!!this.world) {
            this.world.iterations = numVelIters;

            var t0 = new Date().getTime();
            this.world.step();
            this.stepTime = new Date().getTime() - t0;
        }
    }

    colliderPositions() {
        if (!!this.world) {
            let result = [];

            if (this.bodyMap) {
                this.bodyMap.forEach(oi_body => {
                    let t = oi_body.getPosition();
                    let r = oi_body.getQuaternion();
                    let entry = {
                        handle: oi_body.colliderHandle,
                        translation: {x: t.x, y: t.y, z: t.z},
                        rotation: {x: r.x, y: r.y, z: r.z, w: r.w}
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
