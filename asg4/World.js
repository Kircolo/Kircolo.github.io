// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    // v_Normal = a_Normal; // temp
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
    v_VertPos = u_ModelMatrix * a_Position;
  }`

var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform sampler2D u_Sampler5;
  uniform sampler2D u_Sampler6;
  uniform sampler2D u_Sampler7;
  //uniform sampler2D u_Sampler;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;

  void main() {

    if(u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0) / 2.0, 1.0); // use normal
    }
    else if(u_whichTexture == -2) {
      gl_FragColor = u_FragColor;                 // use color
    }
    else if(u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);        // use UV
    }
    else if(u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV); // use texture0
    }
    else if(u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV); // use texture1
    }
    else if(u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV); // use texture2
    }
    else if(u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV); // use texture3
    }
    else if(u_whichTexture == 4) {
      gl_FragColor = texture2D(u_Sampler4, v_UV); // use texture4
    }
    else if(u_whichTexture == 5) {
      gl_FragColor = texture2D(u_Sampler5, v_UV); // use texture5
    }
    else if(u_whichTexture == 6) {
      gl_FragColor = texture2D(u_Sampler6, v_UV); // use texture6
    }
    else if(u_whichTexture == 7) {
      gl_FragColor = texture2D(u_Sampler7, v_UV); // use texture7
    }
    else {
      gl_FragColor = vec4(1,.2,.2,1);             // ERROR; use reddish
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);

    // Reflection
    vec3 R = reflect(-L, N);

    // Eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    // Specular
    float specular = pow(max(dot(R, E), 0.0), 64.0) * 0.8;

    vec3 diffuse = vec3(1.0, 1.0, 0.9) * vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.2;

    if(u_lightOn) {
      if(u_whichTexture != 0 && u_whichTexture != 1 && u_whichTexture != 2 && u_whichTexture != 6) {
        gl_FragColor = vec4(diffuse + ambient + specular, 1.0);
      }
      else {
        gl_FragColor = vec4(diffuse + ambient, 1.0);
      }
    }

  }`

// globals
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_whichTexture;
// let u_Sampler;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;
let u_Sampler6;
let u_Sampler7;
let u_lightPos;
let u_cameraPos;
let u_lightOn;
let u_NormalMatrix;

let g_camera = new Camera();
function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }
  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }
  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  // Get the storage location of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_NormalMatrix
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return false;
  }

  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4) {
    console.log('Failed to get the storage location of u_Sampler4');
    return false;
  }

  u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
  if (!u_Sampler5) {
    console.log('Failed to get the storage location of u_Sampler5');
    return false;
  }

  u_Sampler6 = gl.getUniformLocation(gl.program, 'u_Sampler6');
  if (!u_Sampler6) {
    console.log('Failed to get the storage location of u_Sampler6');
    return false;
  }

  u_Sampler7 = gl.getUniformLocation(gl.program, 'u_Sampler7');
  if (!u_Sampler7) {
    console.log('Failed to get the storage location of u_Sampler7');
    return false;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function initTextures() {
  // Create the image object
  var image0 = new Image();
  var image1 = new Image();
  var image2 = new Image();
  var image3 = new Image();
  var image4 = new Image();
  var image5 = new Image();
  var image6 = new Image();
  var image7 = new Image();

  if (!image0 || !image1 || !image2 || !image3 || !image4 || !image5 || !image6 || !image7) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  // Tell the browser to load an image
  image0.onload = function() { sendTextureToTEXTURE0(image0); };
  image0.src = 'img/sky.jpg';
  image1.onload = function() { sendTextureToTEXTURE1(image1); };
  image1.src = 'img/grass.jpg';
  image2.onload = function() { sendTextureToTEXTURE2(image2); };
  image2.src = 'img/stone.jpg';
  image3.onload = function() { sendTextureToTEXTURE3(image3); };
  image3.src = 'img/diamonds.jpg';
  image4.onload = function() { sendTextureToTEXTURE4(image4); };
  image4.src = 'img/emeralds.jpg';
  image5.onload = function() { sendTextureToTEXTURE5(image5); };
  image5.src = 'img/gold.jpg';
  image6.onload = function() { sendTextureToTEXTURE6(image6); };
  image6.src = 'img/wood.jpg';
  image7.onload = function() { sendTextureToTEXTURE7(image7); };
  image7.src = 'img/obsidian.jpg';

  return true;
}

function sendTextureToTEXTURE0(image) {
  // Create a texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Flip the image's y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Enable texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // this is something i found that fixes the blacked out cube bug
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // Set the image to texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  // Pass the texture unit to u_Sampler
  gl.uniform1i(u_Sampler0, 0);

  console.log("Finished loading texture0");
}

function sendTextureToTEXTURE1(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler1, 1);

  console.log("Finished loading texture1");
}

