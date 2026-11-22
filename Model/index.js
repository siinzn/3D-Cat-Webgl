// Constants
const CLEAR_COLOR = vec4(0.12, 0.13, 0.16, 1.0);
const SPHERE_LAT_SEGMENTS = 24;
const SPHERE_LONG_SEGMENTS = 24;
const FLOOR_HALF_SIZE = 300;
const FLOOR_Y = 0;
const FLOOR_COLOR = vec4(0.25, 0.27, 0.32, 1.0);
const CAMERA_FOV = 45;
const CAMERA_NEAR = 1;
const CAMERA_FAR = 3000;
const CAMERA_START_DISTANCE = 450;
const CAMERA_MIN_DISTANCE = 150;
const CAMERA_MAX_DISTANCE = 1200;
const CAMERA_MIN_ELEVATION = 5; //stops the camera going under the floor
const CAMERA_MAX_ELEVATION = 85; //stops it flipping over the top
const CAMERA_ORBIT_SENSITIVITY = 0.4; // degrees per pixel dragged
const CAMERA_ZOOM_SENSITIVITY = 0.5; // distance per wheel unit
const CAMERA_TARGET = vec3(0, 80, 0);
const LIGHT_POSITION = vec3(150, 450, 150);
const LIGHT_AMBIENT = vec3(0.3, 0.3, 0.3);
const LIGHT_DIFFUSE = vec3(1.0, 1.0, 1.0);
const LIGHT_SPECULAR = vec3(1.0, 1.0, 1.0);
const MATERIAL_SHININESS = 60.0;
const CYLINDER_SEGMENTS = 20;
const TEST_COLOR = vec4(0.9, 1, 0.2, 1.0);
// CAT
const CAT_BODY_RADII = vec3(18, 26, 15);
const CAT_HEAD_RADII = vec3(38, 31, 30);
const CAT_LEG_LENGTH = 24;
const CAT_LEG_RADIUS = 5;
const CAT_LEG_SPACING = 8; // x distance of each leg from the center line
const CAT_PAW_RADII = vec3(7, 5, 11);
const CAT_PAW_FORWARD = 4; // paws sit slightly ahead of the leg
const CAT_HIP_Y = CAT_LEG_LENGTH + CAT_PAW_RADII[1]; // keeps the feet exactly on the floor
const CAT_BODY_CENTER_Y = CAT_HIP_Y + 14;
const CAT_HEAD_OFFSET_Y = 48; // head center above body center
const CAT_ARM_RADII = vec3(6, 20, 8);
const CAT_ARM_OFFSET = vec3(17, 4, 0); // x is mirrored for each side
const CAT_EAR_SIZE = vec3(14, 50, 7); // base radius x, height, base radius z (flat ears)
const CAT_EAR_OFFSET = vec3(22, 45, 0);
const CAT_EAR_TILT = 15; // degrees outward
const CAT_EYE_RADII = vec3(13, 11, 6);
const CAT_EYE_OFFSET = vec3(15, 2, 25);
const CAT_PUPIL_RADII = vec3(3, 7, 2.5);
const CAT_PUPIL_OFFSET = vec3(0, 0, 5);
const CAT_TAIL_BASE = vec3(0, -12, -13); // relative to the body center
const CAT_TAIL_SEGMENTS = 5;
const CAT_TAIL_SEGMENT_LENGTH = 14;
const CAT_TAIL_RADIUS = 4.5;
const CAT_TAIL_START_ANGLE = -80; // degrees: points backward
const CAT_TAIL_BEND = 24; // degrees added per segment, curls it upward
const CAT_SPEC_STRENGTH = 0.8;

// COLORS
const CAT_COLOR = vec4(0.16, 0.16, 0.18, 1.0); // dark grey, not pure black
const EYE_COLOR = vec4(0.92, 0.92, 0.92, 1.0);
const PUPIL_COLOR = vec4(0.02, 0.02, 0.02, 1.0);
const CLICK_DRAG_THRESHOLD_PX = 5; // moved less than this = click, more = drag
// WORLD (add below FLOOR_Y)
const FLOOR_EDGE_MARGIN = 20; // the cat can't be sent closer than this to the floor's edge
const TARGET_MARKER_COLOR = vec4(1.0, 0.8, 0.2, 1.0);
const TARGET_MARKER_RADIUS = 10;

