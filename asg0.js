// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // make the canvas black #1
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // new vector #2
  let v1 = new Vector3([2.25, 2.25, 0.0]);

  drawVector(v1, 'red'); // Draw the vector in red

  // // Draw a blue rectangle
  // ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'; // Set color to blue
  // ctx.fillRect(120, 10, 150, 150);        // Fill a rectangle with the color
}

function drawVector(v, color) {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  // center of the canvas
  let cx = canvas.width/2;
  let cy = canvas.height/2;

  // set the stroke color and draw the line
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + (v.elements[0] * 20), cy - (v.elements[1] * 20)); // scale the vector by 20 for visibility
  ctx.stroke();

}

function handleDrawEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  //clear the canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //Read the values of the text boxes to create v1
  let x1 = parseFloat(document.getElementById("xInput").value);
  let y1 = parseFloat(document.getElementById("yInput").value);

  let v1 = new Vector3([x1, y1, 0.0]);
}