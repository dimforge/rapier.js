import gsap from 'gsap';
import * as THREE from 'three';
import type { Testbed } from "../Testbed";

type RAPIER_API = typeof import("@dimforge/rapier3d");

export function initWorld(RAPIER: RAPIER_API, testbed: Testbed) {
  testbed.graphics.controls.enabled = false;

  const gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
  const world = new RAPIER.World(gravity);

  const width = window.innerWidth;
  const height = window.innerHeight;
  const scene = new THREE.Scene();

  const ambientLight = new THREE.AmbientLight(0xffeedd, 2);

  scene.add(ambientLight);

  // camera
  const aspectRadio = width / height;
  const camera = new THREE.PerspectiveCamera(60, aspectRadio, 0.01, 1000);

  camera.position.set(0, 0, 12);

  scene.add(camera);

  const loadingManager = new THREE.LoadingManager();
  const textureLoader = new THREE.TextureLoader(loadingManager);

  textureLoader.load(`./images/HDRPanorama0035_2K_hdri_sphere_tone.jpg`, hdrTexture => {
    scene.backgroundIntensity = 10;
    scene.environment = hdrTexture;
    hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
  });

  // background board
  const mapTexture = textureLoader.load('./images/20844.jpg');

  // @ts-ignore
  mapTexture.colorSpace = THREE.SRGBColorSpace;

  const background = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 15),
    new THREE.MeshLambertMaterial({
      map: mapTexture,
    }),
  );

  background.position.y = -2;
  scene.add(background);

  const createShape = (width = 0.5, height = 3.2, radius0 = 0.12) => {
    const eps = 0.00001;
    const shape = new THREE.Shape();
    const radius = radius0 - eps;

    shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
    shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
    shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true);
    shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);

    return shape;
  };
  const geoShape = createShape();
  const geometry = new THREE.ExtrudeGeometry(
    geoShape,
    {
      depth: 1,
      bevelSize: 0.1,
      bevelSegments: 16,
      bevelThickness: 0.1,
      curveSegments: 4,
      steps: 2,
    },
  );

  geometry.computeBoundingBox();

  const material = new THREE.MeshPhysicalMaterial({
    transmission: 1,
    roughness: 0,
    thickness: 4,
    envMapIntensity: 4,
  });

  // left
  const leftBrick = new THREE.Mesh(
    geometry,
    material,
  );

  leftBrick.position.set(-3, -5, 0);
  leftBrick.rotation.set(0, 0, Math.PI / 4);
  scene.add(leftBrick);

  const leftCubeDesc = RAPIER.RigidBodyDesc.fixed()
    .setTranslation(leftBrick.position.x, leftBrick.position.y, leftBrick.position.z)
    .setRotation(new THREE.Quaternion().setFromEuler(leftBrick.rotation))
    .setCanSleep(false);
  const leftCubeBody = world.createRigidBody(leftCubeDesc);
  const leftCubeDescColliderDesc = RAPIER.ColliderDesc
    .cuboid(0.25, 1.6, 0.6)
    .setTranslation(0.15, 1.5, 0.5)
    .setMass(1)
    .setFriction(0.2)
    .setRestitution(0.8);

  const leftCubeCollider = world.createCollider(leftCubeDescColliderDesc, leftCubeBody);

  leftCubeCollider.setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS);
  leftBrick.userData.physicsBody = leftCubeBody;

  // right
  const rightBrick = new THREE.Mesh(
    geometry,
    material,
  );

  rightBrick.position.set(3, -5, 0);
  rightBrick.rotation.set(0, 0, -Math.PI / 4);
  scene.add(rightBrick);

  const rightCubeDesc = RAPIER.RigidBodyDesc.fixed()
    .setTranslation(rightBrick.position.x, rightBrick.position.y, rightBrick.position.z)
    .setRotation(new THREE.Quaternion().setFromEuler(rightBrick.rotation))
    .setCanSleep(false);
  const rightCubeBody = world.createRigidBody(rightCubeDesc);
  const rightCubeDescColliderDesc = RAPIER.ColliderDesc
    .cuboid(0.25, 1.6, 0.6)
    .setTranslation(0.15, 1.5, 0.5)
    .setMass(1)
    .setFriction(0.2)
    .setRestitution(0.8);

  const rightCubeCollider = world.createCollider(rightCubeDescColliderDesc, rightCubeBody);

  rightCubeCollider.setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS);
  rightBrick.userData.physicsBody = rightCubeBody;

  // moving brick
  const moveBrick = new THREE.Mesh(
    new THREE.ExtrudeGeometry(
      createShape(0.7, 2, 0.1),
      {
        depth: 1,
        bevelSize: 0.1,
        bevelSegments: 16,
        bevelThickness: 0.1,
        curveSegments: 4,
        steps: 2,
      },
    ),
    material,
  );

  moveBrick.name = 'moveBrick';
  moveBrick.rotation.z = Math.PI / 2;
  moveBrick.position.set(0.4, -5, 0);

  const rotateGroup = new THREE.Group();

  rotateGroup.add(moveBrick);
  rotateGroup.position.set(moveBrick.position.x, moveBrick.position.y + 5, moveBrick.position.z);
  scene.add(rotateGroup);

  const moveCubeDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
    .setTranslation(moveBrick.position.x, moveBrick.position.y, moveBrick.position.z)
    .setRotation(new THREE.Quaternion().setFromEuler(moveBrick.rotation))
    .setCanSleep(false);

  const moveCubeBody = world.createRigidBody(moveCubeDesc);
  const moveCubeDescColliderDesc = RAPIER.ColliderDesc
    .cuboid(1, 0.35, 0.5)
    .setTranslation(-0.5, 0.25, 0.5)
    .setMass(1)
    .setFriction(0.2)
    .setRestitution(1);

  const moveCubeCollider = world.createCollider(moveCubeDescColliderDesc, moveCubeBody);

  moveCubeCollider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
  moveBrick.userData.physicsBody = moveCubeBody;

  // ball
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 32, 32),
    new THREE.MeshPhysicalMaterial({
      transmission: 1,
      roughness: 0,
      thickness: 10,
      envMapIntensity: 4,
    }),
  );

  ball.position.set(0, 0, 0.6);
  ball.rotation.set(-Math.PI / 4, 0, 0);
  scene.add(ball);

  const ballDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(ball.position.x, ball.position.y, ball.position.z)
    .setRotation(new THREE.Quaternion().setFromEuler(ball.rotation))
    .setCanSleep(true);
  const ballBody = world.createRigidBody(ballDesc);
  const ballDescColliderDesc = RAPIER.ColliderDesc
    .ball(0.6)
    .setMass(2)
    .setFriction(0.2)
    .setRestitution(1.1);

  const ballCollider = world.createCollider(ballDescColliderDesc, ballBody);

  // set event
  ballCollider.setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS);
  // ballCollider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
  ballCollider.setContactForceEventThreshold(0.05);
  ball.userData.physicsBody = ballBody;

  // update rotateGroup's rotation
  window.addEventListener('mousemove', (event) => {
    const mouseX = (event.clientX / width) * 2 - 1; // [-1, 1]
    const angle = mouseX * Math.PI / 10;  // [-Math.PI / 10, Math.PI / 10]

    rotateGroup.rotation.z = angle;
  });

  const contactEvents = () => {
    world.step(testbed.events);

    testbed.events.drainContactForceEvents((event) => {
      const collider1 = world.getCollider(event.collider1());
      const body1 = collider1.parent();
      const translation1 = body1.translation();

      gsap.to(translation1, {
        y: '+=0.1',
        duration: 0.05,
        onUpdate: () => {
          body1.setTranslation({ x: translation1.x, y: translation1.y, z: translation1.z }, true);
        },
        onComplete () {
          // 重置位置
          gsap.to(translation1, {
            y: '-=0.1',
            duration: 0.03,
            onUpdate: () => {
              body1.setTranslation({ x: translation1.x, y: translation1.y, z: translation1.z }, true);
            },
          });
        },
      });
    });
  };
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    logarithmicDepthBuffer: true,
    powerPreference: 'high-performance',
  });

  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.domElement.id = 'elasticBall';
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = `0`;
  renderer.domElement.style.left = `0`;
  document.body.appendChild(renderer.domElement);

  const v = new THREE.Vector3(0, 0, 0);
  const tick = () => {
    if (ball.position.y <= -10) {
      // reset ball
      ballBody.setTranslation({ x: 0, y: 0, z: 0.6 }, true);
      ballBody.setLinvel(new RAPIER.Vector3(0, 0, 0), true);
      ballBody.setAngvel(new RAPIER.Vector3(0, 0, 0), true);
      ballBody.resetForces(true);
    }

    contactEvents();

    scene.traverse((obj: THREE.Object3D) => {
      if (obj.userData.physicsBody) {
        const body = obj.userData.physicsBody;
        const position = body.translation();

        if (obj.name === 'moveBrick') {
          const { rotation } = rotateGroup;
          const worldPosition = new THREE.Vector3();

          moveBrick.getWorldPosition(worldPosition);
          body.setTranslation({ x: worldPosition.x - 0.4, y: position.y, z: position.z });
          body.setRotation(new THREE.Quaternion().setFromEuler(rotation));
          obj.position.y = position.y;
        } else {
          obj.position.copy(position);
          obj.quaternion.copy(body.rotation());
        }
      }
    });

    const ballPosition = ballBody.translation();

    camera.position.lerp(v.set(0, ballPosition.y / 2, Math.max(0, ballPosition.y) / 10 + 15), 0.01);

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();

  testbed.setWorld(world);
};
