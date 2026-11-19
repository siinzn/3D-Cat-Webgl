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
  drawMesh(sphereMesh, translate(0, 50, 0), TEST_COLOR, 0.8); // sphere: shiny

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
