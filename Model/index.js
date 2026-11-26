// Constants
const CLEAR_COLOR = vec4(0.68, 0.77, 0.86, 1.0); // hazy daytime sky (also the fog color)
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
const CAT_PUPIL_RADII = vec3(3, 7, 2.5); // only x and y are used: the pupil is painted by the shader
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

// COLORS (add below FLOOR_COLOR)
const FLOOR_COLOR_B = vec4(0.17, 0.19, 0.24, 1.0);   // the second checker color; FLOOR_COLOR is the first

// WORLD (add below FLOOR_EDGE_MARGIN)
const FLOOR_CHECK_SIZE = 50;                          // tile size; 600 / 50 = 12 tiles each way

// LIGHT (add to this group)
const RIM_POWER = 3.0;                                // higher = thinner rim
const RIM_STRENGTH = 0.9;
const RIM_COLOR = vec3(0.45, 0.55, 0.9);
const TOON_LEVELS = 4; // diffuse bands on the cat; 0 turns toon shading off
const FILL_LIGHT_DIRECTION = vec3(-0.6, 0.4, -0.7); // world space, points toward the fill light
const FILL_LIGHT_COLOR = vec3(0.18, 0.2, 0.28); // weak and slightly blue
const SPHERE_MESH_RADIUS = 50; // radius sphereMesh is built with (makeSphere(50, ...))

// CAT (click reaction)
const CAT_PICK_RADIUS = 60; // bounding sphere used to detect clicks on the cat
const CAT_PICK_CENTER_Y = 80; // height of that sphere's center above the cat's feet
const CAT_JUMP_HEIGHT = 40; // world units
const CAT_JUMP_DURATION = 0.6; // seconds
const CAT_WIGGLE_ANGLE = 30; // extra tail swing (degrees) while jumping
const CAT_WIGGLE_SPEED = 25; // radians per second

// SCENE
// Fixed layout, placed so nothing overlaps and the middle stays clear for the cat.
const CRATES = [
  { x: -150, z: 80, size: 40, turn: 15 },
  { x: -120, z: 115, size: 28, turn: -25 },
  { x: 230, z: 60, size: 36, turn: 40 },
];
const CRATE_COLOR = vec4(0.6, 0.44, 0.24, 1.0);
const TREES = [
  { x: -190, z: -160, scale: 1.0 },
  { x: 180, z: -170, scale: 1.2 },
  { x: 90, z: 205, scale: 0.9 },
];
const TREE_TRUNK_RADIUS = 9;
const TREE_TRUNK_HEIGHT = 60;
const TREE_LEAF_SIZE = vec3(45, 70, 45); // base radius x, height, base radius z of each cone
const TREE_LEAF_LAYERS = 3; // stacked cones
const TREE_LEAF_STEP = 30; // height between cone layers
const TREE_LEAF_SHRINK = 0.75; // each layer is this much smaller than the one below
const TRUNK_COLOR = vec4(0.36, 0.24, 0.14, 1.0);
const LEAF_COLOR = vec4(0.18, 0.42, 0.22, 1.0);

// COLLISION: every obstacle is a circle on the floor (x, z, radius)
const CAT_COLLISION_RADIUS = 22; // the cat's own "personal space" circle
const CRATE_COLLISION_FACTOR = 0.71; // half a square's diagonal, so the corners are covered
const TREE_COLLISION_RADIUS = 32; // per unit of tree scale (roughly the lowest leaves)
const AVOID_LOOKAHEAD = 60; // start steering this far before touching an obstacle
const AVOID_TOLERANCE = 1; // a path that only grazes an edge by this much doesn't count as blocked
const PUSH_OUT_PASSES = 5; // repeats when obstacles overlap (see pushOutOfObstacles)
const OBSTACLES = CRATES.map(function (c) {
  return { x: c.x, z: c.z, radius: c.size * CRATE_COLLISION_FACTOR };
}).concat(
  TREES.map(function (t) {
    return { x: t.x, z: t.z, radius: TREE_COLLISION_RADIUS * t.scale };
  }),
);

// moving light: orbits the y axis at the starting light's height and distance
const LIGHT_ORBIT_SPEED = 25; // degrees per second
const LIGHT_ORBIT_RADIUS = Math.hypot(LIGHT_POSITION[0], LIGHT_POSITION[2]);
const LIGHT_START_ANGLE =
  (Math.atan2(LIGHT_POSITION[2], LIGHT_POSITION[0]) * 180) / Math.PI;
