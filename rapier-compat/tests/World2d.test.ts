import {init, Vector2, World} from "../pkg2d";

describe("2d/World", () => {
    let world: World;

    beforeAll(init);

    afterAll(async () => {
        await Promise.resolve();
    });

    beforeEach(() => {
        world = new World(new Vector2(0, 9.8));
    });

    afterEach(() => {
        world.free();
    });

    test("constructor", () => {
        expect(world.colliders.len()).toBe(0);
    });
});
