import {
    init,
    Vector3,
    Quaternion,
    World,
    RigidBodyDesc,
    ColliderDesc,
} from "../builds/3d-deterministic/pkg";

describe("3d/ScalarGetters", () => {
    let world: World;

    beforeAll(init);

    afterAll(async () => {
        await Promise.resolve();
    });

    beforeEach(() => {
        world = new World(new Vector3(0, -9.81, 0));
    });

    afterEach(() => {
        world.free();
    });

    test("rbTranslationX/Y/Z match translation()", () => {
        const bodyDesc = RigidBodyDesc.dynamic().setTranslation(3.0, 7.0, -1.0);
        const body = world.createRigidBody(bodyDesc);
        expect(body.translationX()).toBeCloseTo(3.0);
        expect(body.translationY()).toBeCloseTo(7.0);
        expect(body.translationZ()).toBeCloseTo(-1.0);
        const full = body.translation();
        expect(body.translationX()).toBeCloseTo(full.x);
        expect(body.translationY()).toBeCloseTo(full.y);
        expect(body.translationZ()).toBeCloseTo(full.z);
    });

    test("rbRotationX/Y/Z/W match rotation()", () => {
        const bodyDesc = RigidBodyDesc.dynamic().setRotation(
            new Quaternion(0.0, 0.3826834, 0.0, 0.9238795),
        );
        const body = world.createRigidBody(bodyDesc);
        const full = body.rotation();
        expect(body.rotationX()).toBeCloseTo(full.x);
        expect(body.rotationY()).toBeCloseTo(full.y);
        expect(body.rotationZ()).toBeCloseTo(full.z);
        expect(body.rotationW()).toBeCloseTo(full.w);
    });

    test("linvelX/Y/Z match linvel()", () => {
        const bodyDesc = RigidBodyDesc.dynamic().setLinvel(2.0, -3.0, 1.0);
        const body = world.createRigidBody(bodyDesc);
        const colliderDesc = ColliderDesc.ball(0.5);
        world.createCollider(colliderDesc, body);
        expect(body.linvelX()).toBeCloseTo(2.0);
        expect(body.linvelY()).toBeCloseTo(-3.0);
        expect(body.linvelZ()).toBeCloseTo(1.0);
    });

    test("setLinvelXYZ sets velocity correctly", () => {
        const bodyDesc = RigidBodyDesc.dynamic();
        const body = world.createRigidBody(bodyDesc);
        const colliderDesc = ColliderDesc.ball(0.5);
        world.createCollider(colliderDesc, body);
        body.setLinvelXYZ(5.0, -2.0, 3.0, true);
        expect(body.linvelX()).toBeCloseTo(5.0);
        expect(body.linvelY()).toBeCloseTo(-2.0);
        expect(body.linvelZ()).toBeCloseTo(3.0);
    });

    test("addForceXYZ adds force correctly", () => {
        const bodyDesc = RigidBodyDesc.dynamic();
        const body = world.createRigidBody(bodyDesc);
        const colliderDesc = ColliderDesc.ball(0.5);
        world.createCollider(colliderDesc, body);
        body.addForceXYZ(10.0, 20.0, -5.0, true);
        const force = body.userForce();
        expect(force.x).toBeCloseTo(10.0);
        expect(force.y).toBeCloseTo(20.0);
        expect(force.z).toBeCloseTo(-5.0);
    });

    test("applyImpulseXYZ changes velocity", () => {
        const bodyDesc = RigidBodyDesc.dynamic();
        const body = world.createRigidBody(bodyDesc);
        const colliderDesc = ColliderDesc.ball(0.5);
        world.createCollider(colliderDesc, body);
        body.applyImpulseXYZ(1.0, 0.0, 0.0, true);
        expect(body.linvelX()).not.toBeCloseTo(0.0);
    });

    test("scalar getters work after simulation step", () => {
        const bodyDesc = RigidBodyDesc.dynamic().setTranslation(0, 10, 0);
        const body = world.createRigidBody(bodyDesc);
        const colliderDesc = ColliderDesc.ball(0.5);
        world.createCollider(colliderDesc, body);
        world.step();
        const full = body.translation();
        expect(body.translationX()).toBeCloseTo(full.x);
        expect(body.translationY()).toBeCloseTo(full.y);
        expect(body.translationZ()).toBeCloseTo(full.z);
    });

    test("collider scalar translation getters match translation()", () => {
        const bodyDesc = RigidBodyDesc.dynamic().setTranslation(5.0, 3.0, -2.0);
        const body = world.createRigidBody(bodyDesc);
        const colliderDesc = ColliderDesc.ball(0.5);
        const collider = world.createCollider(colliderDesc, body);
        const full = collider.translation();
        expect(collider.translationX()).toBeCloseTo(full.x);
        expect(collider.translationY()).toBeCloseTo(full.y);
        expect(collider.translationZ()).toBeCloseTo(full.z);
    });

    test("collider scalar rotation getters match rotation()", () => {
        const bodyDesc = RigidBodyDesc.dynamic().setRotation(
            new Quaternion(0.0, 0.3826834, 0.0, 0.9238795),
        );
        const body = world.createRigidBody(bodyDesc);
        const colliderDesc = ColliderDesc.ball(0.5);
        const collider = world.createCollider(colliderDesc, body);
        const full = collider.rotation();
        expect(collider.rotationX()).toBeCloseTo(full.x);
        expect(collider.rotationY()).toBeCloseTo(full.y);
        expect(collider.rotationZ()).toBeCloseTo(full.z);
        expect(collider.rotationW()).toBeCloseTo(full.w);
    });
});
