import {
    init,
    Vector2,
    World,
    RigidBodyDesc,
    ColliderDesc,
} from "../builds/2d-deterministic/pkg";

describe("2d/ScalarGetters", () => {
    let world: World;

    beforeAll(init);

    afterAll(async () => {
        await Promise.resolve();
    });

    beforeEach(() => {
        world = new World(new Vector2(0, -9.81));
    });

    afterEach(() => {
        world.free();
    });

    test("rbTranslationX/Y match translation()", () => {
        const bodyDesc = RigidBodyDesc.dynamic().setTranslation(3.0, 7.0);
        const body = world.createRigidBody(bodyDesc);
        expect(body.translationX()).toBeCloseTo(3.0);
        expect(body.translationY()).toBeCloseTo(7.0);
        const full = body.translation();
        expect(body.translationX()).toBeCloseTo(full.x);
        expect(body.translationY()).toBeCloseTo(full.y);
    });

    test("rbRotationAngle matches rotation()", () => {
        const bodyDesc = RigidBodyDesc.dynamic().setRotation(1.5);
        const body = world.createRigidBody(bodyDesc);
        expect(body.rotationAngle()).toBeCloseTo(1.5);
        expect(body.rotationAngle()).toBeCloseTo(body.rotation());
    });

    test("linvelX/Y match linvel()", () => {
        const bodyDesc = RigidBodyDesc.dynamic().setLinvel(2.0, -3.0);
        const body = world.createRigidBody(bodyDesc);
        const colliderDesc = ColliderDesc.ball(0.5);
        world.createCollider(colliderDesc, body);
        expect(body.linvelX()).toBeCloseTo(2.0);
        expect(body.linvelY()).toBeCloseTo(-3.0);
    });

    test("setLinvelXY sets velocity correctly", () => {
        const bodyDesc = RigidBodyDesc.dynamic();
        const body = world.createRigidBody(bodyDesc);
        const colliderDesc = ColliderDesc.ball(0.5);
        world.createCollider(colliderDesc, body);
        body.setLinvelXY(5.0, -2.0, true);
        expect(body.linvelX()).toBeCloseTo(5.0);
        expect(body.linvelY()).toBeCloseTo(-2.0);
    });

    test("addForceXY adds force correctly", () => {
        const bodyDesc = RigidBodyDesc.dynamic();
        const body = world.createRigidBody(bodyDesc);
        const colliderDesc = ColliderDesc.ball(0.5);
        world.createCollider(colliderDesc, body);
        body.addForceXY(10.0, 20.0, true);
        const force = body.userForce();
        expect(force.x).toBeCloseTo(10.0);
        expect(force.y).toBeCloseTo(20.0);
    });

    test("applyImpulseXY changes velocity", () => {
        const bodyDesc = RigidBodyDesc.dynamic();
        const body = world.createRigidBody(bodyDesc);
        const colliderDesc = ColliderDesc.ball(0.5);
        world.createCollider(colliderDesc, body);
        body.applyImpulseXY(1.0, 0.0, true);
        expect(body.linvelX()).not.toBeCloseTo(0.0);
    });

    test("scalar getters work after simulation step", () => {
        const bodyDesc = RigidBodyDesc.dynamic().setTranslation(0, 10);
        const body = world.createRigidBody(bodyDesc);
        const colliderDesc = ColliderDesc.ball(0.5);
        world.createCollider(colliderDesc, body);
        world.step();
        const full = body.translation();
        expect(body.translationX()).toBeCloseTo(full.x);
        expect(body.translationY()).toBeCloseTo(full.y);
    });

    test("collider scalar translation getters match translation()", () => {
        const bodyDesc = RigidBodyDesc.dynamic().setTranslation(5.0, 3.0);
        const body = world.createRigidBody(bodyDesc);
        const colliderDesc = ColliderDesc.ball(0.5);
        const collider = world.createCollider(colliderDesc, body);
        const full = collider.translation();
        expect(collider.translationX()).toBeCloseTo(full.x);
        expect(collider.translationY()).toBeCloseTo(full.y);
    });

    test("collider scalar rotation getter matches rotation()", () => {
        const bodyDesc = RigidBodyDesc.dynamic().setRotation(0.7);
        const body = world.createRigidBody(bodyDesc);
        const colliderDesc = ColliderDesc.ball(0.5);
        const collider = world.createCollider(colliderDesc, body);
        expect(collider.rotationAngle()).toBeCloseTo(collider.rotation());
    });
});
