import {RawIntegrationParameters} from "../raw";

export class IntegrationParameters {
    raw: RawIntegrationParameters;

    constructor(raw?: RawIntegrationParameters) {
        this.raw = raw || new RawIntegrationParameters();
    }

    /**
     * Free the WASM memory used by these integration parameters.
     */
    public free() {
        this.raw.free();
        this.raw = undefined;
    }

    /**
     * The timestep length (default: `1.0 / 60.0`)
     */
    get dt(): number {
        return this.raw.dt;
    }

    /**
     * The Error Reduction Parameter in `[0, 1]` is the proportion of
     * the positional error to be corrected at each time step (default: `0.2`).
     */
    get erp(): number {
        return this.raw.erp;
    }

    /**
     * Amount of penetration the engine wont attempt to correct (default: `0.001m`).
     */
    get allowedLinearError(): number {
        return this.raw.allowedLinearError;
    }

    /**
     * The maximal distance separating two objects that will generate predictive contacts (default: `0.002`).
     */
    get predictionDistance(): number {
        return this.raw.predictionDistance;
    }

    /**
     * Maximum number of iterations performed by the velocity constraints solver (default: `4`).
     */
    get maxVelocityIterations(): number {
        return this.raw.maxVelocityIterations;
    }

    /**
     * Maximum number of friction iterations performed by the position-based constraints solver (default: `1`).
     */
    get maxVelocityFrictionIterations(): number {
        return this.raw.maxVelocityFrictionIterations;
    }

    /**
     * Maximum number of stabilization iterations performed by the position-based constraints solver (default: `1`).
     */
    get maxStabilizationIterations(): number {
        return this.raw.maxStabilizationIterations;
    }

    /**
     * Minimum number of dynamic bodies in each active island (default: `128`).
     */
    get minIslandSize(): number {
        return this.raw.minIslandSize;
    }

    /**
     * Maximum number of substeps performed by the  solver (default: `1`).
     */
    get maxCcdSubsteps(): number {
        return this.raw.maxCcdSubsteps;
    }

    set dt(value: number) {
        this.raw.dt = value;
    }

    set erp(value: number) {
        this.raw.erp = value;
    }

    set allowedLinearError(value: number) {
        this.raw.allowedLinearError = value;
    }

    set predictionDistance(value: number) {
        this.raw.predictionDistance = value;
    }

    set maxVelocityIterations(value: number) {
        this.raw.maxVelocityIterations = value;
    }

    set maxVelocityFrictionIterations(value: number) {
        this.raw.maxVelocityFrictionIterations = value;
    }

    set maxStabilizationIterations(value: number) {
        this.raw.maxStabilizationIterations = value;
    }

    set minIslandSize(value: number) {
        this.raw.minIslandSize = value;
    }

    set maxCcdSubsteps(value: number) {
        this.raw.maxCcdSubsteps = value;
    }
}
