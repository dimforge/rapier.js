export class Coarena<T> {
    data: Array<T>
    size: number

    public constructor() {
        this.data = new Array<T>();
        this.size = 0;
    }

    public set(handle: number, data: T) {
        let i = index(handle);
        while (this.data.length <= i) {
            this.data.push(null);
        }

        if (this.data[i] == null)
            this.size += 1;
        this.data[i] = data;
    }

    public len(): number {
        return this.size;
    }

    public delete(handle: number) {
        let i = index(handle);
        if (this.data.length < i) {
            if (this.data[i] != null)
                this.size -= 1;
            this.data[i] = null;
        }
    }

    public clear() {
        this.data = new Array<T>();
    }

    public get(handle: number): T | null {
        let i = index(handle);
        if (i < this.data.length) {
            return this.data[i];
        } else {
            return null;
        }
    }

    public forEach(f: (elt: T) => void) {
        for (const elt of this.data) {
            if (elt != null)
                f(elt);
        }
    }

    public getAll(): Array<T> {
        return this.data.filter((elt) => elt != null);
    }
}

/// Extracts the index part of an handle (the lower 32 bits).
function index(handle: number): number {
    return handle & 0x0000_0000_ffff_ffff;
}