// CAT (add to this group)
const CAT_WALK_SPEED = 120; // world units per second
const CAT_WALK_THRESHOLD = 2; // closer than this to the target = arrived

// GL (add to this group)
const MAX_FRAME_TIME = 0.1; // seconds; stops a huge jump after switching browser tabs
const CAT_TURN_SPEED = 360; // degrees per second

const CAT_LEG_MAX_ANGLE = 35; // degrees
const CAT_SWING_SPEED = 13; // radians per second of walk cycle
const CAT_BLEND_SPEED = 8; // how fast legs ease in/out (per second)
const CAT_BOB_HEIGHT = 3; // world units
const CAT_TAIL_SWAY_ANGLE = 14; // degrees, left/right
const CAT_TAIL_SWAY_SPEED = 2.5; // radians per second
// SHADOW
const SHADOW_COLOR = vec3(0, 0, 0);
const SHADOW_ALPHA = 0.9;
const SHADOW_Y_OFFSET = 0.6; // lifts the shadow off the floor to avoid flicker

// Variables
let canvas;
let gl;
let program;
let aPositionLoc, uModelViewLoc, uProjectionLoc, uColorLoc;
let sphereMesh, floorMesh;
let viewMatrix, projectionMatrix;
let cameraAzimuth = 30; // degrees around the cat
let cameraElevation = 25; // degrees above the floor
let cameraDistance = CAMERA_START_DISTANCE;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let aNormalLoc, uNormalMatrixLoc, uLightPosEyeLoc;
let uAmbientLoc, uDiffuseLoc, uSpecularLoc, uShininessLoc, uSpecStrengthLoc;
let boxMesh, cylinderMesh, coneMesh, ellipsoidMesh; // test meshes for 2.1
// cat
let catPosition = vec3(0, FLOOR_Y, 0);
let catHeading = 0; // degrees, 0 = facing +z
let legAngleLeft = 0;
let legAngleRight = 0;
let mouseDownX = 0;
let mouseDownY = 0;
let catTarget = null; // vec3 on the floor, or null if there's no target yet
let catIsWalking = false;
let lastFrameTime = 0;
let walkPhase = 0;
let legBlend = 0; // 0 = standing, 1 = full walk
let animTime = 0; // total running time in seconds
let catBob = 0;
let tailSway = 0; // degrees
let uUnlitLoc;
let shadowPass = false;
let shadowMatrix;

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2", { stencil: true });
  if (!gl) {
    alert("WebGL 2 isn't available");
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(CLEAR_COLOR[0], CLEAR_COLOR[1], CLEAR_COLOR[2], CLEAR_COLOR[3]);
  gl.enable(gl.DEPTH_TEST);

  // shaders
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  aPositionLoc = gl.getAttribLocation(program, "aPosition");
  uModelViewLoc = gl.getUniformLocation(program, "uModelView");
  uProjectionLoc = gl.getUniformLocation(program, "uProjection");
  uColorLoc = gl.getUniformLocation(program, "uColor");
  uUnlitLoc = gl.getUniformLocation(program, "uUnlit");

  aNormalLoc = gl.getAttribLocation(program, "aNormal");
  uNormalMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");
  uLightPosEyeLoc = gl.getUniformLocation(program, "uLightPosEye");
  uAmbientLoc = gl.getUniformLocation(program, "uAmbient");
  uDiffuseLoc = gl.getUniformLocation(program, "uDiffuse");
  uSpecularLoc = gl.getUniformLocation(program, "uSpecular");
  uShininessLoc = gl.getUniformLocation(program, "uShininess");
  uSpecStrengthLoc = gl.getUniformLocation(program, "uSpecStrength");

  // light colors and shininess never change, so send them once
  gl.uniform3fv(uAmbientLoc, flatten(LIGHT_AMBIENT));
  gl.uniform3fv(uDiffuseLoc, flatten(LIGHT_DIFFUSE));
  gl.uniform3fv(uSpecularLoc, flatten(LIGHT_SPECULAR));
  gl.uniform1f(uShininessLoc, MATERIAL_SHININESS);

  // projection never changes, so send it once
  projectionMatrix = perspective(
    CAMERA_FOV,
    canvas.width / canvas.height,
    CAMERA_NEAR,
    CAMERA_FAR,
  );
  gl.uniformMatrix4fv(uProjectionLoc, false, flatten(projectionMatrix));

  // meshes
  sphereMesh = createMesh(
    makeSphere(50, SPHERE_LAT_SEGMENTS, SPHERE_LONG_SEGMENTS),
  );
  floorMesh = createMesh(makeFloor(FLOOR_HALF_SIZE, FLOOR_Y));

  // 2.1 test meshes (delete after you've checked them)
  boxMesh = createMesh(makeBox(60, 40, 30));
  cylinderMesh = createMesh(makeCylinder(20, 20, 80, CYLINDER_SEGMENTS));
  coneMesh = createMesh(makeCylinder(25, 0, 60, CYLINDER_SEGMENTS));
  ellipsoidMesh = createMesh(
    makeEllipsoid(40, 60, 30, SPHERE_LAT_SEGMENTS, SPHERE_LONG_SEGMENTS),
  );

  setupInput();
  requestAnimationFrame(render);
};

