import * as PhysX from 'physx-js'

export class PhysXBackend {
    constructor(world, bodies, colliders, joints) {
        var me = this;
        PhysX().then(function(PhysX) {
            const version = PhysX.PX_PHYSICS_VERSION;
            const defaultErrorCallback = new PhysX.PxDefaultErrorCallback();
            const allocator = new PhysX.PxDefaultAllocator();
            const foundation = PhysX.PxCreateFoundation(
                version,
                allocator,
                defaultErrorCallback
            );
            const triggerCallback = {
                onContactBegin: () => {},
                onContactEnd: () => {},
                onContactPersist: () => {},
                onTriggerBegin: () => {},
                onTriggerEnd: () => {},
            };
            const physxSimulationCallbackInstance = PhysX.PxSimulationEventCallback.implement(
                triggerCallback
            );

            me.physics = PhysX.PxCreatePhysics(
                version,
                foundation,
                new PhysX.PxTolerancesScale(),
                false,
                null
            );
            PhysX.PxInitExtensions(me.physics, null);
            let sceneDesc = PhysX.getDefaultSceneDesc(
                me.physics.getTolerancesScale(),
                0,
                physxSimulationCallbackInstance
            );
            me.world = me.physics.createScene(sceneDesc);

            me.bodyMap = new Map(bodies.map(body => {
                let pos = body.translation;
                let pxPos = {
                    translation: { x: pos.x, y: pos.y, z: pos.z },
                    rotation: { w: 1.0, x: 0.0, y: 0.0, z: 0.0 }
                };

                let pxBody = body.type == "dynamic" ? me.physics.createRigidDynamic(pxPos) : me.physics.createRigidStatic(pxPos);
                me.world.addActor(pxBody, null);
                return [ body.handle, pxBody ];
            }));

            me.colliderMap = new Map(colliders.map(coll => {
                let handle = coll.parentHandle;
                let pxBody = me.bodyMap.get(handle);
                let pxGeom;

                switch (coll.type) {
                    case 'Cuboid':
                        let he = coll.halfExtents;
                        pxGeom = new PhysX.PxBoxGeometry(he.x, he.y, he.z);
                        break;
                    case 'Ball':
                        let r = coll.radius;
                        pxGeom = new PhysX.PxSphereGeometry(r);
                        break;
                }

                let pxMaterial = me.physics.createMaterial(coll.friction, coll.friction, 0.0);
                const pxFlags = new PhysX.PxShapeFlags(PhysX.PxShapeFlag.eSIMULATION_SHAPE.value);
                const pxShape = me.physics.createShape(pxGeom, pxMaterial, false, pxFlags);
                pxBody.attachShape(pxShape);

                return [ coll.handle, pxBody ];
            }));

            joints.forEach(joint => {
                let handle1 = joint.handle1;
                let handle2 = joint.handle2;
                let pxBody1 = me.bodyMap.get(handle1);
                let pxBody2 = me.bodyMap.get(handle2);
                let anchor1, anchor2, pxAnchor1, pxAnchor2;
                let pxConstraint;

                switch (joint.type) {
                    case "Ball":
                        anchor1 = joint.anchor1;
                        anchor2 = joint.anchor2;
                        pxAnchor1 = {
                            translation: { x: anchor1.x, y: anchor1.y, z: anchor1.z },
                            rotation: { w: 1.0, x: 0.0, y: 0.0, z: 0.0 }
                        };
                        pxAnchor2 = {
                            translation: { x: anchor2.x, y: anchor2.y, z: anchor2.z },
                            rotation: { w: 1.0, x: 0.0, y: 0.0, z: 0.0 }
                        };
                        pxConstraint = PhysX.PxSphericalJointCreate(me.physics, pxBody1, pxAnchor1, pxBody2, pxAnchor2);
                        break;
                    case "Revolute":
                        anchor1 = joint.anchor1;
                        anchor2 = joint.anchor2;
                        let frame1 = joint.frameX1;
                        let frame2 = joint.frameX2;

                        pxAnchor1 = {
                            translation: { x: anchor1.x, y: anchor1.y, z: anchor1.z },
                            rotation: { w: frame1.w, x: frame1.x, y: frame1.y, z: frame1.z }
                        };
                        pxAnchor2 = {
                            translation: { x: anchor2.x, y: anchor2.y, z: anchor2.z },
                            rotation: { w: frame2.w, x: frame2.x, y: frame2.y, z: frame2.z }
                        };
                        pxConstraint = PhysX.PxRevoluteJointCreate(me.physics, pxBody1, pxAnchor1, pxBody2, pxAnchor2);
                        break;
                    default:
                        return;
                }
            });

            me.PHYSX = PhysX;

        });
    }

    step(numVelIters, numPosIters) {
        if (!!this.PHYSX && !!this.world) {
            // TODO: it appears we can't change the number of iterations
            // for the PhysX backend yet. It has to be changed on each body
            // but the relevant bindings don't appear to be there.
            var t0 = new Date().getTime();
            this.world.simulate(0.016, true);
            this.world.fetchResults(true);
            this.stepTime = new Date().getTime() - t0;
        }
    }

    colliderPositions() {
        if (!!this.PHYSX && !!this.world) {
            let result = [];

            if (this.colliderMap) {
                this.colliderMap.forEach((pxBody, handle) => {
                    let pxPos = pxBody.getGlobalPose();
                    let t = pxPos.translation;
                    let r = pxPos.rotation;
                    let entry = {
                        handle: handle,
                        translation: {x: t.x, y: t.y, z: t.z},
                        rotation: {x: r.x, y: r.y, z: r.z, w: r.w}
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
