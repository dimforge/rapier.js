import * as THREE from "three";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

const BOX_INSTANCE_INDEX = 0;
const BALL_INSTANCE_INDEX = 1;

var dummy = new THREE.Object3D();
var kk = 0;

export class Graphics {
    constructor(simulationParameters) {
        this.coll2gfx = new Map();
        this.colorIndex = 0;
        this.colorPalette = [0xF3D9B1, 0x98C1D9, 0x053C5E, 0x1F7A8C];
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xF9F9FF, 1);
        document.body.appendChild(this.renderer.domElement);

        let ambientLight = new THREE.AmbientLight(0x606060);
        this.scene.add(ambientLight);
        this.light = new THREE.PointLight(0xffffff, 1, 1000);
        this.scene.add(this.light);
        let me = this;

        function onWindowResize() {
            if (!!me.camera) {
                me.camera.aspect = window.innerWidth / window.innerHeight;
                me.camera.updateProjectionMatrix();
                me.renderer.setSize(window.innerWidth, window.innerHeight);
            }
        }

        window.addEventListener('resize', onWindowResize, false);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.2;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.initInstances();
    }

    initInstances() {
        this.instanceGroups = [];
        this.instanceGroups.push(this.colorPalette.map(color => {
            let box = new THREE.BoxGeometry(2.0, 2.0, 2.0);
            let mat = new THREE.MeshPhongMaterial({color: color, flatShading: true});
            return new THREE.InstancedMesh(box, mat, 1000);
        }));

        this.instanceGroups.push(this.colorPalette.map(color => {
            let ball = new THREE.SphereGeometry(1.0);
            let mat = new THREE.MeshPhongMaterial({color: color, flatShading: true});
            return new THREE.InstancedMesh(ball, mat, 1000);
        }));

        this.instanceGroups.forEach(groups => {
            groups.forEach(instance => {
                instance.count = 0;
                instance.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
                this.scene.add(instance);
            })
        });
    }

    render() {
        kk += 1;
        this.controls.update();
        // if (kk % 100 == 0) {
        //     console.log(this.camera.position);
        //     console.log(this.controls.target);
        // }
        this.light.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
        this.renderer.render(this.scene, this.camera);
    }

    lookAt(pos) {
        this.camera.position.set(pos.eye.x, pos.eye.y, pos.eye.z);
        this.controls.target.set(pos.target.x, pos.target.y, pos.target.z);
        this.controls.update();
    }

    updatePositions(positions) {
        positions.forEach(elt => {
            let gfx = this.coll2gfx.get(elt.handle);

            if (!!gfx) {
                let instance = this.instanceGroups[gfx.groupId][gfx.instanceId];
                instance.instanceMatrix.needsUpdate = true;
                dummy.scale.set(gfx.scale.x, gfx.scale.y, gfx.scale.z);
                dummy.position.set(elt.translation.x, elt.translation.y, elt.translation.z);
                dummy.quaternion.set(elt.rotation.x, elt.rotation.y, elt.rotation.z, elt.rotation.w);
                dummy.updateMatrix();
                instance.setMatrixAt(gfx.elementId, dummy.matrix);
            }
        })
    }

    reset() {
        this.instanceGroups.forEach(groups => {
            groups.forEach(instance => {
                instance.count = 0;
            })
        });

        this.coll2gfx = new Map();
        this.colorIndex = 0;
    }

    addCollider(RAPIER, world, collider) {
        let parent = world.getRigidBody(collider.parent());
        let instance;
        let instanceDesc = {
            groupId: 0,
            instanceId: parent.isStatic() ? 0 : (this.colorIndex + 1),
            elementId: 0,
        };

        switch (collider.shapeType()) {
            case RAPIER.ShapeType.Cuboid:
                let hext = collider.halfExtents();
                instance = this.instanceGroups[BOX_INSTANCE_INDEX][instanceDesc.instanceId];
                instanceDesc.groupId = BOX_INSTANCE_INDEX;
                instanceDesc.elementId = instance.count;
                instanceDesc.scale = new THREE.Vector3(hext.x, hext.y, hext.z);
                instance.count += 1;
                break;
            case RAPIER.ShapeType.Ball:
                let rad = collider.radius();
                instance = this.instanceGroups[BALL_INSTANCE_INDEX][instanceDesc.instanceId];
                instanceDesc.groupId = BALL_INSTANCE_INDEX;
                instanceDesc.elementId = instance.count;
                instanceDesc.scale = new THREE.Vector3(rad, rad, rad);
                instance.count += 1;
                break;
            default:
                console.log("Unknown shape to render.");
                break;
        }

        let t = collider.translation();
        let r = collider.rotation();
        dummy.position.set(t.x, t.y, t.z);
        dummy.quaternion.set(r.x, r.y, r.z, r.w);
        dummy.scale.set(instanceDesc.scale.x, instanceDesc.scale.y, instanceDesc.scale.z);
        dummy.updateMatrix();
        instance.setMatrixAt(instanceDesc.elementId, dummy.matrix);
        instance.instanceMatrix.needsUpdate = true;

        this.coll2gfx.set(collider.handle, instanceDesc);
        this.colorIndex = (this.colorIndex + 1) % (this.colorPalette.length - 1);
    }
}
