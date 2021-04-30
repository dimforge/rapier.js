import {extractColliderDescription, extractRigidBodyDescription} from "./PhysicsDescription";

export class PhysicsModifications {
    constructor() {
        this.commands = {
            addRigidBody: [],
            addCollider: [],
            removeRigidBody: [],
            moveKinematicBody: [],
        }
    };

    addRigidBody(rigidBody) {
        let desc = extractRigidBodyDescription(rigidBody);
        this.commands.addRigidBody.push(desc);
    }

    addCollider(collider) {
        let desc = extractColliderDescription(collider);
        this.commands.addCollider.push(desc);
    }

    removeRigidBody(handle) {
        this.commands.removeRigidBody.push(handle);
    }

    moveKinematicBody(handle, deltaTra, deltaRot) {
        this.commands.moveKinematicBody.push({handle: handle, deltaTra: deltaTra, deltaRot: deltaRot});
    }
}