// Uploads positions and indices to the GPU. Returns handles to draw later.
function createMesh(data) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(data.positions), gl.STATIC_DRAW);

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(data.normals), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(data.indices),
    gl.STATIC_DRAW,
  );

  return {
    positionBuffer,
    normalBuffer,
    indexBuffer,
    count: data.indices.length,
  };
}

// specStrength: 0 = matte, 1 = very shiny
function drawMesh(mesh, modelMatrix, color, specStrength = 0.6) {
  let m = modelMatrix;
  if (shadowPass) m = mult(shadowMatrix, modelMatrix); // flatten onto the floor

  const modelView = mult(viewMatrix, m);
  gl.uniformMatrix4fv(uModelViewLoc, false, flatten(modelView));

  if (!shadowPass) {
    gl.uniformMatrix3fv(
      uNormalMatrixLoc,
      false,
      flatten(normalMatrix(modelView, true)),
    );
    gl.uniform4fv(uColorLoc, flatten(color));
    gl.uniform1f(uSpecStrengthLoc, specStrength);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
  gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPositionLoc);

  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
  gl.vertexAttribPointer(aNormalLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aNormalLoc);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
  gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
}

// Draws one body part. `matrix` is the part's position/rotation in the world and is
// what children inherit. `size` stretches only this part's drawing and is NOT passed on.
function drawPart(mesh, matrix, size, color, specStrength = 0.6) {
  const drawMatrix = mult(matrix, scale(size[0], size[1], size[2]));
  drawMesh(mesh, drawMatrix, color, specStrength);
}

// The base meshes were built big (so their vertices are outside NDC range).
// These turn the real sizes above into scale factors. They must match how
// the meshes are created in init:
//   sphereMesh   = makeSphere(50, ...)
//   cylinderMesh = makeCylinder(20, 20, 80, ...)
//   coneMesh     = makeCylinder(25, 0, 60, ...)
function sphereScale(radii) {
  return vec3(radii[0] / 50, radii[1] / 50, radii[2] / 50);
}

function cylinderScale(radius, height) {
  return vec3(radius / 20, height / 80, radius / 20);
}

function coneScale(size) {
  return vec3(size[0] / 25, size[1] / 60, size[2] / 25);
}

