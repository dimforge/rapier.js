import * as CANNONJS from 'cannon';
import {BodyStatus, JointType, ShapeType} from "@dimforge/rapier3d";

// import * as CANNONES from 'cannon-es';


class CannonBackend {
    constructor(CANNON, world, bodies, colliders, joints) {
        this.world = new CANNON.World();
        this.world.gravity = new CANNON.Vec3(0.0, -9.81, 0.0);
        this.world.solver.iterations = world.maxVelocityIterations;

        this.bodyMap = new Map(bodies.map(body => {
            let pos = body.translation;
            let mass = body.type == BodyStatus.Dynamic ? body.mass : 0.0;
            let caPos = new CANNON.Vec3(pos.x, pos.y, pos.z);
            let caBody = new CANNON.Body({
                mass: mass,
                position: caPos,
            });
            this.world.addBody(caBody);
            return [body.handle, caBody];
        }));

        this.colliderMap = new Map(colliders.map(coll => {
            let parentHandle = coll.parentHandle;
            let caBody = this.bodyMap.get(parentHandle);
            let caShape;

            switch (coll.type) {
                case ShapeType.Cuboid:
                    let he = coll.halfExtents;
                    caShape = new CANNON.Box(new CANNON.Vec3(he.x, he.y, he.z));
                    break;
                case ShapeType.Ball:
                    let r = coll.radius;
                    caShape = new CANNON.Sphere(r);
                    break;
            }

            caBody.addShape(caShape);

            return [coll.handle, caBody];
        }));

        joints.forEach(joint => {
            let handle1 = joint.handle1;
            let handle2 = joint.handle2;
            let caBody1 = this.bodyMap.get(handle1);
            let caBody2 = this.bodyMap.get(handle2);
            let anchor1, anchor2, caAnchor1, caAnchor2;
            let caConstraint;

            switch (joint.type) {
                case JointType.Ball:
                    anchor1 = joint.anchor1;
                    anchor2 = joint.anchor2;
                    caAnchor1 = new CANNON.Vec3(anchor1.x, anchor1.y, anchor1.z);
                    caAnchor2 = new CANNON.Vec3(anchor2.x, anchor2.y, anchor2.z);
                    caConstraint = new CANNON.PointToPointConstraint(caBody1, caAnchor1, caBody2, caAnchor2);
                    break;
                case JointType.Revolute:
                    anchor1 = joint.anchor1;
                    anchor2 = joint.anchor2;
                    let axis1 = joint.axis1;
                    let axis2 = joint.axis2;
                    caAnchor1 = new CANNON.Vec3(anchor1.x, anchor1.y, anchor1.z);
                    caAnchor2 = new CANNON.Vec3(anchor2.x, anchor2.y, anchor2.z);
                    let caAxis1 = new CANNON.Vec3(axis1.x, axis1.y, axis1.z);
                    let caAxis2 = new CANNON.Vec3(axis2.x, axis2.y, axis2.z);
                    let caOptions = {pivotA: caAnchor1, pivotB: caAnchor2, axisA: caAxis1, axisB: caAxis2};
                    caConstraint = new CANNON.HingeConstraint(caBody1, caBody2, caOptions);
                    break;
            }

            this.world.addConstraint(caConstraint);
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

    free() {
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