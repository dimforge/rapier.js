import {RawVector, RawRotation} from "./raw";
// #if DIM3
import {RawSdpMatrix3} from "./raw";
// #endif

// #if DIM2
export interface Vector {
    x: number;
    y: number;
}

/**
 * A 2D vector.
 */
export class Vector2 implements Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class VectorOps {
    public static new(x: number, y: number): Vector {
        return new Vector2(x, y);
    }

    public static zeros(): Vector {
        return VectorOps.new(0.0, 0.0);
    }

    // FIXME: type ram: RawVector?
    public static fromRaw(raw: RawVector): Vector {
        if (!raw) return null;

        let res = VectorOps.new(raw.x, raw.y);
        raw.free();
        return res;
    }

    public static intoRaw(v: Vector): RawVector {
        return new RawVector(v.x, v.y);
    }

    public static copy(out: Vector, input: Vector) {
        out.x = input.x;
        out.y = input.y;
    }
}

/**
 * A rotation angle in radians.
 */
export type Rotation = number;

export class RotationOps {
    public static identity(): number {
        return 0.0;
    }

    public static fromRaw(raw: RawRotation): Rotation {
        if (!raw) return null;

        let res = raw.angle;
        raw.free();
        return res;
    }

    public static intoRaw(angle: Rotation): RawRotation {
        return RawRotation.fromAngle(angle);
    }
}

// #endif

// #if DIM3
export interface Vector {
    x: number;
    y: number;
    z: number;
}

/**
 * A 3D vector.
 */
export class Vector3 implements Vector {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

export class VectorOps {
    public static new(x: number, y: number, z: number): Vector {
        return new Vector3(x, y, z);
    }

    public static intoRaw(v: Vector): RawVector {
        return new RawVector(v.x, v.y, v.z);
    }

    public static zeros(): Vector {
        return VectorOps.new(0.0, 0.0, 0.0);
    }

    // FIXME: type ram: RawVector?
    public static fromRaw(raw: RawVector): Vector {
        if (!raw) return null;

        let res = VectorOps.new(raw.x, raw.y, raw.z);
        raw.free();
        return res;
    }

    public static copy(out: Vector, input: Vector) {
        out.x = input.x;
        out.y = input.y;
        out.z = input.z;
    }
}

export interface Rotation {
    x: number;
    y: number;
    z: number;
    w: number;
}

/**
 * A quaternion.
 */
export class Quaternion implements Rotation {
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
}

export class RotationOps {
    public static identity(): Rotation {
        return new Quaternion(0.0, 0.0, 0.0, 1.0);
    }

    public static fromRaw(raw: RawRotation): Rotation {
        if (!raw) return null;

        let res = new Quaternion(raw.x, raw.y, raw.z, raw.w);
        raw.free();
        return res;
    }

    public static intoRaw(rot: Rotation): RawRotation {
        return new RawRotation(rot.x, rot.y, rot.z, rot.w);
    }

    public static copy(out: Rotation, input: Rotation) {
        out.x = input.x;
        out.y = input.y;
        out.z = input.z;
        out.w = input.w;
    }
}

export class SdpMatrix3 {
    /**
     * Row major list of the angular inertia SpdMatrix3 elements
     */
    elements: Float32Array;

    get m11(): number {
        return this.elements[0];
    }

    get m12(): number {
        return this.elements[1];
    }

    get m13(): number {
        return this.elements[2];
    }

    get m22(): number {
        return this.elements[3];
    }

    get m23(): number {
        return this.elements[4];
    }

    get m33(): number {
        return this.elements[5];
    }

    constructor(elements: Float32Array) {
        this.elements = elements;
    }
}

export class SdpMatrix3Ops {
    public static fromRaw(raw: RawSdpMatrix3): SdpMatrix3 {
        const sdpMatrix3 = new SdpMatrix3(raw.elements());
        raw.free();
        return sdpMatrix3;
    }
}

// #endif