// Draws the whole cat. Each part's matrix is built from its parent's matrix.
function drawCat() {
  const root = mult(
    translate(catPosition[0], catPosition[1], catPosition[2]),
    rotateY(catHeading),
  );

  // body
  const body = mult(root, translate(0, CAT_BODY_CENTER_Y + catBob, 0));
  drawPart(
    sphereMesh,
    body,
    sphereScale(CAT_BODY_RADII),
    CAT_COLOR,
    CAT_SPEC_STRENGTH,
  );

  // arms (side = -1 or +1 mirrors everything left/right)
  [-1, 1].forEach(function (side) {
    const arm = mult(
      body,
      translate(side * CAT_ARM_OFFSET[0], CAT_ARM_OFFSET[1], CAT_ARM_OFFSET[2]),
    );
    drawPart(
      sphereMesh,
      arm,
      sphereScale(CAT_ARM_RADII),
      CAT_COLOR,
      CAT_SPEC_STRENGTH,
    );
  });

  // head
  const head = mult(body, translate(0, CAT_HEAD_OFFSET_Y, 0));
  drawPart(
    sphereMesh,
    head,
    sphereScale(CAT_HEAD_RADII),
    CAT_COLOR,
    CAT_SPEC_STRENGTH,
  );

  [-1, 1].forEach(function (side) {
    // ears
    const ear = mult(
      mult(
        head,
        translate(
          side * CAT_EAR_OFFSET[0],
          CAT_EAR_OFFSET[1],
          CAT_EAR_OFFSET[2],
        ),
      ),
      rotateZ(-side * CAT_EAR_TILT),
    );
    drawPart(
      coneMesh,
      ear,
      coneScale(CAT_EAR_SIZE),
      CAT_COLOR,
      CAT_SPEC_STRENGTH,
    );

    // eyes
    const eye = mult(
      head,
      translate(side * CAT_EYE_OFFSET[0], CAT_EYE_OFFSET[1], CAT_EYE_OFFSET[2]),
    );
    drawPart(sphereMesh, eye, sphereScale(CAT_EYE_RADII), EYE_COLOR, 0.3);

    // pupils are children of the eyes
    const pupil = mult(
      eye,
      translate(CAT_PUPIL_OFFSET[0], CAT_PUPIL_OFFSET[1], CAT_PUPIL_OFFSET[2]),
    );
    drawPart(sphereMesh, pupil, sphereScale(CAT_PUPIL_RADII), PUPIL_COLOR, 0.9);
  });

  // legs: children of the root, not the body, so they stay planted when the body bobs later
  const legs = [
    { x: CAT_LEG_SPACING, angle: legAngleLeft },
    { x: -CAT_LEG_SPACING, angle: legAngleRight },
  ];
  legs.forEach(function (leg) {
    // hip = pivot point. Rotating here swings the leg from the top.
    const hip = mult(
      mult(root, translate(leg.x, CAT_HIP_Y, 0)),
      rotateX(leg.angle),
    );

    const legMatrix = mult(hip, translate(0, -CAT_LEG_LENGTH / 2, 0));
    drawPart(
      cylinderMesh,
      legMatrix,
      cylinderScale(CAT_LEG_RADIUS, CAT_LEG_LENGTH),
      CAT_COLOR,
      CAT_SPEC_STRENGTH,
    );

    const paw = mult(hip, translate(0, -CAT_LEG_LENGTH, CAT_PAW_FORWARD));
    drawPart(
      sphereMesh,
      paw,
      sphereScale(CAT_PAW_RADII),
      CAT_COLOR,
      CAT_SPEC_STRENGTH,
    );
  });

  // tail: a chain, each segment bends a little more than the one before it
  const tailBall = vec3(CAT_TAIL_RADIUS, CAT_TAIL_RADIUS, CAT_TAIL_RADIUS);
  let joint = mult(
    mult(
      mult(
        body,
        translate(CAT_TAIL_BASE[0], CAT_TAIL_BASE[1], CAT_TAIL_BASE[2]),
      ),
      rotateY(tailSway),
    ),
    rotateX(CAT_TAIL_START_ANGLE),
  );
  for (let i = 0; i < CAT_TAIL_SEGMENTS; i++) {
    if (i > 0) joint = mult(joint, rotateX(CAT_TAIL_BEND));

    // a ball at each joint fills the gap that opens on the outside of a bend
    drawPart(
      sphereMesh,
      joint,
      sphereScale(tailBall),
      CAT_COLOR,
      CAT_SPEC_STRENGTH,
    );

    const segment = mult(joint, translate(0, CAT_TAIL_SEGMENT_LENGTH / 2, 0));
    drawPart(
      cylinderMesh,
      segment,
      cylinderScale(CAT_TAIL_RADIUS, CAT_TAIL_SEGMENT_LENGTH),
      CAT_COLOR,
      CAT_SPEC_STRENGTH,
    );

    joint = mult(joint, translate(0, CAT_TAIL_SEGMENT_LENGTH, 0));
  }
  drawPart(
    sphereMesh,
    joint,
    sphereScale(tailBall),
    CAT_COLOR,
    CAT_SPEC_STRENGTH,
  ); // rounded tip
}

