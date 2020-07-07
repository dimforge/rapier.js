import * as CANNONJS from 'cannon';
// import * as CANNONES from 'cannon-es';


class CannonBackend {
    constructor(CANNON, world, bodies, colliders, joints) {
        this.world = new CANNON.World();
        this.world.gravity = new CANNON.Vec3(0.0, -9.81, 0.0);
        this.world.solver.iterations = world.max_velocity_iterations;

        this.bodyMap = new Map(bodies.map(body => {
            let pos = body.translation;
            let mass = body.type == "dynamic" ? body.mass : 0.0;
            let ca_pos = new CANNON.Vec3(pos.x, pos.y, pos.z);
            let ca_body = new CANNON.Body({
                mass: mass,
                position: ca_pos,
            });
            this.world.addBody(ca_body);
            return [ body.handle, ca_body ];
        }));

        this.colliderMap = new Map(colliders.map(coll => {
           let parent_handle = coll.parent_handle;
           let ca_body = this.bodyMap.get(parent_handle);
           let ca_shape;

           switch (coll.type) {
               case 'Cuboid':
                   let he = coll.half_extents;
                   ca_shape = new CANNON.Box(new CANNON.Vec3(he.x, he.y, he.z));
                   break;
               case 'Ball':
                   let r = coll.radius;
                   ca_shape = new CANNON.Sphere(r);
                   break;
           }

            ca_body.addShape(ca_shape);

           return [coll.handle, ca_body];
        }));

        joints.forEach(joint => {
            let handle1 = joint.handle1;
            let handle2 = joint.handle2;
            let ca_body1 = this.bodyMap.get(handle1);
            let ca_body2 = this.bodyMap.get(handle2);
            let anchor1, anchor2, ca_anchor1, ca_anchor2;
            let ca_constraint;

            switch (joint.type) {
                case "Ball":
                    anchor1 = joint.anchor1;
                    anchor2 = joint.anchor2;
                    ca_anchor1 = new CANNON.Vec3(anchor1.x, anchor1.y, anchor1.z);
                    ca_anchor2 = new CANNON.Vec3(anchor2.x, anchor2.y, anchor2.z);
                    ca_constraint = new CANNON.PointToPointConstraint(ca_body1, ca_anchor1, ca_body2, ca_anchor2);
                    break;
                case "Revolute":
                    anchor1 = joint.anchor1;
                    anchor2 = joint.anchor2;
                    let axis1 = joint.axis1;
                    let axis2 = joint.axis2;
                    ca_anchor1 = new CANNON.Vec3(anchor1.x, anchor1.y, anchor1.z);
                    ca_anchor2 = new CANNON.Vec3(anchor2.x, anchor2.y, anchor2.z);
                    let ca_axis1 = new CANNON.Vec3(axis1.x, axis1.y, axis1.z);
                    let ca_axis2 = new CANNON.Vec3(axis2.x, axis2.y, axis2.z);
                    let ca_options = { pivotA: ca_anchor1, pivotB: ca_anchor2, axisA: ca_axis1, axisB: ca_axis2 };
                    ca_constraint = new CANNON.HingeConstraint(ca_body1, ca_body2, ca_options);
                    break;
            }

            this.world.addConstraint(ca_constraint);
        });
    }

    step(numVelIters) {
        if (!!this.world) {
            this.world.solver.iterations = numVelIters;

            var t0 = new Date().getTime();
            this.world.step(0.016);
            this.stepTime = new Date().getTime() - t0;
        }
    }

    colliderPositions() {
        if (!!this.world) {
            let result = [];

            if (this.colliderMap) {
                this.colliderMap.forEach((value, key) => {
                    let t = value.position;
                    let r = value.quaternion;
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
            }
        }
    }
}

export class CannonJSBackend extends CannonBackend {
    constructor(world, bodies, colliders, joints) {
        super(CANNONJS, world, bodies, colliders, joints)
    }
}

// It appears this does not work in a web worker?
// export class CannonESBackend extends CannonBackend {
//     constructor(world, bodies, colliders, joints) {
//         super(CANNONES, world, bodies, colliders, joints)
//     }
// }