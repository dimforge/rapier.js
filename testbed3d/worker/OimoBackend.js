import * as OIMO from 'oimo';


export class OimoBackend {
    constructor(world, bodies, colliders, joints) {
        this.world = new OIMO.World({
            timestep: 0.016,
            iterations: world.maxVelocityIterations,
            broadphase: 2,
            worldscale: 1,
            random: false,
            info: false,
            gravity: [0, -9.81, 0]
        });

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
            let oiType;
            let oiSize;

            switch (collider.type) {
                case 'Ball':
                    let r = collider.radius;
                    oiType = 'sphere';
                    oiSize = [r, r, r];
                    break;
                case 'Cuboid':
                    let he = collider.halfExtents;
                    oiType = 'box';
                    oiSize = [he.x * 2.0, he.y * 2.0, he.z * 2.0];
                    break;
            }

            let oiBodyDesc = {
                type: oiType,
                size: oiSize,
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
                delete oiBodyDesc.density;
            }

            let oiBody = this.world.add(oiBodyDesc);
            oiBody.colliderHandle = collider.handle;

            return [ body.handle, oiBody ];
        }));

        joints.forEach(joint => {
            let handle1 = joint.handle1;
            let handle2 = joint.handle2;
            let oiBody1 = this.bodyMap.get(handle1);
            let oiBody2 = this.bodyMap.get(handle2);
            let anchor1, anchor2, oiAncho1, oiAncho2;
            let oiConstraint;

            switch (joint.type) {
                case "Ball":
                    anchor1 = joint.anchor1;
                    anchor2 = joint.anchor2;
                    oiAncho1 = [anchor1.x, anchor1.y, anchor1.z];
                    oiAncho2 = [anchor2.x, anchor2.y, anchor2.z];
                    oiConstraint = {
                        type: "jointBall",
                        body1: oiBody1,
                        body2: oiBody2,
                        pos1: oiAncho1,
                        pos2: oiAncho2
                    };
                    break;
                case "Revolute":
                    anchor1 = joint.anchor1;
                    anchor2 = joint.anchor2;
                    let axis1 = joint.axis1;
                    let axis2 = joint.axis2;
                    oiAncho1 = [anchor1.x, anchor1.y, anchor1.z];
                    oiAncho2 = [anchor2.x, anchor2.y, anchor2.z];
                    let oiAxis1 = [axis1.x, axis1.y, axis1.z];
                    let oiAxis2 = [axis2.x, axis2.y, axis2.z];
                    oiConstraint = {
                        type: "jointHinge",
                        body1: oiBody1,
                        body2: oiBody2,
                        pos1: oiAncho1,
                        pos2: oiAncho2,
                        axe1: oiAxis1,
                        axe2: oiAxis2,
                    };
                    break;
            }

            this.world.add(oiConstraint);
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
                this.bodyMap.forEach(oiBody => {
                    let t = oiBody.getPosition();
                    let r = oiBody.getQuaternion();
                    let entry = {
                        handle: oiBody.colliderHandle,
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
