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
        if (!!this.raw) {
            this.raw.free();
        }
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
     * The number of solver iterations run by the constraints solver for calculating forces (default: `4`).
     */
    get numSolverIterations(): number {
        return this.raw.numSolverIterations;
    }

    /**
     * Number of addition friction resolution iteration run during the last solver sub-step (default: `4`).
     */
    get numAdditionalFrictionIterations(): number {
        return this.raw.numAdditionalFrictionIterations;
    }

    /**
     * Number of internal Project Gauss Seidel (PGS) iterations run at each solver iteration (default: `1`).
     */
    get numInternalPgsIterations(): number {
        return this.raw.numInternalPgsIterations;
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

    /**
     * Sets the number of solver iterations run by the constraints solver for calculating forces (default: `4`).
     */
    set numSolverIterations(value: number) {
        this.raw.numSolverIterations = value;
    }
    /**
     * Sets the number of addition friction resolution iteration run during the last solver sub-step (default: `4`).
     */
    set numAdditionalFrictionIterations(value: number) {
        this.raw.numAdditionalFrictionIterations = value;
    }

    /**
     * Sets the number of internal Project Gauss Seidel (PGS) iterations run at each solver iteration (default: `1`).
     */
    set numInternalPgsIterations(value: number) {
        this.raw.numInternalPgsIterations = value;
    }

    set minIslandSize(value: number) {
        this.raw.minIslandSize = value;
    }

    set maxCcdSubsteps(value: number) {
        this.raw.maxCcdSubsteps = value;
    }

    public switchToStandardPgsSolver() {
        this.raw.switchToStandardPgsSolver()
    }

    public switchToSmallStepsPgsSolver() {
        this.raw.switchToSmallStepsPgsSolver()
    }
}
