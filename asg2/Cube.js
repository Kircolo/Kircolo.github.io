class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Pass the color of a point to u_FragColor uniform variable
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        //draw front of the cube
        drawTriangle3D([ 0,0,0,  1,1,0,  1,0,0 ]);
        drawTriangle3D([ 0,0,0,  0,1,0,  1,1,0 ]);
        //draw top of the cube
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3])
        drawTriangle3D([ 0,1,0,  0,1,1,  1,1,1 ]);
        drawTriangle3D([ 0,1,0,  1,1,1,  1,1,0 ]);
        //draw left of the cube
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3])
        drawTriangle3D([ 1,0,0,  1,1,1,  1,0,1 ]);
        drawTriangle3D([ 1,0,0,  1,1,1,  1,1,0 ]);
        //draw right of the cube
        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3])
        drawTriangle3D([ 0,0,0,  0,0,1,  0,1,1 ]);
        drawTriangle3D([ 0,0,0,  0,1,0,  0,1,1 ]);
        //draw bottom of the cube
        gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3])
        drawTriangle3D([ 0,0,0,  0,0,1,  1,0,1 ]);
        drawTriangle3D([ 0,0,0,  1,0,0,  1,0,1 ]);
        //draw back of the cube
        gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3])
        drawTriangle3D([ 1,1,1,  0,0,1,  0,1,1 ]);
        drawTriangle3D([ 1,1,1,  0,0,1,  1,0,1 ]);
    }
}