const LIGHT_MARKER_RADIUS = 12; // the small glowing ball drawn where the light is

// day / night presets (N key switches between them)
const DAY = {
  clear: CLEAR_COLOR,
  ambient: LIGHT_AMBIENT,
  diffuse: LIGHT_DIFFUSE,
  fill: FILL_LIGHT_COLOR,
  marker: vec4(1.0, 0.92, 0.6, 1.0), // sun
};
const NIGHT = {
  clear: vec4(0.02, 0.03, 0.07, 1.0),
  ambient: vec3(0.08, 0.09, 0.14),
  diffuse: vec3(0.45, 0.52, 0.75),
  fill: vec3(0.05, 0.06, 0.12),
  marker: vec4(0.8, 0.85, 1.0, 1.0), // moon
};

// TEXTURES
const GRASS_TEXTURE_UNIT = 0; // texture slot the grass image lives in
const GRASS_IMAGE_URL = "./textures/grass.jpg";
const GRASS_FALLBACK_COLOR = vec4(0.32, 0.45, 0.22, 1.0); // plain green until the image loads
const GRASS_TILE_SIZE = 80; // world units covered by one copy of the image
const GRASS_MACRO_SCALE = 0.13; // a second, much larger copy hides the repeating pattern
const GRASS_MACRO_MIX = 0.35; // how much of that large copy is blended in
const MAX_ANISOTROPY = 8;
const FUR_TEXTURE_UNIT = 1;
const FUR_IMAGE_URL = "./textures/fur.jpg";
const FUR_FALLBACK_COLOR = vec4(0.5, 0.5, 0.5, 1.0); // flat grey = no visible effect
const FUR_TILE = vec2(2, 1); // repeats around / down each part (2:1 keeps strands square on a sphere)
const FUR_STRENGTH = 1.0; // 0 = plain cat color, 1 = full fur light/dark detail
const FUR_CONTRAST = 4.0; // the fur photo only varies by about 11%, so exaggerate it 4x
// Bigger images are shrunk before upload: some GPUs reject huge textures (the
// original 8192px fur failed silently), and 2048 is plenty for this canvas
const MAX_TEXTURE_DIMENSION = 2048;

// what the fragment shader paints on a surface (the uPattern uniform)
const PATTERN_PLAIN = 0;
const PATTERN_CHECKER = 1;
const PATTERN_EYE = 2;
const PATTERN_GRASS = 3;
const PATTERN_FUR = 4;

// FOG: the floor is drawn bigger than the walkable area and fades into the sky
// color between FOG_START and FOG_END (distance from the center), hiding its edge
const FLOOR_DRAW_HALF_SIZE = 1000;
const FOG_START = 320; // just outside the walkable area, so the cat never fades
const FOG_END = 900;

// CAMERA (reset with the R key)
const CAMERA_START_AZIMUTH = 30;
const CAMERA_START_ELEVATION = 25;

// Variables
let canvas;
let gl;
let program;
let aPositionLoc, uModelViewLoc, uProjectionLoc, uColorLoc;
let sphereMesh, floorMesh;
let viewMatrix, projectionMatrix;
let cameraAzimuth = CAMERA_START_AZIMUTH; // degrees around the cat
let cameraElevation = CAMERA_START_ELEVATION; // degrees above the floor
let cameraDistance = CAMERA_START_DISTANCE;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let aNormalLoc, uNormalMatrixLoc, uLightPosEyeLoc;
let uAmbientLoc, uDiffuseLoc, uSpecularLoc, uShininessLoc, uSpecStrengthLoc;
let boxMesh, cylinderMesh, coneMesh, ellipsoidMesh;
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

let uColor2Loc, uPatternLoc, uCheckSizeLoc;
let uRimStrengthLoc, uRimPowerLoc, uRimColorLoc;
let uToonLevelsLoc, uFillDirEyeLoc;
let catJumpTime = -1; // seconds into the current jump, -1 = not jumping
let catJumpHeight = 0;

// scene / keyboard toggles
let uFillColorLoc;
let lightPosition = vec3(LIGHT_POSITION[0], LIGHT_POSITION[1], LIGHT_POSITION[2]);
let lightAngle = LIGHT_START_ANGLE; // degrees around the y axis
let lightOrbiting = false; // L key
let isNight = false; // N key
let shadowEnabled = true; // S key
let rimEnabled = true; // G key
let toonEnabled = true; // T key

