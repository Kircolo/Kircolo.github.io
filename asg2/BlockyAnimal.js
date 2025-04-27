// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

//globals
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

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

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
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

function addActionsForHtmlUI() {
  // Button Events
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

  document.getElementById('frontLeftSlider').addEventListener('mousemove', function() { frontLeftSlider = this.value; renderAllShapes(); });
  document.getElementById('frontRightSlider').addEventListener('mousemove', function() { frontRightSlider = this.value; renderAllShapes(); });
  document.getElementById('midLeftSlider').addEventListener('mousemove', function() { midLeftSlider = this.value; renderAllShapes(); });
  document.getElementById('midRightSlider').addEventListener('mousemove', function() { midRightSlider = this.value; renderAllShapes(); });
  document.getElementById('backLeftSlider').addEventListener('mousemove', function() { backLeftSlider = this.value; renderAllShapes(); });
  document.getElementById('backRightSlider').addEventListener('mousemove', function() { backRightSlider = this.value; renderAllShapes(); });
}

function main() {
  // Get the rendering context for WebGL
  setupWebGL();
  // Set up GLSL programs and connect variables to GLSL
  connectVariablesToGLSL();
  addActionsForHtmlUI();

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
  console.log(performance.now());

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

function convertCoordinatesEventToGl(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

function updateAnimationAngles(){
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

function renderAllShapes(){
  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass matrix to u_ModelMatrix attribute
  var globalRotateMatrix = new Matrix4().rotate(g_globalAnglex, 0, 1, 0);
  globalRotateMatrix = globalRotateMatrix.rotate(g_globalAngley, 1, 0, 0);
  // globalRotateMatrix = globalRotateMatrix.rotate(g_globalAngley, 0, 0, 1);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotateMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //set colors & leg positions
  let YELLOW = [244/255, 208/255, 132/255, 1.0];
  let BROWN  = [ 87/255,  45/255,  33/255, 1.0];
  let WING   = [221/255, 222/255, 214/255, 0.6];
  let BLACK = [0.0, 0.0, 0.0, 1.0];
  let BLUE = [ 87/255, 145/255, 152/255, 1.0];

  //body
  var body = new Cube();
  body.color = YELLOW;
  body.matrix.translate(-0.30, -0.05, -0.17);
  body.matrix.scale(0.60, 0.35, 0.35);
  body.render();

  //legs
  var frontLeftLeg = new Cube();
  frontLeftLeg.color = BROWN;
  frontLeftLeg.matrix.translate( 0.20, -0.14,  0.08);
  frontLeftLeg.matrix.rotate(frontLeftSlider, 0, 0, 1);
  frontLeftLeg.matrix.scale(0.05, 0.12, 0.05);
  frontLeftLeg.render();

  var frontRightLeg = new Cube();
  frontRightLeg.color = BROWN;
  frontRightLeg.matrix.translate( 0.20, -0.14, -0.13);
  frontRightLeg.matrix.rotate(frontRightSlider, 0, 0, 1);
  frontRightLeg.matrix.scale(0.05, 0.12, 0.05);
  frontRightLeg.render();

  var midLeftLeg = new Cube();
  midLeftLeg.color = BROWN;
  midLeftLeg.matrix.translate( 0.00, -0.14,  0.08);
  midLeftLeg.matrix.rotate(midLeftSlider, 0, 0, 1);
  midLeftLeg.matrix.scale(0.05, 0.12, 0.05);
  midLeftLeg.render();

  var midRightLeg = new Cube();
  midRightLeg.color = BROWN;
  midRightLeg.matrix.translate( 0.00, -0.14, -0.13);
  midRightLeg.matrix.rotate(midRightSlider, 0, 0, 1);
  midRightLeg.matrix.scale(0.05, 0.12, 0.05);
  midRightLeg.render();

  var backRightLeg = new Cube();
  backRightLeg.color = BROWN;
  backRightLeg.matrix.translate(-0.20, -0.14, -0.13);
  backRightLeg.matrix.rotate(backRightSlider, 0, 0, 1);
  backRightLeg.matrix.scale(0.05, 0.12, 0.05);
  backRightLeg.render();

  var backLeftLeg = new Cube();
  backLeftLeg.color = BROWN;
  backLeftLeg.matrix.translate(-0.20, -0.14,  0.08);
  backLeftLeg.matrix.rotate(backLeftSlider, 0, 0, 1);
  backLeftLeg.matrix.scale(0.05, 0.12, 0.05);
  backLeftLeg.render();

  //wings
  // var left = new Cube();
  // left.color = WING;
  // left.matrix.translate(-0.10, 0.3, -0.23);
  // left.matrix.rotate(25, 10, -50, 0);
  // left.matrix.scale(0.30, 0.02, 0.125);
  // left.render();

  // var right = new Cube();
  // right.color = WING;
  // right.matrix.translate(-0.10, 0.3,  0.1);
  // right.matrix.rotate(15, 10, 50, 0);
  
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
    wing.render();
  }

  buildWing(-1);   // left
  buildWing( 0.3);   // right

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

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML( "ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot" );
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
