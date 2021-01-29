import md5 from 'md5';
import crc32 from 'buffer-crc32'

export class RapierBackend {
    removeRigidBody(handle) {
        let raBody = this.bodyMap.get(handle);

        if (raBody.isValid()) {
            let i;

            for (i = 0; i < raBody.numColliders(); ++i) {
                let collider = raBody.collider(i);
                this.colliderMap.delete(collider);
            }

            this.bodyMap.delete(handle);
            this.world.removeRigidBody(raBody);
        }
    }

    addRigidBody(body) {
        let bodyDesc = new this.RAPIER.RigidBodyDesc(body.type)
            .setTranslation(body.translation.x, body.translation.y)
            .setLinvel(body.linvel)
            .setAngvel(body.angvel)
            .setLinearDamping(body.linearDamping)
            .setAngularDamping(body.angularDamping);
        let raBody = this.world.createRigidBody(bodyDesc);
        this.bodyMap.set(body.handle, raBody);
    }

    addCollider(coll) {
        let parentHandle = coll.parentHandle;
        let colliderDesc = null;
        let raCollider = null;
        let r = 0.0;
        let hh = 0.0;
        let rr = 0.0;

        switch (coll.type) {
            case this.RAPIER.ShapeType.Cuboid:
                let he = coll.halfExtents;
                colliderDesc = this.RAPIER.ColliderDesc.cuboid(he.x, he.y, he.z);
                break;
            case this.RAPIER.ShapeType.Ball:
                r = coll.radius;
                colliderDesc = this.RAPIER.ColliderDesc.ball(r);
                break;
            case this.RAPIER.ShapeType.Capsule:
                r = coll.radius;
                hh = coll.halfHeight;
                colliderDesc = this.RAPIER.ColliderDesc.capsule(hh, r);
                break;
            case this.RAPIER.ShapeType.Cylinder:
                r = coll.radius;
                hh = coll.halfHeight;
                colliderDesc = this.RAPIER.ColliderDesc.cylinder(hh, r);
                break;
            case this.RAPIER.ShapeType.RoundCylinder:
                r = coll.radius;
                hh = coll.halfHeight;
                rr = coll.roundRadius;
                colliderDesc = this.RAPIER.ColliderDesc.roundCylinder(hh, r, rr);
                break;
            case this.RAPIER.ShapeType.Cone:
                r = coll.radius;
                hh = coll.halfHeight;
                colliderDesc = this.RAPIER.ColliderDesc.cone(hh, r);
                break;
            case this.RAPIER.ShapeType.TriMesh:
                let vertices = coll.trimeshVertices;
                let indices = coll.trimeshIndices;
                colliderDesc = this.RAPIER.ColliderDesc.trimesh(vertices, indices);
                break;
            case this.RAPIER.ShapeType.HeightField:
                let heights = coll.heightfieldHeights;
                let nrows = coll.heightfieldNRows;
                let ncols = coll.heightfieldNCols;
                let scale = coll.heightfieldScale;
                colliderDesc = this.RAPIER.ColliderDesc.heightfield(nrows, ncols, heights, scale);
                break;
        }

        if (!!colliderDesc) {
            colliderDesc.density = coll.density;
            colliderDesc.isSensor = coll.isSensor;
            raCollider = this.world.createCollider(colliderDesc, parentHandle);
        } else {
            console.log("Could not build collider from desc: ", coll);
        }

        this.colliderMap.set(coll.handle, raCollider);
    }

    addJoint(joint) {
        let raBody1 = this.bodyMap.get(joint.handle1);
        let raBody2 = this.bodyMap.get(joint.handle2);
        let anchor1, anchor2, raAnchor1, raAnchor2;
        let raJointParams;

        switch (joint.type) {
            case this.RAPIER.JointType.Ball:
                raJointParams = this.RAPIER.JointParams.ball(joint.anchor1, joint.anchor2);
                break;
            case this.RAPIER.JointType.Revolute:
                raJointParams = this.RAPIER.JointParams.revolute(
                    joint.anchor1,
                    joint.axis1,
                    joint.anchor2,
                    joint.axis2
                );
                break;
            case this.RAPIER.JointType.Fixed:
                raJointParams = this.RAPIER.JointParams.fixed(
                    joint.anchor1,
                    joint.frameX1,
                    joint.anchor2,
                    joint.frameX2,
                );
                break;
            case this.RAPIER.JointType.Prismatic:
                raJointParams = this.RAPIER.JointParams.prismatic(
                    joint.anchor1,
                    joint.axis1,
                    joint.tangent1,
                    joint.anchor2,
                    joint.axis2,
                    joint.tangent2,
                );
                raJointParams.limitsEnabled = joint.limitsEnabled;
                raJointParams.limits = [joint.limitsMin, joint.limitsMax];
                break;
        }

        this.world.createJoint(raJointParams, raBody1, raBody2);
    }

    constructor(RAPIER) {
        this.colliderMap = new Map();
        this.bodyMap = new Map();
        this.events = new RAPIER.EventQueue(true);
        this.RAPIER = RAPIER;
    }

    applyModifications(modifications) {
        if (!!modifications) {
            modifications.addRigidBody.forEach(body => this.addRigidBody(body));
            modifications.addCollider.forEach(collider => this.addCollider(collider));
            modifications.removeRigidBody.forEach(handle => this.removeRigidBody(handle));
        }
    }

    worldHash() {
        let snap = new Buffer(this.world.takeSnapshot());
        return crc32(snap); // .toString();
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
            this.world = this.RAPIER.World.restoreSnapshot(snapshot);

            if (!!oldWorld) {
                oldWorld.free();
            }

            // Restoring the snapshot creates a new physics world, so this
            // invalidates all our internal references to bodies, colliders, and joints.
            this.colliderMap = new Map();
            this.bodyMap = new Map();

            this.world.forEachCollider(collider => {
                this.colliderMap.set(collider.handle, collider);
            });

            this.world.forEachRigidBody(body => {
                this.bodyMap.set(body.handle, body);
            });
            console.log("Restoring snapshot.");
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

    castRay(ray) {
        if (!!this.world) {
            return this.world.castRay({origin: ray.origin, dir: ray.direction}, 1000.0);
        } else {
            return null;
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
                        rotation: r
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