function sendTextureToTEXTURE2(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler2, 2);

  console.log("Finished loading texture2");
}

function sendTextureToTEXTURE3(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler3, 3);

  console.log("Finished loading texture3");
}

function sendTextureToTEXTURE4(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE4);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler4, 4);

  console.log("Finished loading texture4");
}

function sendTextureToTEXTURE5(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE5);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler5, 5);

  console.log("Finished loading texture5");
}

function sendTextureToTEXTURE6(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE6);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler6, 6);

  console.log("Finished loading texture6");
}

function sendTextureToTEXTURE7(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE7);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler7, 7);

  console.log("Finished loading texture7");
}

//ui globals & defaults
let g_globalAnglex = 0.0;
let g_globalAngley = 0.0;
let frontLeftSlider = 0.0;
let frontRightSlider = 0.0;
let midLeftSlider = 0.0;
let midRightSlider = 0.0;
let backLeftSlider = 0.0;
let backRightSlider = 0.0;
let g_frontLeftAnimation = false;
let g_frontRightAnimation = false;
let g_midLeftAnimation = false;
let g_midRightAnimation = false;
let g_backLeftAnimation = false;
let g_backRightAnimation = false;
let g_wingAngle = 0.0;
let g_wingAnimation = false;
let g_normalOn = false;
let g_lightPos = [0, 1, -2]; // default light position
let g_magentaAnimation = false;
let g_yellowAnimation = false;
let g_yellowAngle = 0.0;
let g_magentaAngle = 0.0;
let g_lightOn = true;

function addActionsForHtmlUI() {
  // Button Events
  document.getElementById('normalOn').onclick = function() {g_normalOn = true;};
  document.getElementById('normalOff').onclick = function() {g_normalOn = false;};
  document.getElementById('AnimationMagentaOn').onclick = function() { g_magentaAnimation = true; };
  document.getElementById('AnimationMagentaOff').onclick = function() { g_magentaAnimation = false; };
  document.getElementById('AnimationYellowOn').onclick = function() { g_yellowAnimation = true; };
  document.getElementById('AnimationYellowOff').onclick = function() { g_yellowAnimation = false; };
  document.getElementById('lightOn').onclick = function() { g_lightOn = true; };
  document.getElementById('lightOff').onclick = function() { g_lightOn = false; };

  // Color Slider Events
  document.getElementById('magentaSlide').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_magentaAngle = this.value; renderAllShapes(); } });
  document.getElementById('yellowSlide').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_yellowAngle = this.value; renderAllShapes(); } });
  document.getElementById('lightSlideX').addEventListener('mousemove', function() { g_lightPos[0] = this.value/100; renderAllShapes(); });
  document.getElementById('lightSlideY').addEventListener('mousemove', function() { g_lightPos[1] = this.value/100; renderAllShapes(); });
  document.getElementById('lightSlideZ').addEventListener('mousemove', function() { g_lightPos[2] = this.value/100; renderAllShapes(); });
  

  // Animations
  document.getElementById('AnimationOn').onclick = function() {
    g_frontLeftAnimation = true;
    g_frontRightAnimation = true;
    g_midLeftAnimation = true;
    g_midRightAnimation = true;
    g_backLeftAnimation = true;
    g_backRightAnimation = true;
  };
  document.getElementById('AnimationOff').onclick = function() {
    g_frontLeftAnimation = false;
    g_frontRightAnimation = false;
    g_midLeftAnimation = false;
    g_midRightAnimation = false;
    g_backLeftAnimation = false;
    g_backRightAnimation = false;
  };

  //shift click
  function shiftClick(ev) {
    if(ev.shiftKey) {
      g_wingAnimation = !g_wingAnimation;
    }
  }
  document.addEventListener("click", shiftClick);

  // Slider Events
  document.getElementById('angleSlideX').addEventListener('mousemove', function() { g_globalAnglex = this.value; renderAllShapes(); });
  document.getElementById('angleSlideY').addEventListener('mousemove', function() { g_globalAngley = this.value; renderAllShapes(); });
}

