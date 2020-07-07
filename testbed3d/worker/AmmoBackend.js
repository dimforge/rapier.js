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
            me.world.getSolverInfo().set_m_numIterations(world.max_velocity_iterations);

            let body2colliders = new Map();
            colliders.forEach(coll => {
                if (!body2colliders.get(coll.parent_handle)) {
                    body2colliders.set(coll.parent_handle, []);
                }

                body2colliders.get(coll.parent_handle).push(coll);
            });

            me.bodyMap = new Map(bodies.map(body => {
                let pos = body.translation;

                let am_pos = new Ammo.btTransform();
                am_pos.setIdentity();
                am_pos.getOrigin().setX(pos.x);
                am_pos.getOrigin().setY(pos.y);
                am_pos.getOrigin().setZ(pos.z);

                let collider = body2colliders.get(body.handle)[0];
                let am_shape;

                switch (collider.type) {
                    case 'Ball':
                        let r = collider.radius;
                        am_shape = new Ammo.btSphereShape(r);
                        break;
                    case 'Cuboid':
                        let he = collider.half_extents;
                        am_shape = new Ammo.btBoxShape(new Ammo.btVector3(he.x, he.y, he.z));
                        break;
                }

                let am_mass = body.type == "dynamic" ? body.mass : 0.0;
                let am_inertia = new Ammo.btVector3(0.0, 0.0, 0.0);
                am_shape.calculateLocalInertia(am_mass, am_inertia);

                let am_motionState = new Ammo.btDefaultMotionState(am_pos);
                let am_bodyInfo = new Ammo.btRigidBodyConstructionInfo(am_mass, am_motionState, am_shape, am_inertia);
                am_bodyInfo.set_m_friction(collider.friction);
                let am_body = new Ammo.btRigidBody(am_bodyInfo);
                me.world.addRigidBody(am_body);
                am_body.colliderHandle = collider.handle;
                return [ body.handle, am_body ];
            }));

            joints.forEach(joint => {
                let handle1 = joint.handle1;
                let handle2 = joint.handle2;
                let am_body1 = me.bodyMap.get(handle1);
                let am_body2 = me.bodyMap.get(handle2);
                let anchor1, anchor2, am_anchor1, am_anchor2;
                let am_constraint;

                switch (joint.type) {
                    case "Ball":
                        anchor1 = joint.anchor1;
                        anchor2 = joint.anchor2;
                        am_anchor1 = new Ammo.btVector3(anchor1.x, anchor1.y, anchor1.z);
                        am_anchor2 = new Ammo.btVector3(anchor2.x, anchor2.y, anchor2.z);
                        am_constraint = new Ammo.btPoint2PointConstraint(am_body1, am_body2, am_anchor1, am_anchor2);
                        break;
                    case "Revolute":
                        anchor1 = joint.anchor1;
                        anchor2 = joint.anchor2;
                        let axis1 = joint.axis1;
                        let axis2 = joint.axis2;
                        am_anchor1 = new Ammo.btVector3(anchor1.x, anchor1.y, anchor1.z);
                        am_anchor2 = new Ammo.btVector3(anchor2.x, anchor2.y, anchor2.z);
                        let am_axis1 = new Ammo.btVector3(axis1.x, axis1.y, axis1.z);
                        let am_axis2 = new Ammo.btVector3(axis2.x, axis2.y, axis2.z);
                        am_constraint = new Ammo.btHingeConstraint(am_body1, am_body2, am_anchor1, am_anchor2, am_axis1, am_axis2);
                        break;
                    default:
                        return;
                }

                me.world.addConstraint(am_constraint);
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
                this.bodyMap.forEach(am_body => {
                    am_body.getMotionState().getWorldTransform(transform);
                    let t = transform.getOrigin();
                    let r = transform.getRotation();
                    let entry = {
                        handle: am_body.colliderHandle,
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