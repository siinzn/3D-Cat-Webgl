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
const CAMERA_TARGET = vec3(0, 50, 0); // point the camera looks at
const LIGHT_POSITION = vec3(250, 400, 250); // world space
const LIGHT_AMBIENT = vec3(0.3, 0.3, 0.3);
const LIGHT_DIFFUSE = vec3(1.0, 1.0, 1.0);
const LIGHT_SPECULAR = vec3(1.0, 1.0, 1.0);
const MATERIAL_SHININESS = 60.0;
const CYLINDER_SEGMENTS = 20;
const TEST_COLOR = vec4(0.9, 1, 0.2, 1.0);

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

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");
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
  render();
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
  const modelView = mult(viewMatrix, modelMatrix);
  gl.uniformMatrix4fv(uModelViewLoc, false, flatten(modelView));
  gl.uniformMatrix3fv(
    uNormalMatrixLoc,
    false,
    flatten(normalMatrix(modelView, true)),
  );
  gl.uniform4fv(uColorLoc, flatten(color));
  gl.uniform1f(uSpecStrengthLoc, specStrength);

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
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  window.addEventListener("mouseup", function () {
    isDragging = false;
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

function render() {
  updateCamera();
  uploadLight();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawMesh(floorMesh, mat4(), FLOOR_COLOR, 0.1); // floor: nearly matte
  // ---- 2.2 demo: one body with two swinging legs (delete after you've checked it) ----
  const t = performance.now() / 1000;
  const swing = 30 * Math.sin(t * 2);

  const bodyMatrix = translate(0, 140, 0);
  drawPart(ellipsoidMesh, bodyMatrix, vec3(1, 1, 1), TEST_COLOR);

  // left leg: move to the hip, swing around it, then shift down so the leg's top is at the hip
  let hipL = mult(bodyMatrix, translate(20, -55, 0));
  hipL = mult(hipL, rotateX(swing));
  const legL = mult(hipL, translate(0, -40, 0));
  drawPart(cylinderMesh, legL, vec3(1, 1, 1), TEST_COLOR);

  // paw: a child of the left leg, so it follows the swing
  const pawL = mult(legL, translate(0, -40, 0));
  drawPart(sphereMesh, pawL, vec3(0.35, 0.2, 0.5), TEST_COLOR);

  // right leg: opposite swing, thinner (size only affects this leg's drawing)
  let hipR = mult(bodyMatrix, translate(-20, -55, 0));
  hipR = mult(hipR, rotateX(-swing));
  const legR = mult(hipR, translate(0, -40, 0));
  drawPart(cylinderMesh, legR, vec3(0.6, 1, 0.6), TEST_COLOR);

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
