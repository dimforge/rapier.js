import * as Ammo from './ammo.js'
import * as AmmoWasm from './ammo.wasm.js'


class AmmoBackend {
    constructor(Ammo, world, bodies, colliders, joints) {
        var me = this;
        Ammo().then(function(Ammo) {
            let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
            let dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
            let overlappingPairCache = new Ammo.btDbvtBroadphase();
            let solver = new Ammo.btSequentialImpulseConstraintSolver();
            me.world = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
            me.world.setGravity(new Ammo.btVector3(0, -9.81, 0));
            me.world.getSolverInfo().set_m_numIterations(world.maxVelocityIterations);

            let body2colliders = new Map();
            colliders.forEach(coll => {
                if (!body2colliders.get(coll.parentHandle)) {
                    body2colliders.set(coll.parentHandle, []);
                }

                body2colliders.get(coll.parentHandle).push(coll);
            });

            me.bodyMap = new Map(bodies.map(body => {
                let pos = body.translation;

                let amPos = new Ammo.btTransform();
                amPos.setIdentity();
                amPos.getOrigin().setX(pos.x);
                amPos.getOrigin().setY(pos.y);
                amPos.getOrigin().setZ(pos.z);

                let collider = body2colliders.get(body.handle)[0];
                let amShape;

                switch (collider.type) {
                    case 'Ball':
                        let r = collider.radius;
                        amShape = new Ammo.btSphereShape(r);
                        break;
                    case 'Cuboid':
                        let he = collider.halfExtents;
                        amShape = new Ammo.btBoxShape(new Ammo.btVector3(he.x, he.y, he.z));
                        break;
                }

                let amMass = body.type == "dynamic" ? body.mass : 0.0;
                let amInertia = new Ammo.btVector3(0.0, 0.0, 0.0);
                amShape.calculateLocalInertia(amMass, amInertia);

                let amMotionState = new Ammo.btDefaultMotionState(amPos);
                let amBodyInfo = new Ammo.btRigidBodyConstructionInfo(amMass, amMotionState, amShape, amInertia);
                amBodyInfo.set_m_friction(collider.friction);
                let amBody = new Ammo.btRigidBody(amBodyInfo);
                me.world.addRigidBody(amBody);
                amBody.colliderHandle = collider.handle;
                return [ body.handle, amBody ];
            }));

            joints.forEach(joint => {
                let handle1 = joint.handle1;
                let handle2 = joint.handle2;
                let amBody1 = me.bodyMap.get(handle1);
                let amBody2 = me.bodyMap.get(handle2);
                let anchor1, anchor2, amAnchor1, amAnchor2;
                let amConstraint;

                switch (joint.type) {
                    case "Ball":
                        anchor1 = joint.anchor1;
                        anchor2 = joint.anchor2;
                        amAnchor1 = new Ammo.btVector3(anchor1.x, anchor1.y, anchor1.z);
                        amAnchor2 = new Ammo.btVector3(anchor2.x, anchor2.y, anchor2.z);
                        amConstraint = new Ammo.btPoint2PointConstraint(amBody1, amBody2, amAnchor1, amAnchor2);
                        break;
                    case "Revolute":
                        anchor1 = joint.anchor1;
                        anchor2 = joint.anchor2;
                        let axis1 = joint.axis1;
                        let axis2 = joint.axis2;
                        amAnchor1 = new Ammo.btVector3(anchor1.x, anchor1.y, anchor1.z);
                        amAnchor2 = new Ammo.btVector3(anchor2.x, anchor2.y, anchor2.z);
                        let amAxis1 = new Ammo.btVector3(axis1.x, axis1.y, axis1.z);
                        let amAxis2 = new Ammo.btVector3(axis2.x, axis2.y, axis2.z);
                        amConstraint = new Ammo.btHingeConstraint(amBody1, amBody2, amAnchor1, amAnchor2, amAxis1, amAxis2);
                        break;
                    default:
                        return;
                }

                me.world.addConstraint(amConstraint);
            });

            me.AMMO = Ammo;
        });
    }

    step(numVelIters) {
        if (!!this.AMMO && !!this.world) {
            this.world.getSolverInfo().set_m_numIterations(numVelIters);

            var t0 = new Date().getTime();
            this.world.stepSimulation(0.016);
            this.stepTime = new Date().getTime() - t0;
        }
    }

    colliderPositions() {
        if (!!this.AMMO && !!this.world) {
            let result = [];
            let transform = new this.AMMO.btTransform();

            if (this.bodyMap) {
                this.bodyMap.forEach(amBody => {
                    amBody.getMotionState().getWorldTransform(transform);
                    let t = transform.getOrigin();
                    let r = transform.getRotation();
                    let entry = {
                        handle: amBody.colliderHandle,
                        translation: {x: t.x(), y: t.y(), z: t.z()},
                        rotation: {x: r.x(), y: r.y(), z: r.z(), w: r.w()}
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

export class AmmoJSBackend extends AmmoBackend {
    constructor(world, bodies, colliders, joints) {
        super(Ammo, world, bodies, colliders, joints)
    }
}

export class AmmoWASMBackend extends AmmoBackend {
    constructor(world, bodies, colliders, joints) {
        super(AmmoWasm, world, bodies, colliders, joints)
    }
}