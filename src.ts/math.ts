import {RawVector, RawRotation, RawIsometry} from "./raw";
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

export interface Isometry {
    rotation: Rotation;
    position: Vector
}

// #endif

/**
 * An Isometry: a rotation followed by a translation.
 */
export class Isometry implements Isometry {
    rotation: Rotation;
    position: Vector;

    public constructor(rotation: Rotation, position: Vector) {
        this.rotation = rotation;
        this.position = position;
    }
}

export class IsometryOps {
    public static identity(): number {
        return 0.0;
    }

    public static fromRaw(raw: RawIsometry): Isometry {
        if (!raw) return null;

        let res = new Isometry(RotationOps.fromRaw(raw.rotation()), VectorOps.fromRaw(raw.translation()));
        raw.free();
        return res;
    }

    public static intoRaw(isometry: Isometry): RawIsometry {
        return new RawIsometry(RotationOps.intoRaw(isometry.rotation), VectorOps.intoRaw(isometry.position));
    }
}

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

/**
 * A 3D symmetric-positive-definite matrix.
 */
export class SdpMatrix3 {
    /**
     * Row major list of the upper-triangular part of the symmetric matrix.
     */
    elements: Float32Array;

    /**
     * Matrix element at row 1, column 1.
     */
    public get m11(): number {
        return this.elements[0];
    }

    /**
     * Matrix element at row 1, column 2.
     */
    public get m12(): number {
        return this.elements[1];
    }

    /**
     * Matrix element at row 2, column 1.
     */
    public get m21(): number {
        return this.m12;
    }

    /**
     * Matrix element at row 1, column 3.
     */
    public get m13(): number {
        return this.elements[2];
    }

    /**
     * Matrix element at row 3, column 1.
     */
    public get m31(): number {
        return this.m13;
    }

    /**
     * Matrix element at row 2, column 2.
     */
    public get m22(): number {
        return this.elements[3];
    }

    /**
     * Matrix element at row 2, column 3.
     */
    public get m23(): number {
        return this.elements[4];
    }

    /**
     * Matrix element at row 3, column 2.
     */
    public get m32(): number {
        return this.m23;
    }

    /**
     * Matrix element at row 3, column 3.
     */
    public get m33(): number {
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
