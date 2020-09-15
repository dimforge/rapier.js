import { RawVector, RawRotation } from "./rapier"

// #if DIM2
export class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public static zeros(): Vector {
        return new Vector(0.0, 0.0);
    }

    // FIXME: type ram: RawVector?
    public static fromRaw(raw: RawVector): Vector {
        let res = new Vector(raw.x, raw.y);
        raw.free();
        return res;
    }

    // FIXME: type ram: RawVector?
    public intoRaw(RAPIER: any): RawVector {
        return new RAPIER.RawVector(this.x, this.y);
    }
}

export class Rotation {
    angle: number;

    constructor(angle: number) {
        this.angle = angle;
    }

    public static identity(): Rotation {
        return new Rotation(0.0);
    }

    // FIXME: type ram: RawVector?
    public static fromRaw(raw: RawRotation): Rotation {
        let res = new Rotation(raw.angle);
        raw.free();
        return res;
    }

    // FIXME: type ram: RawVector?
    public intoRaw(RAPIER: any): RawRotation {
        return RAPIER.RawRotation.from_angle(this.angle);
    }
}
// #endif


// #if DIM3
export class Vector {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public static zeros(): Vector {
        return new Vector(0.0, 0.0, 0.0);
    }

    // FIXME: type ram: RawVector?
    public static fromRaw(raw: RawVector): Vector {
        let res = new Vector(raw.x, raw.y, raw.z);
        raw.free();
        return res;
    }

    // FIXME: type ram: RawVector?
    public intoRaw(RAPIER: any): RawVector {
        return new RAPIER.RawVector(this.x, this.y, this.z);
    }
}

export class Rotation {
    x: number;
    y: number;
    z: number;
    w: number;

    constructor(x: number, y: number, z: number, w: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    // FIXME: type ram: RawVector?
    public static fromRaw(raw: RawRotation): Rotation {
        let res = new Rotation(raw.x, raw.y, raw.z, raw.w);
        raw.free();
        return res;
    }

    // FIXME: type ram: RawVector?
    public intoRaw(RAPIER: any): RawRotation {
        return new RAPIER.RawRotation(this.x, this.y, this.z, this.w);
    }
}
// #endif