// textures
let aTexCoordLoc;
let grassEnabled = true; // C key: grass image texture vs procedural checkerboard
let furEnabled = true; // F key: fur texture on the cat
let blinnEnabled = true; // B key: Blinn-Phong (true) or classic Phong (false) highlights
let fogEnabled = true; // M key (mist)
let uBlinnLoc, uFogStrengthLoc, uFogColorLoc, uInvViewLoc;

// collision avoidance: which way the cat is going round an obstacle
// (+1 or -1), or 0 when nothing is in the way
let catAvoidSide = 0;

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2", { stencil: true });
  if (!gl) {
    alert("WebGL 2 isn't available");
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);

  // shaders
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  aPositionLoc = gl.getAttribLocation(program, "aPosition");
  uModelViewLoc = gl.getUniformLocation(program, "uModelView");
  uProjectionLoc = gl.getUniformLocation(program, "uProjection");
  uColorLoc = gl.getUniformLocation(program, "uColor");
  uUnlitLoc = gl.getUniformLocation(program, "uUnlit");

    uColor2Loc = gl.getUniformLocation(program, "uColor2");
  uPatternLoc = gl.getUniformLocation(program, "uPattern");
  uCheckSizeLoc = gl.getUniformLocation(program, "uCheckSize");
  uRimStrengthLoc = gl.getUniformLocation(program, "uRimStrength");
  uRimPowerLoc = gl.getUniformLocation(program, "uRimPower");
  uRimColorLoc = gl.getUniformLocation(program, "uRimColor");

  // these never change, so send them once
  gl.uniform4fv(uColor2Loc, flatten(FLOOR_COLOR_B));
  gl.uniform1f(uCheckSizeLoc, FLOOR_CHECK_SIZE);
  gl.uniform1f(uRimPowerLoc, RIM_POWER);
  gl.uniform3fv(uRimColorLoc, flatten(RIM_COLOR));

  uToonLevelsLoc = gl.getUniformLocation(program, "uToonLevels");
  uFillDirEyeLoc = gl.getUniformLocation(program, "uFillDirEye");
  uFillColorLoc = gl.getUniformLocation(program, "uFillColor");
  uFogColorLoc = gl.getUniformLocation(program, "uFogColor"); // set by applyTimeOfDay
  uBlinnLoc = gl.getUniformLocation(program, "uBlinn");
  uFogStrengthLoc = gl.getUniformLocation(program, "uFogStrength");
  uInvViewLoc = gl.getUniformLocation(program, "uInvView");
  gl.uniform1f(gl.getUniformLocation(program, "uFogStart"), FOG_START);
  gl.uniform1f(gl.getUniformLocation(program, "uFogEnd"), FOG_END);

  // procedural pupil: its size as a fraction of the eye's radius
  gl.uniform2f(
    gl.getUniformLocation(program, "uPupilSize"),
    CAT_PUPIL_RADII[0] / CAT_EYE_RADII[0],
    CAT_PUPIL_RADII[1] / CAT_EYE_RADII[1],
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "uPupilColor"),
    flatten(PUPIL_COLOR),
  );
  gl.uniform1f(
    gl.getUniformLocation(program, "uMeshRadius"),
    SPHERE_MESH_RADIUS,
  );

  aNormalLoc = gl.getAttribLocation(program, "aNormal");
  uNormalMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");
  uLightPosEyeLoc = gl.getUniformLocation(program, "uLightPosEye");
  uAmbientLoc = gl.getUniformLocation(program, "uAmbient");
  uDiffuseLoc = gl.getUniformLocation(program, "uDiffuse");
  uSpecularLoc = gl.getUniformLocation(program, "uSpecular");
  uShininessLoc = gl.getUniformLocation(program, "uShininess");
  uSpecStrengthLoc = gl.getUniformLocation(program, "uSpecStrength");

  // specular and shininess never change, so send them once.
  // ambient, diffuse, fill and clear color depend on day/night (applyTimeOfDay)
  applyTimeOfDay();
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
  floorMesh = createMesh(makeFloor(FLOOR_DRAW_HALF_SIZE, FLOOR_Y));

  // more primitives (cat parts, scene objects)
  boxMesh = createMesh(makeBox(50, 50, 50)); // cube, used for crates
  cylinderMesh = createMesh(makeCylinder(20, 20, 80, CYLINDER_SEGMENTS));
  coneMesh = createMesh(makeCylinder(25, 0, 60, CYLINDER_SEGMENTS));
  ellipsoidMesh = createMesh(
    makeEllipsoid(40, 60, 30, SPHERE_LAT_SEGMENTS, SPHERE_LONG_SEGMENTS),
  );

  // grass on the floor: repeats across the ground
  aTexCoordLoc = gl.getAttribLocation(program, "aTexCoord");
  gl.uniform1i(gl.getUniformLocation(program, "uGrass"), GRASS_TEXTURE_UNIT);
  gl.uniform1f(gl.getUniformLocation(program, "uGrassMacroScale"), GRASS_MACRO_SCALE);
  gl.uniform1f(gl.getUniformLocation(program, "uGrassMacroMix"), GRASS_MACRO_MIX);
  loadTexture(GRASS_IMAGE_URL, GRASS_TEXTURE_UNIT, GRASS_FALLBACK_COLOR,
    gl.REPEAT, gl.REPEAT);

  // fur on the cat: a second image on its own texture unit
  gl.uniform1i(gl.getUniformLocation(program, "uFur"), FUR_TEXTURE_UNIT);
  gl.uniform2fv(gl.getUniformLocation(program, "uFurTile"), flatten(FUR_TILE));
  gl.uniform1f(gl.getUniformLocation(program, "uFurStrength"), FUR_STRENGTH);
  gl.uniform1f(gl.getUniformLocation(program, "uFurContrast"), FUR_CONTRAST);
  loadTexture(FUR_IMAGE_URL, FUR_TEXTURE_UNIT, FUR_FALLBACK_COLOR,
    gl.REPEAT, gl.REPEAT);

  setupInput();
  requestAnimationFrame(render);
};

