class Vector {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z = 0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Rotation {
    i: number;
    j: number;
    k: number;
    w: number;

    constructor(i: number, j: number, k: number, w: number) {
        this.i = i;
        this.j = j;
        this.k = k;
        this.w = w;
    }
}

enum BodyType {
    Static,
    Dynamic,
    Kinematic,
}

class RigidBodyDesc {
    bodyType: BodyType;
    position: Vector;
    rotation: Rotation;
    linvel: Vector;
    angvel: Vector;
    canSleep: boolean;

    constructor(bodyType: BodyType) {
        this.bodyType = bodyType;
        this.position = new Vector(0.0, 0.0, 0.0);
        this.rotation = new Rotation(0.0, 0.0, 0.0, 1.0);
        this.linvel = new Vector(0.0, 0.0, 0.0);
        this.angvel = new Vector(0.0, 0.0, 0.0);
        this.canSleep = true;
    }

    public withPosition(val: Vector): RigidBodyDesc {
        this.position = val;
        return this;
    }

    public withRotation(val: Rotation): RigidBodyDesc {
        this.rotation = val;
        return this;
    }

    public withLinvel(val: Vector): RigidBodyDesc {
        this.linvel = val;
        return this;
    }

    public withAngvel(val: Vector): RigidBodyDesc {
        this.angvel = val;
        return this;
    }

    public withCanSleep(val: boolean): RigidBodyDesc {
        this.canSleep = val;
        return this;
    }
}

class RigidBodySet {
    readonly rawBodies: any;
}

class ColliderSet {
    readonly rawColliders: any;
}

class RigidBody {
    readonly bodies: RigidBodySet;
    readonly handle: number;

    constructor(bodies: RigidBodySet, handle: number) {
        this.bodies = bodies;
        this.handle = handle;
    }
}

class World {
    RAPIER: any;
    readonly rawWorld: any;
    readonly bodies: RigidBodySet;
    readonly colliders: ColliderSet;

    constructor(RAPIER, gravityX: number, gravityY: number, gravityZ: number) {
        this.RAPIER = RAPIER;
        this.rawWorld = new RAPIER.World(gravityX, gravityY, gravityZ);
    }

    public free() {
        this.rawWorld.free();
        this.bodies.rawBodies.free();
        this.colliders.rawColliders.free();
    }

    public step() {
        this.rawWorld.step();
    }

    get timestep(): number {
        return this.rawWorld.timestep;
    }

    set timestep(timestep: number) {
        this.rawWorld.timestep = timestep;
    }

    get maxVelocityIterations(): number {
        return this.rawWorld.maxVelocityIterations;
    }

    set maxVelocityIterations(n: number) {
        this.rawWorld.maxVelocityIterations = n;
    }

    get maxPositionIterations(): number {
        return this.rawWorld.maxPositionIterations;
    }

    set maxPositionIterations(n: number) {
        this.rawWorld.maxPositionIterations = n;
    }

    public createRigidBody(desc: RigidBodyDesc): RigidBody {
        const handle = this.rawWorld.createRigidBody(
            desc.bodyType,
            desc.position.x,
            desc.position.y,
            desc.position.z,
            desc.rotation.i,
            desc.rotation.j,
            desc.rotation.k,
            desc.rotation.w,
            desc.linvel.x,
            desc.linvel.y,
            desc.linvel.z,
            desc.angvel.x,
            desc.angvel.y,
            desc.angvel.z,
            desc.canSleep
        );

        return new RigidBody(this.bodies, handle);
    }
}