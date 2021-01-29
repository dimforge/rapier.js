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

    let vertices = coll.vertices();
    if (!!vertices) {
        meta.vertices = vertices;
    }

    let indices = coll.indices();
    if (!!indices) {
        meta.indices = indices;
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
