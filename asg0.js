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

  handleDrawEvent(); // Call the function to draw the vectors
  handleDrawOperationEvent();
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
  let x1 = parseFloat(document.getElementById("xInput1").value);
  let y1 = parseFloat(document.getElementById("yInput1").value);
  let x2 = parseFloat(document.getElementById("xInput2").value);
  let y2 = parseFloat(document.getElementById("yInput2").value);

  let v1 = new Vector3([x1, y1, 0.0]);
  let v2 = new Vector3([x2, y2, 0.0]);

  drawVector(v1, 'red');
  drawVector(v2, 'blue');
}

function angleBetween(v1, v2) {
  let dotProduct = Vector3.dot(v1, v2);
  let denominator = v1.magnitude() * v2.magnitude();
  let angle = ((Math.acos((dotProduct/denominator)) * (180/Math.PI)).toFixed());
  return angle;
}

function areaOfTriangle(v1, v2) {
  let crossProduct = Vector3.cross(v1, v2);
  let area = crossProduct.magnitude() / 2;
  return area;
}

function handleDrawOperationEvent() {
  //same as handleDrawEvent but with operations
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  //clear the canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //Read the values of the text boxes to create v1
  let x1 = parseFloat(document.getElementById("xInput1").value);
  let y1 = parseFloat(document.getElementById("yInput1").value);
  let x2 = parseFloat(document.getElementById("xInput2").value);
  let y2 = parseFloat(document.getElementById("yInput2").value);

  let v1 = new Vector3([x1, y1, 0.0]);
  let v2 = new Vector3([x2, y2, 0.0]);

  drawVector(v1, 'red');
  drawVector(v2, 'blue');

  //setup v3 and v4 for the operations
  let v3 = v1;
  let v4 = v2;

  let operation = document.getElementById("operations-select").value;
  let scalar = parseFloat(document.getElementById("scaler").value);

  //operations
  switch(operation) {
    case 'add':
      v3.add(v2);
      console.log(v3);
      console.log("v3 element 0: " + v3.elements[0]);
      console.log("v3 element 1: " + v3.elements[1]);
      drawVector(v3, 'green');
      break;
    case 'sub':
      v3.sub(v2);
      console.log(v3);
      console.log("v3 element 0: " + v3.elements[0]);
      console.log("v3 element 1: " + v3.elements[1]);
      drawVector(v3, 'green');
      break;
    case 'mul':
      v3.mul(scalar);
      v4.mul(scalar);
      console.log(v3);
      console.log(v4);
      drawVector(v3, 'green');
      drawVector(v4, 'green');
      break;
    case 'div':
      v3.div(scalar);
      v4.div(scalar);
      console.log(v3);
      console.log(v4);
      drawVector(v3, 'green');
      drawVector(v4, 'green');
      break;
    case 'magnitude':
      console.log("Magnitude of v1: " + v1.magnitude());
      console.log("Magnitude of v2: " + v2.magnitude());
      break;
    case 'normalize':
      v3.normalize();
      v4.normalize();
      drawVector(v3, 'green');
      drawVector(v4, 'green');
      break;
    case 'angle':
      let angle = angleBetween(v1, v2);
      console.log("Angle between v1 and v2: " + angle + " degrees");
      break;
    case 'area':
      let area = areaOfTriangle(v1, v2);
      console.log("Area of triangle formed by v1 and v2: " + area);
      break;
      
    default:
      console.log('Invalid operation selected');
  }
}