// Returns the image itself if it's small enough for the GPU, otherwise a scaled-down
// copy drawn onto a canvas (WebGL accepts a canvas anywhere it accepts an image).
function shrinkImage(image) {
  const limit = Math.min(MAX_TEXTURE_DIMENSION, gl.getParameter(gl.MAX_TEXTURE_SIZE));
  const factor = Math.min(1, limit / Math.max(image.width, image.height));
  if (factor === 1) return image;

  const c = document.createElement("canvas");
  c.width = Math.round(image.width * factor);
  c.height = Math.round(image.height * factor);
  c.getContext("2d").drawImage(image, 0, 0, c.width, c.height);
  console.info(image.src + " shrunk to " + c.width + "x" + c.height);
  return c;
}

// Creates a texture on the given unit and starts loading the image into it.
// Until the image arrives (or if it fails), the texture is one pixel of fallbackColor,
// so the scene always draws. Returns the texture right away.
function loadTexture(url, unit, fallbackColor, wrapS, wrapT) {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  const c = fallbackColor;
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([c[0] * 255, c[1] * 255, c[2] * 255, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const image = new Image();
  image.onload = function () {
    try {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, shrinkImage(image));
      gl.generateMipmap(gl.TEXTURE_2D); // smaller copies for when it's seen from far away
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

      // anisotropic filtering keeps the ground sharp at low viewing angles
      const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
      if (aniso) {
        const max = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT,
          Math.min(MAX_ANISOTROPY, max));
      }
    } catch (err) {
      // opening index.html straight from disk (file://) blocks images in WebGL
      console.warn("Texture " + url + " blocked; run the page from a local server.", err);
    }
  };
  image.onerror = function () {
    console.warn("Texture not found: " + url);
  };
  image.src = url;
  return texture;
}

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

  // texture coordinates are optional: a mesh without them reads (0, 0) in the shader
  let texCoordBuffer = null;
  if (data.texCoords) {
    texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data.texCoords), gl.STATIC_DRAW);
  }

  return {
    positionBuffer,
    normalBuffer,
    texCoordBuffer,
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

  if (mesh.texCoordBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.texCoordBuffer);
    gl.vertexAttribPointer(aTexCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTexCoordLoc);
  } else {
    gl.disableVertexAttribArray(aTexCoordLoc); // the shader then reads (0, 0)
  }

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

//   boxMesh      = makeBox(50, 50, 50)
function boxScale(size) {
  return vec3(size[0] / 50, size[1] / 50, size[2] / 50);
}

