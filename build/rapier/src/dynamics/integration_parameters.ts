import {RawIntegrationParameters} from "@dimforge/rapier-core2d";

export class IntegrationParameters {
    raw: RawIntegrationParameters

    constructor(RAPIER: any, raw?: RawIntegrationParameters) {
        this.raw = raw || new RAPIER.RawIntegrationParameters();
    }

    public free() {
        this.raw.free();
        this.raw = undefined;
    }

    get dt(): number {
        return this.raw.dt;
    }

    get returnAfterCcdSubstep(): boolean {
        return this.raw.returnAfterCcdSubstep;
    }

    get erp(): number {
        return this.raw.erp;
    }

    get jointErp(): number {
        return this.raw.jointErp;
    }

    get warmstartCoeff(): number {
        return this.raw.warmstartCoeff;
    }

    get restitutionVelocityThreshold(): number {
        return this.raw.restitutionVelocityThreshold;
    }

    get allowedLinearError(): number {
        return this.raw.allowedLinearError;
    }

    get predictionDistance(): number {
        return this.raw.predictionDistance;
    }

    get allowedAngularError(): number {
        return this.raw.allowedAngularError;
    }

    get maxLinearCorrection(): number {
        return this.raw.maxLinearCorrection;
    }

    get maxAngularCorrection(): number {
        return this.raw.maxAngularCorrection;
    }

    get maxStabilizationMultiplier(): number {
        return this.raw.maxStabilizationMultiplier;
    }

    get maxVelocityIterations(): number {
        return this.raw.maxVelocityIterations;
    }

    get maxPositionIterations(): number {
        return this.raw.maxPositionIterations;
    }

    get minIslandSize(): number {
        return this.raw.minIslandSize;
    }

    get maxCcdPositionIterations(): number {
        return this.raw.maxCcdPositionIterations;
    }

    get maxCcdSubsteps(): number {
        return this.raw.maxCcdSubsteps;
    }

    get multipleCcdSubstepSensorEventsEnabled(): boolean {
        return this.raw.multipleCcdSubstepSensorEventsEnabled;
    }

    get ccdOnPenetrationEnabled(): boolean {
        return this.raw.ccdOnPenetrationEnabled;
    }

    set dt(value: number) {
        this.raw.dt = value;
    }

    set returnAfterCcdSubstep(value: boolean) {
        this.raw.returnAfterCcdSubstep = value;
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

    set restitutionVelocityThreshold(value: number) {
        this.raw.restitutionVelocityThreshold = value;
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

    set maxStabilizationMultiplier(value: number) {
        this.raw.maxStabilizationMultiplier = value;
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

    set maxCcdPositionIterations(value: number) {
        this.raw.maxCcdPositionIterations = value;
    }

    set maxCcdSubsteps(value: number) {
        this.raw.maxCcdSubsteps = value;
    }

    set multipleCcdSubstepSensorEventsEnabled(value: boolean) {
        this.raw.multipleCcdSubstepSensorEventsEnabled = value;
    }

    set ccdOnPenetrationEnabled(value: boolean) {
        this.raw.ccdOnPenetrationEnabled = value;
    }
}