// Matrix that projects any point onto the plane y = h, along the line from the light through it.
function buildShadowMatrix() {
  const lx = LIGHT_POSITION[0];
  const lz = LIGHT_POSITION[2];
  const h = FLOOR_Y + SHADOW_Y_OFFSET;
  const ly = LIGHT_POSITION[1] - h; // light height measured from the shadow plane

  const s = mat4();
  s[0][0] = ly;
  s[0][1] = -lx;
  s[0][2] = 0;
  s[0][3] = 0;
  s[1][0] = 0;
  s[1][1] = 0;
  s[1][2] = 0;
  s[1][3] = 0; // y becomes 0: flat
  s[2][0] = 0;
  s[2][1] = -lz;
  s[2][2] = ly;
  s[2][3] = 0;
  s[3][0] = 0;
  s[3][1] = -1;
  s[3][2] = 0;
  s[3][3] = ly; // w = ly - y

  // shift the plane down to y = 0, project, shift back up
  return mult(translate(0, h, 0), mult(s, translate(0, -h, 0)));
}

function drawShadow() {
  shadowMatrix = buildShadowMatrix();
  shadowPass = true;

  gl.uniform1f(uUnlitLoc, 1.0); // flat color, no lighting
  gl.uniform4f(
    uColorLoc,
    SHADOW_COLOR[0],
    SHADOW_COLOR[1],
    SHADOW_COLOR[2],
    SHADOW_ALPHA,
  );

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.depthMask(false); // shadow never blocks anything

  gl.enable(gl.STENCIL_TEST);
  gl.stencilFunc(gl.EQUAL, 0, 0xff); // only draw where nothing was drawn yet
  gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR); // then mark the pixel as done

  drawCat();

  gl.disable(gl.STENCIL_TEST);
  gl.depthMask(true);
  gl.disable(gl.BLEND);
  gl.uniform1f(uUnlitLoc, 0.0);
  shadowPass = false;
}

// Moves the cat toward catTarget on the floor plane (x and z only).
function updateCat(dt) {
  if (!catIsWalking || catTarget === null) return;

  const dx = catTarget[0] - catPosition[0];
  const dz = catTarget[2] - catPosition[2];
  const dist = Math.hypot(dx, dz);

  // arrived: snap to the target and stop
  if (dist <= CAT_WALK_THRESHOLD) {
    catPosition[0] = catTarget[0];
    catPosition[2] = catTarget[2];
    catIsWalking = false;
    return;
  }

  // --- turn toward the target ---
  const desiredHeading = (Math.atan2(dx, dz) * 180) / Math.PI;
  let diff = desiredHeading - catHeading;
  diff = ((((diff + 180) % 360) + 360) % 360) - 180; // wrap into -180..180 (shortest way round)
  const maxTurn = CAT_TURN_SPEED * dt;
  catHeading += clamp(diff, -maxTurn, maxTurn); // turn, but never past the target angle

  // --- walk toward the target ---
  const step = Math.min(CAT_WALK_SPEED * dt, dist);
  catPosition[0] += (dx / dist) * step;
  catPosition[2] += (dz / dist) * step;
}