// Scene props (trees and crates). Everything sits on the floor (y = FLOOR_Y).
function drawScene() {
  TREES.forEach(function (tree) {
    const base = mult(
      translate(tree.x, FLOOR_Y, tree.z),
      scale(tree.scale, tree.scale, tree.scale),
    );

    // trunk: the cylinder is centered, so lift it by half its height
    drawPart(
      cylinderMesh,
      mult(base, translate(0, TREE_TRUNK_HEIGHT / 2, 0)),
      cylinderScale(TREE_TRUNK_RADIUS, TREE_TRUNK_HEIGHT),
      TRUNK_COLOR,
      0.1,
    );

    // leaves: cones stacked on top of the trunk, each one smaller
    let size = TREE_LEAF_SIZE;
    for (let i = 0; i < TREE_LEAF_LAYERS; i++) {
      const y = TREE_TRUNK_HEIGHT + size[1] / 2 + i * TREE_LEAF_STEP;
      drawPart(coneMesh, mult(base, translate(0, y, 0)), coneScale(size), LEAF_COLOR, 0.15);
      size = scale(TREE_LEAF_SHRINK, size);
    }
  });

  CRATES.forEach(function (crate) {
    const m = mult(
      translate(crate.x, FLOOR_Y + crate.size / 2, crate.z),
      rotateY(crate.turn),
    );
    drawPart(
      boxMesh,
      m,
      boxScale(vec3(crate.size, crate.size, crate.size)),
      CRATE_COLOR,
      0.1,
    );
  });
}

// Small unlit ball where the light is, so you can see it move.
function drawLightMarker() {
  const preset = isNight ? NIGHT : DAY;
  gl.uniform1f(uUnlitLoc, 1.0);
  drawPart(
    sphereMesh,
    translate(lightPosition[0], lightPosition[1], lightPosition[2]),
    sphereScale(
      vec3(LIGHT_MARKER_RADIUS, LIGHT_MARKER_RADIUS, LIGHT_MARKER_RADIUS),
    ),
    preset.marker,
  );
  gl.uniform1f(uUnlitLoc, 0.0);
}

// Draws the whole cat. Each part's matrix is built from its parent's matrix.
function drawCat() {
  // every cat part gets the fur texture, except the eyes (they switch pattern below)
  const catPattern = furEnabled ? PATTERN_FUR : PATTERN_PLAIN;
  gl.uniform1f(uPatternLoc, catPattern);

  const root = mult(
    translate(catPosition[0], catPosition[1] + catJumpHeight, catPosition[2]),
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

    // eyes: white spheres, the pupil is painted on by the fragment shader (uPattern 2)
    const eye = mult(
      head,
      translate(side * CAT_EYE_OFFSET[0], CAT_EYE_OFFSET[1], CAT_EYE_OFFSET[2]),
    );
    gl.uniform1f(uPatternLoc, PATTERN_EYE);
    drawPart(sphereMesh, eye, sphereScale(CAT_EYE_RADII), EYE_COLOR, 0.9);
    gl.uniform1f(uPatternLoc, catPattern); // back to fur for the rest of the cat
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

  gl.uniform1f(uPatternLoc, PATTERN_PLAIN); // don't leak the fur onto whatever draws next
}

// Matrix that projects any point onto the plane y = h, along the line from the light through it.
function buildShadowMatrix() {
  const lx = lightPosition[0];
  const lz = lightPosition[2];
  const h = FLOOR_Y + SHADOW_Y_OFFSET;
  const ly = lightPosition[1] - h; // light height measured from the shadow plane

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

  drawScene();
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
    catAvoidSide = 0;
    return;
  }

  // --- which way to walk: straight at the target, bent around anything in the way ---
  const dir = steerAroundObstacles(dx / dist, dz / dist, dist);

  // --- turn to face the way we're walking ---
  const desiredHeading = (Math.atan2(dir[0], dir[1]) * 180) / Math.PI;
  let diff = desiredHeading - catHeading;
  diff = ((((diff + 180) % 360) + 360) % 360) - 180; // wrap into -180..180 (shortest way round)
  const maxTurn = CAT_TURN_SPEED * dt;
  catHeading += clamp(diff, -maxTurn, maxTurn); // turn, but never past the target angle

  // --- walk ---
  const step = Math.min(CAT_WALK_SPEED * dt, dist);
  catPosition[0] += dir[0] * step;
  catPosition[2] += dir[1] * step;
  pushOutOfObstacles(catPosition); // safety net: never end a frame inside something
}

