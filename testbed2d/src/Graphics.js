import * as PIXI from "pixi.js";
import {Viewport} from "pixi-viewport";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

const BOX_INSTANCE_INDEX = 0;
const BALL_INSTANCE_INDEX = 1;

var kk = 0;

export class Graphics {
    constructor(simulationParameters) {
        // High pixel Ratio make the rendering extremely slow, so we cap it.
        const pixelRatio = window.devicePixelRatio ? Math.min(window.devicePixelRatio, 1.5) : 1;

        this.coll2gfx = new Map();
        this.colorIndex = 0;
        this.colorPalette = [0xF3D9B1, 0x98C1D9, 0x053C5E, 0x1F7A8C];
        this.renderer = new PIXI.Renderer({
            backgroundColor: 0x292929,
            antialias: true,
            resolution: pixelRatio,
            autoResize: true
        });

        this.renderer.resize(window.innerWidth, window.innerHeight);
        this.scene = new PIXI.Container();
        document.body.appendChild(this.renderer.view);

        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 1000,
            worldHeight: 1000,
            interaction: this.renderer.plugins.interaction
        });

        this.scene.addChild(this.viewport);
        this.viewport
            .drag()
            .pinch()
            .wheel()
            .decelerate();

        let me = this;

        function onWindowResize() {
            me.renderer.resize(window.innerWidth, window.innerHeight);
        }

        function onContextMenu(event) {
            event.preventDefault();
        }

        document.oncontextmenu = onContextMenu;
        document.body.oncontextmenu = onContextMenu;

        window.addEventListener('resize', onWindowResize, false);

        this.initInstances();
    }

    initInstances() {
        this.instanceGroups = [];
        this.instanceGroups.push(this.colorPalette.map(color => {
            let graphics = new PIXI.Graphics();
            graphics.beginFill(color);
            graphics.drawRect(-1.0, 1.0, 2.0, -2.0);
            graphics.endFill();
            return graphics;
        }));

        this.instanceGroups.push(this.colorPalette.map(color => {
            let graphics = new PIXI.Graphics();
            graphics.beginFill(color);
            graphics.drawCircle(0.0, 0.0, 1.0);
            graphics.endFill();
            return graphics;
        }));
    }

    render() {
        kk += 1;
        this.renderer.render(this.scene);
    }

    lookAt(pos) {
        console.log(pos);
        this.viewport.setZoom(pos.zoom);
        this.viewport.moveCenter(pos.target.x, pos.target.y);
    }

    updatePositions(positions) {
        positions.forEach(elt => {
            let gfx = this.coll2gfx.get(elt.handle);

            if (!!gfx) {
                gfx.position.x = elt.translation.x;
                gfx.position.y = -elt.translation.y;
                gfx.rotation = -elt.rotation;
            }
        })
    }

    reset() {
        this.coll2gfx.forEach(gfx => {
            this.viewport.removeChild(gfx);
            gfx.destroy();
        });
        this.coll2gfx = new Map();
        this.colorIndex = 0;
    }

    addCollider(RAPIER, world, collider) {
        let i;
        let parent = world.getRigidBody(collider.parent());
        let instance;
        let graphics;
        let vertices;
        let instanceId = parent.isStatic() ? 0 : (this.colorIndex + 1);

        switch (collider.shapeType()) {
            case RAPIER.ShapeType.Cuboid:
                let hext = collider.halfExtents();
                instance = this.instanceGroups[BOX_INSTANCE_INDEX][instanceId];
                graphics = instance.clone();
                graphics.scale.x = hext.x;
                graphics.scale.y = hext.y;
                this.viewport.addChild(graphics);
                instance.count += 1;
                break;
            case RAPIER.ShapeType.Ball:
                let rad = collider.radius();
                instance = this.instanceGroups[BALL_INSTANCE_INDEX][instanceId];
                graphics = instance.clone();
                graphics.scale.x = rad;
                graphics.scale.y = rad;
                this.viewport.addChild(graphics);
                instance.count += 1;
                break;
            case RAPIER.ShapeType.Polyline:
                vertices = Array.from(collider.vertices());
                graphics = new PIXI.Graphics();
                graphics.lineStyle(0.2, this.colorPalette[instanceId])
                    .moveTo(vertices[0], -vertices[1]);

                for (i = 2; i < vertices.length; i += 2) {
                    graphics.lineTo(vertices[i], -vertices[i + 1]);
                }

                this.viewport.addChild(graphics);
                break;
            case RAPIER.ShapeType.HeightField:
                let heights = Array.from(collider.heightfieldHeights());
                let scale = collider.heightfieldScale();
                let step = scale.x / (heights.length - 1);

                graphics = new PIXI.Graphics();
                graphics.lineStyle(0.2, this.colorPalette[instanceId])
                    .moveTo(-scale.x / 2.0, -heights[0] * scale.y);

                for (i = 1; i < heights.length; i += 1) {
                    graphics.lineTo(-scale.x / 2.0 + i * step, -heights[i] * scale.y);
                }

                this.viewport.addChild(graphics);
                break;
            case RAPIER.ShapeType.ConvexPolygon:
                vertices = Array.from(collider.vertices());
                graphics = new PIXI.Graphics();
                graphics.beginFill(this.colorPalette[instanceId], 1.0);
                graphics.moveTo(vertices[0], -vertices[1]);

                for (i = 2; i < vertices.length; i += 2) {
                    graphics.lineTo(vertices[i], -vertices[i + 1]);
                }

                this.viewport.addChild(graphics);
                break;
            default:
                console.log("Unknown shape to render.");
                break;
        }

        let t = collider.translation();
        let r = collider.rotation();
//        dummy.position.set(t.x, t.y, t.z);
//        dummy.quaternion.set(r.x, r.y, r.z, r.w);
//        dummy.scale.set(instanceDesc.scale.x, instanceDesc.scale.y, instanceDesc.scale.z);
//        dummy.updateMatrix();
//        instance.setMatrixAt(instanceDesc.elementId, dummy.matrix);
//        instance.instanceMatrix.needsUpdate = true;
        graphics.position.x = t.x;
        graphics.position.y = -t.y;
        graphics.position.rotation = -r.angle;


        this.coll2gfx.set(collider.handle, graphics);
        this.colorIndex = (this.colorIndex + 1) % (this.colorPalette.length - 1);
    }
}
