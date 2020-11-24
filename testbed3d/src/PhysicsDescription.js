export function extractRigidBodyDescription(body) {
    let pos = body.translation();

    return {
        handle: body.handle,
        type: body.bodyStatus(),
        translation: pos,
        linvel: body.linvel(),
        angvel: body.angvel(),
        linearDamping: body.linearDamping(),
        angularDamping: body.angularDamping(),
        mass: body.mass()
    };
}

export function extractColliderDescription(coll) {
    let meta = {
        handle: coll.handle,
        parentHandle: coll.parent(),
        type: coll.shapeType(),
        radius: coll.radius(),
        density: coll.density(),
        friction: coll.friction(),
        isSensor: coll.isSensor(),
    };

    let he = coll.halfExtents();
    if (!!he) {
        meta.halfExtents = {x: he.x, y: he.y, z: he.z};
    }

    let halfHeight = coll.halfHeight();
    if (!!halfHeight) {
        meta.halfHeight = halfHeight;
    }

    let roundRadius = coll.roundRadius();
    if (!!roundRadius) {
        meta.roundRadius = roundRadius;
    }

    let vertices = coll.trimeshVertices();
    if (!!vertices) {
        meta.trimeshVertices = vertices;
    }

    let indices = coll.trimeshIndices();
    if (!!indices) {
        meta.trimeshIndices = indices;
    }

    if (!!coll.heightfieldHeights()) {
        meta.heightfieldHeights = coll.heightfieldHeights();
        meta.heightfieldNRows = coll.heightfieldNRows();
        meta.heightfieldNCols = coll.heightfieldNCols();
        meta.heightfieldScale = coll.heightfieldScale();
    }

    return meta;
}

export function extractJointDescription(joint) {
    let a1 = joint.anchor1();
    let a2 = joint.anchor2();
    let ax1 = joint.axis1() || {x: 0.0, y: 0.0, z: 0.0};
    let ax2 = joint.axis2() || {x: 0.0, y: 0.0, z: 0.0};
    let fx1 = joint.frameX1() || {x: 0.0, y: 0.0, z: 0.0, w: 1.0};
    let fx2 = joint.frameX2() || {x: 0.0, y: 0.0, z: 0.0, w: 1.0};
    // TODO: put the actual value here.
    let ta1 = /* joint.tangent1() || */ {x: 0.0, y: 0.0, z: 0.0};
    let ta2 = /* joint.tangent2() || */ {x: 0.0, y: 0.0, z: 0.0};
    
    return {
        handle1: joint.bodyHandle1(),
        handle2: joint.bodyHandle2(),
        type: joint.type(),
        anchor1: a1,
        anchor2: a2,
        axis1: ax1,
        axis2: ax2,
        tangent1: ta1,
        tangent2: ta2,
        frameX1: fx1,
        frameX2: fx2,
        limitsEnabled: joint.limitsEnabled(),
        limitsMin: joint.limitsMin(),
        limitsMax: joint.limitsMax(),
    };
}

/*
 * To use our testbed the user has to load Rapier, initialize
 * the Rapier physics world. Then the testbed will take this word
 * and convert it to an abstract description of its content to
 * send it to a web worker. And this web worker will re-build
 * the Rapier physics world. So basically we are doing two
 * conversion:
 *
 * Rapier -> abstract descripton -> Rapier
 *
 * This may sound silly as it would be easier to just have the user
 * write the abstract description directly and pass it to the testbed.
 * But we don't do this because we want our demos to be examples on
 * how one can create a Rapier world. That way one can refer to
 * there examples to see how some things can be done.
 */
export function extractWorldDescription(world, bodies, colliders, joints) {
    let metaWorld = {
        gravity: world.gravity,
        maxVelocityIterations: world.maxVelocityIterations,
        maxPositionIterations: world.maxPositionIterations,
    };

    let metaBodies = bodies.map(extractRigidBodyDescription);
    let metaColliders = colliders.map(extractColliderDescription);
    let metaJoints = !joints ? [] : joints.map(extractJointDescription);

    return {
        world: metaWorld,
        bodies: metaBodies,
        colliders: metaColliders,
        joints: metaJoints,
    }
}