// Steering: if an obstacle sits on the straight line to the target, blend the walking
// direction toward the obstacle's tangent (going round it), more strongly the closer we get.
// (dirX, dirZ) is the unit direction to the target. Returns the direction to walk in.
function steerAroundObstacles(dirX, dirZ, distToTarget) {
  let block = null; // the nearest obstacle that's actually in the way

  OBSTACLES.forEach(function (o) {
    const ox = o.x - catPosition[0]; // cat -> obstacle center
    const oz = o.z - catPosition[2];
    const centerDist = Math.hypot(ox, oz);
    const r = o.radius + CAT_COLLISION_RADIUS; // how close the cat's center may get

    if (centerDist - r > AVOID_LOOKAHEAD) return; // too far away to worry about yet

    // Does the straight line from the cat to the target cut into this circle?
    // Find the point on that line closest to the center (dot product = distance along
    // the line, clamped so it stays between the cat and the target), then measure.
    const along = clamp(ox * dirX + oz * dirZ, 0, distToTarget);
    const gap = Math.hypot(ox - dirX * along, oz - dirZ * along);
    if (gap >= r - AVOID_TOLERANCE) return; // the path misses it (or only grazes the edge)

    if (block === null || centerDist < block.centerDist) {
      block = { ox, oz, centerDist, r };
    }
  });

  if (block === null) {
    catAvoidSide = 0; // path is clear: forget which side we were going round
    return [dirX, dirZ];
  }

  // unit vector from the obstacle's center out to the cat
  const nx = -block.ox / block.centerDist;
  const nz = -block.oz / block.centerDist;

  // the two ways round are the two tangents, (-nz, nx) and (nz, -nx). Pick the one that
  // already points roughly toward the target, then stick with it until the path is clear,
  // so the cat doesn't dither left/right (this also gets it round clusters of obstacles).
  if (catAvoidSide === 0) {
    catAvoidSide = -nz * dirX + nx * dirZ >= 0 ? 1 : -1;
  }
  const tx = -nz * catAvoidSide;
  const tz = nx * catAvoidSide;

  // 0 = far away (head for the target), 1 = touching (walk along the edge)
  const w = clamp(1 - (block.centerDist - block.r) / AVOID_LOOKAHEAD, 0, 1);
  const sx = dirX * (1 - w) + tx * w;
  const sz = dirZ * (1 - w) + tz * w;
  const len = Math.hypot(sx, sz) || 1;
  return [sx / len, sz / len];
}

// Moves a floor point (vec3, only x and z are used) out of any obstacle it's inside,
// to the nearest spot on that obstacle's edge. Repeated a few times, because pushing out
// of one obstacle can push the point into a neighbouring one (the two crates overlap).
function pushOutOfObstacles(p) {
  for (let pass = 0; pass < PUSH_OUT_PASSES; pass++) {
    let moved = false;
    OBSTACLES.forEach(function (o) {
      let ox = p[0] - o.x;
      let oz = p[2] - o.z;
      let d = Math.hypot(ox, oz);
      const r = o.radius + CAT_COLLISION_RADIUS;
      if (d >= r) return;
      if (d < 1e-6) { // exactly on the center: pick any direction
        ox = 1;
        oz = 0;
        d = 1;
      }
      p[0] = o.x + (ox / d) * r;
      p[2] = o.z + (oz / d) * r;
      moved = true;
    });
    if (!moved) return;
  }
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

  // jump: one half sine wave, up and back down, over CAT_JUMP_DURATION
  if (catJumpTime >= 0) {
    catJumpTime += dt;
    const t = catJumpTime / CAT_JUMP_DURATION;
    if (t >= 1) {
      catJumpTime = -1;
      catJumpHeight = 0;
    } else {
      catJumpHeight = Math.sin(Math.PI * t) * CAT_JUMP_HEIGHT;
    }
  }
  const jumpAmount = catJumpHeight / CAT_JUMP_HEIGHT; // 0..1, peaks mid-jump

  // tail sways all the time, plus a fast wiggle while jumping
  tailSway =
    Math.sin(animTime * CAT_TAIL_SWAY_SPEED) * CAT_TAIL_SWAY_ANGLE +
    Math.sin(animTime * CAT_WIGGLE_SPEED) * CAT_WIGGLE_ANGLE * jumpAmount;
}

function startJump() {
  if (catJumpTime < 0) catJumpTime = 0; // ignore clicks while already in the air
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
  const p = [lightPosition[0], lightPosition[1], lightPosition[2], 1.0];
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

  // the fill light is a direction (w = 0), so only the view's rotation applies
  const d = FILL_LIGHT_DIRECTION;
  const eyeFill = [];
  for (let row = 0; row < 3; row++) {
    eyeFill.push(
      viewMatrix[row][0] * d[0] +
        viewMatrix[row][1] * d[1] +
        viewMatrix[row][2] * d[2],
    );
  }
  gl.uniform3fv(uFillDirEyeLoc, new Float32Array(eyeFill));
}