function updateAnimation(dt) {
  animTime += dt;

  // ease legBlend toward 1 while walking, toward 0 while standing
  const goal = catIsWalking ? 1 : 0;
  const maxChange = CAT_BLEND_SPEED * dt;
  legBlend += clamp(goal - legBlend, -maxChange, maxChange);

  // the cycle only runs while there's something to animate
  if (legBlend > 0) walkPhase += CAT_SWING_SPEED * dt;

  // legs: opposite swings
  const swing = Math.sin(walkPhase) * CAT_LEG_MAX_ANGLE * legBlend;
  legAngleLeft = swing;
  legAngleRight = -swing;

  // body bob: highest when the legs pass each other, lowest when they're spread
  catBob = Math.cos(walkPhase * 2) * CAT_BOB_HEIGHT * legBlend;

  // tail sways all the time
  tailSway = Math.sin(animTime * CAT_TAIL_SWAY_SPEED) * CAT_TAIL_SWAY_ANGLE;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Turns (azimuth, elevation, distance) into an eye position and rebuilds the view matrix.
function updateCamera() {
  const az = radians(cameraAzimuth);
  const el = radians(cameraElevation);

  const eye = vec3(
    CAMERA_TARGET[0] + cameraDistance * Math.cos(el) * Math.sin(az),
    CAMERA_TARGET[1] + cameraDistance * Math.sin(el),
    CAMERA_TARGET[2] + cameraDistance * Math.cos(el) * Math.cos(az),
  );

  viewMatrix = lookAt(eye, CAMERA_TARGET, vec3(0, 1, 0));
}

// The shader works in eye space, so the world-space light must be moved
// into eye space every frame (the camera moves, so the result changes).
function uploadLight() {
  const p = [LIGHT_POSITION[0], LIGHT_POSITION[1], LIGHT_POSITION[2], 1.0];
  const eyeLight = [];
  for (let row = 0; row < 3; row++) {
    eyeLight.push(
      viewMatrix[row][0] * p[0] +
        viewMatrix[row][1] * p[1] +
        viewMatrix[row][2] * p[2] +
        viewMatrix[row][3] * p[3],
    );
  }
  gl.uniform3fv(uLightPosEyeLoc, new Float32Array(eyeLight));
}

function setupInput() {
  canvas.addEventListener("mousedown", function (e) {
    if (e.button !== 0) return; // left button only
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    mouseDownX = e.clientX; // remember where the press started
    mouseDownY = e.clientY;
  });

  window.addEventListener("mouseup", function (e) {
    if (e.button !== 0 || !isDragging) return;
    isDragging = false;

    const moved = Math.hypot(e.clientX - mouseDownX, e.clientY - mouseDownY);
    if (moved < CLICK_DRAG_THRESHOLD_PX) {
      onCanvasClick(e.clientX, e.clientY);
    }
  });

  window.addEventListener("mousemove", function (e) {
    if (!isDragging) return;

    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    cameraAzimuth -= dx * CAMERA_ORBIT_SENSITIVITY;
    cameraElevation = clamp(
      cameraElevation + dy * CAMERA_ORBIT_SENSITIVITY,
      CAMERA_MIN_ELEVATION,
      CAMERA_MAX_ELEVATION,
    );
  });

  canvas.addEventListener(
    "wheel",
    function (e) {
      e.preventDefault();
      cameraDistance = clamp(
        cameraDistance + e.deltaY * CAMERA_ZOOM_SENSITIVITY,
        CAMERA_MIN_DISTANCE,
        CAMERA_MAX_DISTANCE,
      );
    },
    { passive: false },
  );
}

// Called only for real clicks (not drags). Converts the mouse position to
// canvas pixel coordinates, with (0,0) at the canvas's top-left corner.
function onCanvasClick(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const px = (clientX - rect.left) * (canvas.width / rect.width);
  const py = (clientY - rect.top) * (canvas.height / rect.height);

  const point = screenToFloor(px, py);
  if (point === null) return; // clicked the sky or somewhere invalid

  catTarget = point;
  catIsWalking = true;
  console.log("target:", point[0].toFixed(1), point[2].toFixed(1));
}

// Multiplies a 4x4 matrix by the point (x, y, z, 1), then divides by w.
function unproject(inv, ndcX, ndcY, ndcZ) {
  const v = [ndcX, ndcY, ndcZ, 1.0];
  const out = [0, 0, 0, 0];
  for (let row = 0; row < 4; row++) {
    out[row] =
      inv[row][0] * v[0] +
      inv[row][1] * v[1] +
      inv[row][2] * v[2] +
      inv[row][3] * v[3];
  }
  return vec3(out[0] / out[3], out[1] / out[3], out[2] / out[3]);
}

// Canvas pixel -> point on the floor (or null if the click doesn't hit it).
function screenToFloor(px, py) {
  // 1. pixel -> NDC (-1..1, with y flipped because pixels count downward)
  const ndcX = (2 * px) / canvas.width - 1;
  const ndcY = 1 - (2 * py) / canvas.height;

  // 2. undo projection and view to get two world-space points on the click's ray
  const inv = inverse(mult(projectionMatrix, viewMatrix));
  const near = unproject(inv, ndcX, ndcY, -1); // on the near plane
  const far = unproject(inv, ndcX, ndcY, 1); // on the far plane

  // 3. where does that line cross the plane y = FLOOR_Y?
  const dy = far[1] - near[1];
  if (Math.abs(dy) < 1e-6) return null; // line parallel to the floor
  const t = (FLOOR_Y - near[1]) / dy;
  if (t < 0 || t > 1) return null; // floor isn't between near and far (sky click)

  // 4. keep the point on the floor, away from the edge
  const limit = FLOOR_HALF_SIZE - FLOOR_EDGE_MARGIN;
  const x = clamp(near[0] + t * (far[0] - near[0]), -limit, limit);
  const z = clamp(near[2] + t * (far[2] - near[2]), -limit, limit);

  return vec3(x, FLOOR_Y, z);
}

function render(now) {
  const dt = Math.min((now - lastFrameTime) / 1000, MAX_FRAME_TIME);
  lastFrameTime = now;

  updateCat(dt);
  updateAnimation(dt);
  updateCamera();
  uploadLight();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

  drawMesh(floorMesh, mat4(), FLOOR_COLOR, 0.1);
  drawShadow(); // new: after the floor, before the cat
  drawCat();

  if (catTarget !== null && catIsWalking) {
    drawPart(
      cylinderMesh,
      translate(catTarget[0], FLOOR_Y + 0.5, catTarget[2]),
      cylinderScale(TARGET_MARKER_RADIUS, 1),
      TARGET_MARKER_COLOR,
      0.2,
    );
  }

  requestAnimationFrame(render);
}

// Builds a sphere centered at the origin, in non NDC
function makeSphere(radius, latSegments, longSegments) {
  const positions = [];
  const normals = [];
  const indices = [];

  // vertices: a (latSegments+1) x (longSegments+1) grid
  for (let i = 0; i <= latSegments; i++) {
    const theta = (Math.PI * i) / latSegments; // 0 = top pole, PI = bottom pole
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    for (let j = 0; j <= longSegments; j++) {
      const phi = (2 * Math.PI * j) / longSegments; // around the sphere
      const nx = sinT * Math.cos(phi);
      const ny = cosT;
      const nz = sinT * Math.sin(phi);

      normals.push(vec3(nx, ny, nz)); // unit length
      positions.push(vec3(radius * nx, radius * ny, radius * nz)); // scaled to world size
    }
  }

  // indices: each grid cell becomes 2 triangles
  for (let i = 0; i < latSegments; i++) {
    for (let j = 0; j < longSegments; j++) {
      const first = i * (longSegments + 1) + j;
      const second = first + longSegments + 1;

      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  return { positions, normals, indices };
}

// Flat square on the xz plane at height y, facing up.
function makeFloor(halfSize, y) {
  const positions = [
    vec3(-halfSize, y, -halfSize), // 0 back-left
    vec3(halfSize, y, -halfSize), // 1 back-right
    vec3(halfSize, y, halfSize), // 2 front-right
    vec3(-halfSize, y, halfSize), // 3 front-left
  ];

  const normals = [vec3(0, 1, 0), vec3(0, 1, 0), vec3(0, 1, 0), vec3(0, 1, 0)];

  const indices = [0, 2, 1, 0, 3, 2];

  return { positions, normals, indices };
}

// Box centered at the origin. 24 vertices (4 per face) so each face has a flat normal.
function makeBox(w, h, d) {
  const x = w / 2,
    y = h / 2,
    z = d / 2;
  const positions = [];
  const normals = [];
  const indices = [];

  const faces = [
    {
      n: vec3(0, 0, 1),
      v: [vec3(-x, -y, z), vec3(x, -y, z), vec3(x, y, z), vec3(-x, y, z)],
    }, // front
    {
      n: vec3(0, 0, -1),
      v: [vec3(x, -y, -z), vec3(-x, -y, -z), vec3(-x, y, -z), vec3(x, y, -z)],
    }, // back
    {
      n: vec3(1, 0, 0),
      v: [vec3(x, -y, z), vec3(x, -y, -z), vec3(x, y, -z), vec3(x, y, z)],
    }, // right
    {
      n: vec3(-1, 0, 0),
      v: [vec3(-x, -y, -z), vec3(-x, -y, z), vec3(-x, y, z), vec3(-x, y, -z)],
    }, // left
    {
      n: vec3(0, 1, 0),
      v: [vec3(-x, y, z), vec3(x, y, z), vec3(x, y, -z), vec3(-x, y, -z)],
    }, // top
    {
      n: vec3(0, -1, 0),
      v: [vec3(-x, -y, -z), vec3(x, -y, -z), vec3(x, -y, z), vec3(-x, -y, z)],
    }, // bottom
  ];

  faces.forEach(function (f) {
    const base = positions.length;
    f.v.forEach(function (p) {
      positions.push(p);
      normals.push(f.n);
    });
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  });

  return { positions, normals, indices };
}

// Tapered cylinder along the y axis, centered at the origin.
// topRadius = 0 gives a cone (apex pointing up). Equal radii give a plain cylinder.
function makeCylinder(bottomRadius, topRadius, height, segments) {
  const positions = [];
  const normals = [];
  const indices = [];
  const h = height / 2;
  const slope = (bottomRadius - topRadius) / height; // tilts side normals upward on a taper

  // side: two rings (bottom and top), smooth normals
  for (let i = 0; i <= segments; i++) {
    const a = (2 * Math.PI * i) / segments;
    const cx = Math.cos(a);
    const cz = Math.sin(a);
    const n = normalize(vec3(cx, slope, cz));

    positions.push(vec3(bottomRadius * cx, -h, bottomRadius * cz));
    normals.push(n);
    positions.push(vec3(topRadius * cx, h, topRadius * cz));
    normals.push(n);
  }
  for (let i = 0; i < segments; i++) {
    const b = i * 2;
    indices.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
  }

  // caps (skipped when that radius is 0, like a cone's tip)
  const caps = [
    { y: -h, r: bottomRadius, ny: -1 },
    { y: h, r: topRadius, ny: 1 },
  ];
  caps.forEach(function (cap) {
    if (cap.r <= 0) return;
    const center = positions.length;
    positions.push(vec3(0, cap.y, 0));
    normals.push(vec3(0, cap.ny, 0));
    for (let i = 0; i <= segments; i++) {
      const a = (2 * Math.PI * i) / segments;
      positions.push(vec3(cap.r * Math.cos(a), cap.y, cap.r * Math.sin(a)));
      normals.push(vec3(0, cap.ny, 0));
    }
    for (let i = 0; i < segments; i++) {
      indices.push(center, center + 1 + i, center + 2 + i);
    }
  });

  return { positions, normals, indices };
}

// Sphere stretched to different radii on each axis (body, head, paws, eyes).
function makeEllipsoid(rx, ry, rz, latSegments, longSegments) {
  const positions = [];
  const normals = [];
  const indices = [];

  for (let i = 0; i <= latSegments; i++) {
    const theta = (Math.PI * i) / latSegments;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    for (let j = 0; j <= longSegments; j++) {
      const phi = (2 * Math.PI * j) / longSegments;
      const nx = sinT * Math.cos(phi);
      const ny = cosT;
      const nz = sinT * Math.sin(phi);

      positions.push(vec3(rx * nx, ry * ny, rz * nz));
      normals.push(normalize(vec3(nx / rx, ny / ry, nz / rz))); // not the same as the position direction
    }
  }

  for (let i = 0; i < latSegments; i++) {
    for (let j = 0; j < longSegments; j++) {
      const first = i * (longSegments + 1) + j;
      const second = first + longSegments + 1;
      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  return { positions, normals, indices };
}
