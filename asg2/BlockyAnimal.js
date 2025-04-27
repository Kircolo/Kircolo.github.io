// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

//globals
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

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

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

//def shapes
const POINT = 1;
const TRIANGLE = 2;
const CIRCLE = 3;

//ui globals & defaults
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10
let g_segments = 5;
let g_selectedType = POINT; //default to point

function addActionsForHtmlUI() {
  // Button Events

  document.getElementById('clearButton').onclick = function() {g_shapesList=[]; renderAllShapes();};
  document.getElementById('pointButton').onclick = function() {g_selectedType = POINT;};
  document.getElementById('triButton').onclick = function() {g_selectedType = TRIANGLE;};
  document.getElementById('circleButton').onclick = function() {g_selectedType = CIRCLE;};
  document.getElementById('drawingButton').onclick = function() {drawPicture();};

  // Color Slider Events
  document.getElementById('redSlide').value = g_selectedColor[0] * 1; // default
  document.getElementById('greenSlide').value = g_selectedColor[1] * 1;
  document.getElementById('blueSlide').value = g_selectedColor[2] * 1;
  g_selectedColor[0] = document.getElementById('redSlide').value / 100;
  g_selectedColor[1] = document.getElementById('greenSlide').value / 100;
  g_selectedColor[2] = document.getElementById('blueSlide').value / 100;

  document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100; });

  // Size Slider Events
  document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_selectedSize = this.value; });
  document.getElementById('segments').addEventListener('mouseup', function() {g_segments = this.value; });
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
  renderShapes();
}

var g_shapesList = [];

function click(ev) {
  let [x,y] = conversion(ev);

  g_globalAngle = y * 100;
  g_globalAnglex = x *100;
  renderShapes();
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
  body.color = [1.0,0.0,0.0,1.0];
  body.render();

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML( " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration) );
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

// draw a mountain! | USED CHATGPT FOR HELP IN FINDING THE COORDINATES AND COLORS |
function drawPicture() {
  const white      = [1.0, 1.0, 1.0, 1.0];
  const lightBlue  = [0.3, 0.6, 1.0, 1.0];
  const mediumBlue = [0.2, 0.4, 0.75, 1.0];
  const darkBlue   = [0.1, 0.2, 0.5, 1.0];
  const backgroundColor = [0.6, 0.8, 1.0, 1.0]; // light sky blue

  // Background color (sky blue-ish)
  gl.uniform4f(u_FragColor, ...backgroundColor);
 // Top-left rectangle (split into 2 triangles)
 drawTriangle([-1.0, 1.0, -1.0, 0.0,  0.0, 1.0]); // top-left
 drawTriangle([-1.0, 0.0,  0.0, 0.0,  0.0, 1.0]); // bottom-right of top-left quad

 // Bottom-left rectangle
 drawTriangle([-1.0, 0.0, -1.0, -1.0, 0.0, -1.0]);
 drawTriangle([-1.0, 0.0,  0.0, -1.0, 0.0, 0.0]);

 // Top-right rectangle
 drawTriangle([0.0, 1.0,  0.0, 0.0, 1.0, 1.0]);
 drawTriangle([0.0, 0.0,  1.0, 0.0, 1.0, 1.0]);

 // Bottom-right rectangle
 drawTriangle([0.0, 0.0, 0.0, -1.0, 1.0, -1.0]);
 drawTriangle([0.0, 0.0, 1.0, -1.0, 1.0, 0.0]);
  
  // White

  gl.uniform4f(u_FragColor, ...white);

  drawTriangle([  0.0,  0.85,   -0.2, 0.45,   0.0,  0.45 ]);  // #1
  drawTriangle([  0.0,  0.85,    0.0, 0.45,  -0.1,  0.45 ]);  // #2 (small horizontal fix)
  drawTriangle([  0.0,  0.85,    0.0, 0.45,   0.2,  0.45 ]);  // #3
  drawTriangle([  0.0,  0.85,    0.2, 0.45,   0.1,  0.45 ]);  // #4 (a little overlap fix)

  // Light Blue

  gl.uniform4f(u_FragColor, ...lightBlue);

  drawTriangle([ -0.2, 0.45,  -0.4,  0.1,   0.0, 0.1 ]);    // #5
  drawTriangle([ -0.2, 0.45,   0.0,  0.1,   0.0, 0.45 ]);   // #6
  drawTriangle([  0.0, 0.45,   0.0,  0.1,   0.4, 0.1 ]);    // #7
  drawTriangle([  0.0, 0.45,   0.4,  0.1,   0.2, 0.45 ]);   // #8

  // Medium Blue

  gl.uniform4f(u_FragColor, ...mediumBlue);


  drawTriangle([ -0.4,  0.1,  -0.6, -0.2,   0.0, -0.2 ]);   // #9
  drawTriangle([ -0.4,  0.1,   0.0, -0.2,   0.0,  0.1 ]);   // #10
  drawTriangle([  0.0,  0.1,   0.0, -0.2,   0.6, -0.2 ]);   // #11
  drawTriangle([  0.0,  0.1,   0.6, -0.2,   0.4,  0.1 ]);   // #12

  // Dark Blue

  gl.uniform4f(u_FragColor, ...darkBlue);

  drawTriangle([ -0.6, -0.2,  -0.8, -0.8,   0.0, -0.8 ]);   // #13
  drawTriangle([ -0.6, -0.2,   0.0, -0.8,   0.0, -0.2 ]);   // #14
  drawTriangle([  0.0, -0.2,   0.0, -0.8,   0.8, -0.8 ]);   // #15
  drawTriangle([  0.0, -0.2,   0.8, -0.8,   0.6, -0.2 ]);   // #16
}