// Moves the light around the y axis when orbiting is on (L key).
function updateLight(dt) {
  if (!lightOrbiting) return;
  lightAngle += LIGHT_ORBIT_SPEED * dt;
  const a = radians(lightAngle);
  lightPosition = vec3(
    LIGHT_ORBIT_RADIUS * Math.cos(a),
    LIGHT_POSITION[1],
    LIGHT_ORBIT_RADIUS * Math.sin(a),
  );
}

// Sends the light colors and clear (sky) color for the current time of day.
function applyTimeOfDay() {
  const preset = isNight ? NIGHT : DAY;
  gl.clearColor(preset.clear[0], preset.clear[1], preset.clear[2], preset.clear[3]);
  gl.uniform3fv(uAmbientLoc, flatten(preset.ambient));
  gl.uniform3fv(uDiffuseLoc, flatten(preset.diffuse));
  gl.uniform3fv(uFillColorLoc, flatten(preset.fill));
  // fog fades into the sky color, so the far floor melts into the background
  gl.uniform3f(uFogColorLoc, preset.clear[0], preset.clear[1], preset.clear[2]);
}

function resetCamera() {
  cameraAzimuth = CAMERA_START_AZIMUTH;
  cameraElevation = CAMERA_START_ELEVATION;
  cameraDistance = CAMERA_START_DISTANCE;
}

function onKeyDown(e) {
  if (e.repeat) return; // holding a key down shouldn't toggle it over and over
  switch (e.key.toLowerCase()) {
    case "r":
      resetCamera();
      break;
    case "s":
      shadowEnabled = !shadowEnabled;
      break;
    case "g":
      rimEnabled = !rimEnabled;
      break;
    case "t":
      toonEnabled = !toonEnabled;
      break;
    case "l":
      lightOrbiting = !lightOrbiting;
      break;
    case "n":
      isNight = !isNight;
      applyTimeOfDay();
      break;
    case "c":
      grassEnabled = !grassEnabled;
      break;
    case "f":
      furEnabled = !furEnabled;
      break;
    case "b":
      blinnEnabled = !blinnEnabled;
      break;
    case "m":
      fogEnabled = !fogEnabled;
      break;
  }
}

