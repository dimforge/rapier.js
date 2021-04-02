import {RawIntegrationParameters} from "../raw";

export class IntegrationParameters {
    raw: RawIntegrationParameters

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
     * The Error Reduction Parameter for joints in `[0, 1]` is the proportion of
     * the positional error to be corrected at each time step (default: `0.2`).
     */
    get jointErp(): number {
        return this.raw.jointErp;
    }

    /**
     * Each cached impulse are multiplied by this coefficient in `[0, 1]`
     * when they are re-used to initialize the solver (default `1.0`).
     */
    get warmstartCoeff(): number {
        return this.raw.warmstartCoeff;
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
     * Amount of angular drift of joint limits the engine wont
     * attempt to correct (default: `0.001rad`).
     */
    get allowedAngularError(): number {
        return this.raw.allowedAngularError;
    }

    /**
     * Maximum linear correction during one step of the non-linear position solver (default: `0.2`).
     */
    get maxLinearCorrection(): number {
        return this.raw.maxLinearCorrection;
    }

    /**
     * Maximum angular correction during one step of the non-linear position solver (default: `0.2`).
     */
    get maxAngularCorrection(): number {
        return this.raw.maxAngularCorrection;
    }

    /**
     * Maximum number of iterations performed by the velocity constraints solver (default: `4`).
     */
    get maxVelocityIterations(): number {
        return this.raw.maxVelocityIterations;
    }

    /**
     * Maximum number of iterations performed by the position-based constraints solver (default: `1`).
     */
    get maxPositionIterations(): number {
        return this.raw.maxPositionIterations;
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

    set jointErp(value: number) {
        this.raw.jointErp = value;
    }

    set warmstartCoeff(value: number) {
        this.raw.warmstartCoeff = value;
    }

    set allowedLinearError(value: number) {
        this.raw.allowedLinearError = value;
    }

    set predictionDistance(value: number) {
        this.raw.predictionDistance = value;
    }

    set allowedAngularError(value: number) {
        this.raw.allowedAngularError = value;
    }

    set maxLinearCorrection(value: number) {
        this.raw.maxLinearCorrection = value;
    }

    set maxAngularCorrection(value: number) {
        this.raw.maxAngularCorrection = value;
    }

    set maxVelocityIterations(value: number) {
        this.raw.maxVelocityIterations = value;
    }

    set maxPositionIterations(value: number) {
        this.raw.maxPositionIterations = value;
    }

    set minIslandSize(value: number) {
        this.raw.minIslandSize = value;
    }

    set maxCcdSubsteps(value: number) {
        this.raw.maxCcdSubsteps = value;
    }
}
