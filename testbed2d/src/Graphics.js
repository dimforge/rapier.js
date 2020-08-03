import * as PIXI from "pixi.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const BOX_INSTANCE_INDEX = 0;
const BALL_INSTANCE_INDEX = 1;

var dummy = new PIXI.Object3D();
var kk = 0;

export class Graphics {
    constructor(simulationParameters) {
        this.coll2gfx = new Map();
        this.colorIndex = 0;
        this.colorPalette = [ 0xF3D9B1, 0x98C1D9, 0x053C5E, 0x1F7A8C ];
        this.renderer = new PIXI.Renderer({
            antialias: true
        });
        this.scene = new PIXI.Container();
        document.body.appendChild(this.renderer.view);

        this.renderer.view.style.position = "absolute";
        this.renderer.view.style.display = "block";
        this.renderer.autoResize = true;
        this.renderer.resize(window.innerWidth, window.innerHeight);

        // let me = this;
        //
        // function onWindowResize() {
        //     if (!!me.camera) {
        //         me.camera.aspect = window.innerWidth / window.innerHeight;
        //         me.camera.updateProjectionMatrix();
        //         me.renderer.setSize(window.innerWidth, window.innerHeight);
        //     }
        // }
        //
        // window.addEventListener('resize', onWindowResize, false);

        this.initInstances();
    }

    initInstances() {
        this.instanceGroups = [];
        this.instanceGroups.push(this.colorPalette.map(color => {
            let box = new PIXI.Rectangle(0.0, 0.0, 2.0, 2.0);
            let fill = new PIXI.FillStyle();
            let geom = new PIXI.GraphicsGeometry();
            fill.color = color;
            geom.drawShape(box, fill);
            return geom;
        }));

        this.instanceGroups.push(this.colorPalette.map(color => {
            let ball = new PIXI.Circle(0.0, 0.0, 1.0);
            let fill = new PIXI.FillStyle();
            let geom = new PIXI.GraphicsGeometry();
            fill.color = color;
            geom.drawShape(ball, fill);
            return geom;
        }));
    }

    render() {
        kk += 1;
        this.renderer.render(this.scene);
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

    addCollider(collider) {
        let instance;
        let instanceDesc = {
            groupId: 0,
            instanceId: collider.parent().isStatic() ? 0 : (this.colorIndex + 1),
            elementId: 0,
        };

        switch (collider.shapeType()) {
            case 'Cuboid':
                let hext = collider.halfExtents();
                instance = this.instanceGroups[BOX_INSTANCE_INDEX][instanceDesc.instanceId];
                instanceDesc.groupId = BOX_INSTANCE_INDEX;
                instanceDesc.elementId = instance.count;
                instanceDesc.scale = new PIXI.Vector3(hext.x, hext.y, hext.z);
                instance.count += 1;
                break;
            case 'Ball':
                let rad = collider.radius();
                instance = this.instanceGroups[BALL_INSTANCE_INDEX][instanceDesc.instanceId];
                instanceDesc.groupId = BALL_INSTANCE_INDEX;
                instanceDesc.elementId = instance.count;
                instanceDesc.scale = new PIXI.Vector3(rad, rad, rad);
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

        this.coll2gfx.set(collider.handle(), instanceDesc);
        this.colorIndex = (this.colorIndex + 1) % (this.colorPalette.length - 1);
    }
}