function main() {
  // Get the rendering context for WebGL
  setupWebGL();
  // Set up GLSL programs and connect variables to GLSL
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  document.onkeydown = keydown;
  document.addEventListener('mousemove', mouseLook, false);

  initTextures();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(113.0/255, 165.0/255, 250.0/255, 1.0);
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick(){
  g_seconds = performance.now()/1000.0 - g_startTime;
  // print some debugging info so we know the program is running
  // console.log(performance.now());

  // Update animation angles
  updateAnimationAngles();

  //draw the scene
  renderAllShapes();

  // Tell browser to update again when it has time
  requestAnimationFrame(tick);
}

function click(ev) {
  let [x,y] = convertCoordinatesEventToGl(ev);
  g_globalAnglex = x * 100;
  g_globalAngley = y * 100;
  renderAllShapes();
}

function mouseLook(ev) {
  if(document.pointerLockElement !== canvas) {
    return;
  }
  const sensitivity = 0.005;
  let pan = -ev.movementX * sensitivity;
  let yaw = -ev.movementY * sensitivity;
  g_camera.pan(pan);
  g_camera.pitch(yaw);
}

function keydown(ev) {
  if(ev.keyCode == 87) { // W
    g_camera.moveForward();
  }
  else if(ev.keyCode == 65) { // A
    g_camera.moveLeft();
  }
  else if(ev.keyCode == 83) { // S
    g_camera.moveBackwards();
  }
  else if(ev.keyCode == 68) { // D
    g_camera.moveRight();
  }
  else if(ev.keyCode == 81) { // Q
    g_camera.panLeft();
  }
  else if(ev.keyCode == 69) { // E
    g_camera.panRight();
  }
  else if(ev.keyCode == 90) { // Z
    g_camera.moveUp();
  }
  else if(ev.keyCode == 67) { // C
    g_camera.moveDown();
  }

  renderAllShapes();
  console.log(ev.keyCode);
}

function updateAnimationAngles(){
  // Move the light
  g_lightPos[0] = Math.cos(g_seconds);

  // Update the angles for the legs based on the sliders
  if (g_frontLeftAnimation) {
    frontLeftSlider = 30*Math.sin(g_seconds);
  }
  if (g_frontRightAnimation) {
    frontRightSlider = 30*Math.sin(g_seconds);
  }
  if (g_midLeftAnimation) {
    midLeftSlider = 30*Math.sin(g_seconds);
  }
  if (g_midRightAnimation) {
    midRightSlider = 30*Math.sin(g_seconds);
  }
  if (g_backLeftAnimation) {
    backLeftSlider = 30*Math.sin(g_seconds);
  }
  if (g_backRightAnimation) {
    backRightSlider = 30*Math.sin(g_seconds);
  }
  if (g_wingAnimation) {
    // oscillates −30° … +30°  three times per second
    g_wingAngle = 30 * Math.sin(6 * g_seconds);
  }
}


let g_map = [
  [1,1,1,1,1,1,1,1,1,1],
  [1,0,3,4,4,0,0,0,0,1],
  [1,0,0,2,0,4,6,0,0,1],
  [1,2,3,3,0,0,0,0,0,1],
  [1,0,0,2,0,7,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1]
];

function convertCoordinatesEventToGl(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

const wallHeight = 2;
function drawMap() {
  for(let x = 0; x < g_map.length; x++) {
    for(let y = 0; y < g_map[x].length; y++) {
      if(g_map[x][y] == 1) {
        for(let z = 0; z < wallHeight; z++) {
          var cube = new Cube();
          cube.textureNum = 6;
          if (g_normalOn) {
          cube.textureNum = -3; // use color
        }
          cube.color = [1, 1, 1, 1];
          cube.matrix.setIdentity();
          cube.matrix.translate(x-4, z - 0.75, y-4);
          cube.matrix.scale(1, 1, 1);
          cube.normalMatrix.setInverseOf(cube.matrix).transpose();
          cube.render();
        }
      }
      // diamonds
      else if(g_map[x][y] == 2) {
        var cube = new Cube();
        cube.textureNum = 3;
        if (g_normalOn) {
          cube.textureNum = -3; // use color
        }
        cube.color = [1, 1, 1, 1];
        cube.matrix.setIdentity();
        cube.matrix.translate(x-4, -0.75, y-4);
        cube.matrix.scale(0.5, 0.5, 0.5);
        cube.render();
      }
      // emeralds
      else if(g_map[x][y] == 3) {
        var cube = new Cube();
        cube.textureNum = 4;
        cube.color = [1, 1, 1, 1];
        cube.matrix.setIdentity();
        cube.matrix.translate(x-4, -0.75, y-4);
        cube.matrix.scale(0.5, 0.5, 0.5);
        cube.render();
      }
      // gold
      else if(g_map[x][y] == 4) {
        var cube = new Cube();
        cube.textureNum = 5;
        cube.color = [1, 1, 1, 1];
        cube.matrix.setIdentity();
        cube.matrix.translate(x-4, -0.75, y-4);
        cube.matrix.scale(0.5, 0.5, 0.5);
        cube.render();
      }
      // wood
      else if(g_map[x][y] == 5) {
        // for(let z = 0; z < wallHeight; z++) {
          var cube = new Cube();
          cube.textureNum = 6;
          cube.color = [1, 1, 1, 1];
          cube.matrix.setIdentity();
          cube.matrix.translate(x-4, -0.75, y-4);
          cube.matrix.scale(1, 1, 1);
          cube.render();
        // }
      }
      // obsidian
      else if(g_map[x][y] == 6) {
        var cube = new Cube();
        cube.textureNum = 7;
        cube.color = [1, 1, 1, 1];
        cube.matrix.setIdentity();
        cube.matrix.translate(x-4, -0.75, y-4);
        cube.matrix.scale(0.5, 0.5, 0.5);
        cube.render();
      }
    }
  }
}

function renderAllShapes(){
  // Check the time at the start of this function
  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  // viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]);
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Pass matrix to u_ModelMatrix attribute
  var globalRotateMatrix = new Matrix4().rotate(g_globalAnglex, 0, 1, 0);
  globalRotateMatrix = globalRotateMatrix.rotate(g_globalAngley, 1, 0, 0);
  // globalRotateMatrix = globalRotateMatrix.rotate(g_globalAngley, 0, 0, 1);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotateMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  skyboxAndFloor(); // make skybox and floor
  drawMap(); // make walls
  
  var b1 = new bee(); // make bee

  // Pass the light position to GLSL
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  // Pass the camera position to GLSL
  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
  
  // Pass the light on/off to GLSL
  gl.uniform1i(u_lightOn, g_lightOn);

  // Draw the light
  var light = new Cube();
  light.textureNum = -2;
  light.color = [2, 2, 0, 1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.1, -0.1, -0.1);
  light.matrix.translate(-0.5, -0.5, -0.5); // center the light cube
  light.render();

  // test sphere
  var test = new Sphere();
  test.color = [1.0, 0.0, 0.0, 1.0];
  test.textureNum = -3;
  if(g_normalOn){test.textureNum = -3;}
  test.matrix.scale(0.25, 0.25, 0.25);
  test.matrix.translate(-1, .5, -1.5);
  test.render();

  
  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML( "ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "numdot" );
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
      console.log("Failed to get " + htmlID + " from HTML");
      return;
  }
  htmlElm.innerHTML = text;
}

function skyboxAndFloor() {
    // make floor
  var floor = new Cube();
  floor.color = [1.0, 0.0, 0.0, 1.0];
  floor.textureNum = 1;
  if (g_normalOn) {
    floor.textureNum = -3; // use color
  }
  floor.matrix.translate(0.0, -0.75, 0.0);
  floor.matrix.scale(30, 0, 30);
  floor.matrix.translate(-0.1, 0, -0.1);
  floor.normalMatrix.setInverseOf(floor.matrix).transpose();
  floor.render();

  // make skybox
  var skybox = new Cube();
  skybox.color = [1.0, 0.0, 0.0, 1.0];
  skybox.textureNum = 0;
  if (g_normalOn) {
    skybox.textureNum = -3; // use color
  }
  skybox.matrix.scale(-30, -30, -30);
  skybox.matrix.translate(-0.5, -0.5, -0.5);
  skybox.render();
}

function bee() {
//set colors & leg positions
  let YELLOW = [244/255, 208/255, 132/255, 1.0];
  let BROWN  = [ 87/255,  45/255,  33/255, 1.0];
  let WING   = [221/255, 222/255, 214/255, 0.6];
  let BLACK = [0.0, 0.0, 0.0, 1.0];
  let BLUE = [ 87/255, 145/255, 152/255, 1.0];

  //body
  var body = new Cube();
  body.color = YELLOW;
  body.textureNum = 3;
  if (g_normalOn) {
    body.textureNum = -3; // use color
  }
  body.matrix.translate(-0.30, -0.05, -0.17);
  body.matrix.scale(0.60, 0.35, 0.35);
  body.normalMatrix.setInverseOf(body.matrix).transpose();
  body.render();

  //legs
  var frontLeftLeg = new Cube();
  frontLeftLeg.color = BROWN;
  // frontLeftLeg.textureNum = 3;
  if (g_normalOn) {
    frontLeftLeg.textureNum = -3; // use color
  }
  frontLeftLeg.matrix.translate( 0.20, -0.14,  0.08);
  frontLeftLeg.matrix.rotate(frontLeftSlider, 0, 0, 1);
  frontLeftLeg.matrix.scale(0.05, 0.12, 0.05);
  frontLeftLeg.normalMatrix.setInverseOf(frontLeftLeg.matrix).transpose();
  frontLeftLeg.render();

  var frontRightLeg = new Cube();
  frontRightLeg.color = BROWN;
  if (g_normalOn) {
    frontRightLeg.textureNum = -3; // use color
  }
  frontRightLeg.matrix.translate( 0.20, -0.14, -0.13);
  frontRightLeg.matrix.rotate(frontRightSlider, 0, 0, 1);
  frontRightLeg.matrix.scale(0.05, 0.12, 0.05);
  frontRightLeg.normalMatrix.setInverseOf(frontRightLeg.matrix).transpose();
  frontRightLeg.render();

  var midLeftLeg = new Cube();
  midLeftLeg.color = BROWN;
  if (g_normalOn) {
    midLeftLeg.textureNum = -3; // use color
  }
  midLeftLeg.matrix.translate( 0.00, -0.14,  0.08);
  midLeftLeg.matrix.rotate(midLeftSlider, 0, 0, 1);
  midLeftLeg.matrix.scale(0.05, 0.12, 0.05);
  midLeftLeg.normalMatrix.setInverseOf(midLeftLeg.matrix).transpose();
  midLeftLeg.render();

  var midRightLeg = new Cube();
  midRightLeg.color = BROWN;
  if (g_normalOn) {
    midRightLeg.textureNum = -3; // use color
  }
  midRightLeg.matrix.translate( 0.00, -0.14, -0.13);
  midRightLeg.matrix.rotate(midRightSlider, 0, 0, 1);
  midRightLeg.matrix.scale(0.05, 0.12, 0.05);
  midRightLeg.normalMatrix.setInverseOf(midRightLeg.matrix).transpose();
  midRightLeg.render();

  var backRightLeg = new Cube();
  backRightLeg.color = BROWN;
  if (g_normalOn) {
    backRightLeg.textureNum = -3; // use color
  }
  backRightLeg.matrix.translate(-0.20, -0.14, -0.13);
  backRightLeg.matrix.rotate(backRightSlider, 0, 0, 1);
  backRightLeg.matrix.scale(0.05, 0.12, 0.05);
  backRightLeg.normalMatrix.setInverseOf(backRightLeg.matrix).transpose();
  backRightLeg.render();

  var backLeftLeg = new Cube();
  backLeftLeg.color = BROWN;
  if (g_normalOn) {
    backLeftLeg.textureNum = -3; // use color
  }
  backLeftLeg.matrix.translate(-0.20, -0.14,  0.08);
  backLeftLeg.matrix.rotate(backLeftSlider, 0, 0, 1);
  backLeftLeg.matrix.scale(0.05, 0.12, 0.05);
  backLeftLeg.normalMatrix.setInverseOf(backLeftLeg.matrix).transpose();
  backLeftLeg.render();
  
  // right.matrix.scale(0.30, 0.02, 0.125);
  // right.render();
  const WING_W = 0.30, WING_T = 0.02, WING_D = 0.125;
  const HINGE_Y = 0.30;     // body roof (see earlier calc)
  const HINGE_Z = 0.18;     // distance from centreline to body edge

  // helper — builds one wing given zSide = −1 (left) or +1 (right)
  function buildWing(zSide) {
    const wing = new Cube();
    wing.color = WING;

    // 1. move to roof hinge
    wing.matrix.translate(0.0, HINGE_Y, 0.0);
    // 2. slide sideways to edge
    wing.matrix.translate(0.0, 0.0, HINGE_Z * zSide);
    // 3. apply flap rotation (about X-axis); mirror sign per side
    wing.matrix.rotate(g_wingAngle * -zSide, 1, 0, 0);
    // 4. scale to slab
    wing.matrix.scale(WING_W, WING_T, WING_D);
    wing.normalMatrix.setInverseOf(wing.matrix).transpose();
    wing.render();
  }

  buildWing(-1);   // left
  buildWing(0.3);   // right

  //eyes
  var leftEyeBase = new Cube();
  leftEyeBase.color = BLACK;
  leftEyeBase.matrix.translate(0.25, 0.02, -0.171);
  leftEyeBase.matrix.scale(0.07, 0.15, 0.12);
  leftEyeBase.render();
  var leftEyeIris = new Cube();
  leftEyeIris.color = BLUE;
  leftEyeIris.matrix.translate(0.3, 0.09, -0.1);
  leftEyeIris.matrix.scale(0.022, 0.08, 0.05);
  leftEyeIris.render();
  
  var rightEyeBase = new Cube();
  rightEyeBase.color = BLACK;
  rightEyeBase.matrix.translate(0.25, 0.02, 0.067);
  rightEyeBase.matrix.scale(0.07, 0.15, 0.12);
  rightEyeBase.render();
  var rightEyeIris = new Cube();
  rightEyeIris.color = BLUE;
  rightEyeIris.matrix.translate(0.30, 0.09, 0.07);
  rightEyeIris.matrix.scale(0.022, 0.08, 0.05);
  rightEyeIris.render();
}