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

            this.bodyRevMap.delete(raBody.handle);
            this.bodyMap.delete(handle);
            this.world.removeRigidBody(raBody);
        }
    }

    addRigidBody(body) {
        let bodyDesc = new this.RAPIER.RigidBodyDesc(body.type)
            .setTranslation(body.translation)
            .setLinvel(body.linvel);
        let raBody = this.world.createRigidBody(bodyDesc);

        this.bodyMap.set(body.handle, raBody);
        this.bodyRevMap.set(raBody.handle, body.handle);
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
        }

        if (!!colliderDesc) {
            colliderDesc.density = coll.density;
            colliderDesc.isSensor = coll.isSensor;
            raCollider = this.world.createCollider(colliderDesc, parentHandle);
        } else {
            console.log("Could not build collider from desc: ", coll);
        }

        this.colliderMap.set(coll.handle, raCollider);
        this.colliderRevMap.set(raCollider.handle, coll.handle);
    }

    addJoint(joint) {
        let raBody1 = this.bodyMap.get(joint.handle1);
        let raBody2 = this.bodyMap.get(joint.handle2);
        let anchor1, anchor2, raAnchor1, raAnchor2;
        let raJointParams;

        switch (joint.type) {
            case this.RAPIER.JointType.Ball:
                anchor1 = joint.anchor1;
                anchor2 = joint.anchor2;
                raAnchor1 = new this.RAPIER.Vector3(anchor1.x, anchor1.y, anchor1.z);
                raAnchor2 = new this.RAPIER.Vector3(anchor2.x, anchor2.y, anchor2.z);
                raJointParams = this.RAPIER.JointParams.ball(raAnchor1, raAnchor2);
                break;
            case this.RAPIER.JointType.Revolute:
                anchor1 = joint.anchor1;
                anchor2 = joint.anchor2;
                let axis1 = joint.axis1;
                let axis2 = joint.axis2;
                raAnchor1 = new this.RAPIER.Vector3(anchor1.x, anchor1.y, anchor1.z);
                raAnchor2 = new this.RAPIER.Vector3(anchor2.x, anchor2.y, anchor2.z);
                let raAxis1 = new this.RAPIER.Vector3(axis1.x, axis1.y, axis1.z);
                let raAxis2 = new this.RAPIER.Vector3(axis2.x, axis2.y, axis2.z);
                raJointParams = this.RAPIER.JointParams.revolute(raAnchor1, raAxis1, raAnchor2, raAxis2);
                break;
        }

        this.world.createJoint(raJointParams, raBody1, raBody2);
    }

    constructor(RAPIER, world, bodies, colliders, joints) {
        this.colliderMap = new Map();
        this.bodyMap = new Map();
        this.colliderRevMap = new Map();
        this.bodyRevMap = new Map();
        let gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
        let raWorld = new RAPIER.World(gravity);
        this.world = raWorld;
        this.events = new RAPIER.EventQueue(true);
        this.RAPIER = RAPIER;

        raWorld.maxVelocityIterations = world.maxVelocityIterations;
        raWorld.maxPositionIterations = world.maxPositionIterations;

        bodies.forEach(body => this.addRigidBody(body));
        colliders.forEach(coll => this.addCollider(coll));
        joints.forEach(joint => this.addJoint(joint));
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

    castRay(ray) {
        if (!!this.world) {
            return this.world.castRay({origin: ray.origin, dir: ray.direction}, 1000.0);
        } else {
            return null;
        }
    }

    colliderPositions() {
        if (!!this.world) {
            let result = [];

            if (this.colliderMap) {
                this.colliderMap.forEach((value, key) => {
                    if (value.isValid()) {
                        let t = value.translation();
                        let r = value.rotation();
                        let entry = {
                            handle: key,
                            translation: {x: t.x, y: t.y, z: t.z},
                            rotation: {x: r.x, y: r.y, z: r.z, w: r.w}
                        };
                        result.push(entry)
                    }
                });
            }

            return {
                stepTime: this.stepTime,
                positions: result,
            };
        }
    }
}