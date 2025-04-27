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

function addActionsForHtmlUI() {
  // Button Events

  document.getElementById('clearButton').onclick = function() {g_shapesList=[]; renderAllShapes();};
  document.getElementById('drawingButton').onclick = function() {drawPicture();};
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
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  renderAllShapes();
}


function click(ev) {
  let [x,y] = conversion(ev);
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

function renderAllShapes(){
  // Check the time at the start of this function
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw a test triangle
  drawTriangle3D( [ -1.0,0.0,0.0,  -0.5,-1.0,0.0,  0.0,0.0,0.0 ] );

  // Draw a cube
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.setTranslate(-.25, -.5, 0.0);
  body.matrix.rotate(g_globalAnglex, 1, 0, 0);
  body.matrix.scale(.5, 1, .5);
  body.render();

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