function setupInput() {
  window.addEventListener("keydown", onKeyDown);

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

  const ray = screenToRay(px, py);

  // clicking the cat makes it jump instead of walking
  if (rayHitsCat(ray)) {
    startJump();
    return;
  }

  const point = rayToFloor(ray);
  if (point === null) return; // clicked the sky or somewhere invalid

  pushOutOfObstacles(point); // clicked on a crate or tree? stop just beside it instead
  catTarget = point;
  catIsWalking = true;
  catAvoidSide = 0;
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

// Canvas pixel -> the click's ray in world space, as two points (near and far plane).
function screenToRay(px, py) {
  // pixel -> NDC (-1..1, with y flipped because pixels count downward)
  const ndcX = (2 * px) / canvas.width - 1;
  const ndcY = 1 - (2 * py) / canvas.height;

  // undo projection and view
  const inv = inverse(mult(projectionMatrix, viewMatrix));
  return {
    near: unproject(inv, ndcX, ndcY, -1),
    far: unproject(inv, ndcX, ndcY, 1),
  };
}

// Ray vs the cat's bounding sphere. Solves |near + t*dir - center|^2 = r^2 for t.
function rayHitsCat(ray) {
  const center = vec3(
    catPosition[0],
    catPosition[1] + catJumpHeight + CAT_PICK_CENTER_Y,
    catPosition[2],
  );
  const dir = normalize(subtract(ray.far, ray.near));
  const oc = subtract(ray.near, center);
  const b = dot(oc, dir);
  const c = dot(oc, oc) - CAT_PICK_RADIUS * CAT_PICK_RADIUS;
  const disc = b * b - c;
  if (disc < 0) return false; // the line misses the sphere
  return -b + Math.sqrt(disc) >= 0; // and the sphere isn't behind the camera
}

// The click's ray -> point on the floor (or null if it doesn't hit the floor).
function rayToFloor(ray) {
  const near = ray.near;
  const far = ray.far;

  // where does that line cross the plane y = FLOOR_Y?
  const dy = far[1] - near[1];
  if (Math.abs(dy) < 1e-6) return null; // line parallel to the floor
  const t = (FLOOR_Y - near[1]) / dy;
  if (t < 0 || t > 1) return null; // floor isn't between near and far (sky click)

  // keep the point on the floor, away from the edge
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
  updateLight(dt);
  updateCamera();
  uploadLight();
  gl.uniformMatrix4fv(uInvViewLoc, false, flatten(inverse(viewMatrix))); // for the fog
  gl.uniform1f(uBlinnLoc, blinnEnabled ? 1.0 : 0.0);
  gl.uniform1f(uFogStrengthLoc, fogEnabled ? 1.0 : 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

  // floor: grass texture or procedural checkerboard, rim off
  gl.uniform1f(uPatternLoc, grassEnabled ? PATTERN_GRASS : PATTERN_CHECKER);
  gl.uniform1f(uRimStrengthLoc, 0.0);
  drawMesh(floorMesh, mat4(), FLOOR_COLOR, 0.1);
  gl.uniform1f(uPatternLoc, PATTERN_PLAIN);

  if (shadowEnabled) drawShadow();

  drawScene();
  drawLightMarker();

  // cat: rim light and toon shading (each can be toggled from the keyboard)
  gl.uniform1f(uRimStrengthLoc, rimEnabled ? RIM_STRENGTH : 0.0);
  gl.uniform1f(uToonLevelsLoc, toonEnabled ? TOON_LEVELS : 0.0);
  drawCat();
  gl.uniform1f(uRimStrengthLoc, 0.0);
  gl.uniform1f(uToonLevelsLoc, 0.0);

  if (catTarget !== null && catIsWalking) {
    drawPart(cylinderMesh,
             translate(catTarget[0], FLOOR_Y + 0.5, catTarget[2]),
             cylinderScale(TARGET_MARKER_RADIUS, 1),
             TARGET_MARKER_COLOR, 0.2);
  }

  requestAnimationFrame(render);
}

// Builds a sphere centered at the origin, in non NDC
function makeSphere(radius, latSegments, longSegments) {
  const positions = [];
  const normals = [];
  const texCoords = [];
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
      // wrap the image around like a world map: u = around, v = top to bottom
      texCoords.push(vec2(j / longSegments, i / latSegments));
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

  return { positions, normals, texCoords, indices };
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

  // texture coordinates: the image repeats once every GRASS_TILE_SIZE world units
  // (values past 0..1 make the GPU wrap around, because the texture uses REPEAT)
  const texCoords = positions.map(function (p) {
    return vec2(p[0] / GRASS_TILE_SIZE, p[2] / GRASS_TILE_SIZE);
  });

  return { positions, normals, texCoords, indices };
}

// Box centered at the origin. 24 vertices (4 per face) so each face has a flat normal.
function makeBox(w, h, d) {
  const x = w / 2,
    y = h / 2,
    z = d / 2;
  const positions = [];
  const normals = [];
  const texCoords = [];
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
    // the whole image on every face, corners in the same order as f.v
    texCoords.push(vec2(0, 0), vec2(1, 0), vec2(1, 1), vec2(0, 1));
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  });

  return { positions, normals, texCoords, indices };
}

// Tapered cylinder along the y axis, centered at the origin.
// topRadius = 0 gives a cone (apex pointing up). Equal radii give a plain cylinder.
function makeCylinder(bottomRadius, topRadius, height, segments) {
  const positions = [];
  const normals = [];
  const texCoords = [];
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
    // the image is wrapped around the side like a label: u = around, v = bottom to top
    texCoords.push(vec2(i / segments, 1), vec2(i / segments, 0));
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
    texCoords.push(vec2(0.5, 0.5)); // caps: the image laid flat, center in the middle
    for (let i = 0; i <= segments; i++) {
      const a = (2 * Math.PI * i) / segments;
      positions.push(vec3(cap.r * Math.cos(a), cap.y, cap.r * Math.sin(a)));
      normals.push(vec3(0, cap.ny, 0));
      texCoords.push(vec2(0.5 + 0.5 * Math.cos(a), 0.5 + 0.5 * Math.sin(a)));
    }
    for (let i = 0; i < segments; i++) {
      indices.push(center, center + 1 + i, center + 2 + i);
    }
  });

  return { positions, normals, texCoords, indices };
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
