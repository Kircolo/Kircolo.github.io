class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2;

        this.cubeVerts32 = new Float32Array([
          0,0,0 ,  1,1,0,  1,0,0
          ,
          0,0,0,  0,1,0,  1,1,0
          ,
          0,1,0,  0,1,1,  1,1,1
          ,
          0,1,0,  1,1,1,  1,1,0
          ,
          1,1,0,  1,1,1,  1,0,0
          ,
          1,0,0,  1,1,1,  1,0,1
          ,
          0,1,0,  0,1,1,  0,0,0
          ,
          0,0,0,  0,1,1,  0,0,1
          ,
          0,0,0,  0,0,1,  1,0,1
          ,
          0,0,0,  1,0,1,  1,0,0
          ,
          0,0,1,  1,1,1,  1,0,1
          ,
          0,0,1,  0,1,1,  1,1,1
        ]);
        this.cubeVerts=[
          0,0,0 ,  1,1,0,  1,0,0
          ,
          0,0,0,  0,1,0,  1,1,0
          ,
          0,1,0,  0,1,1,  1,1,1
          ,
          0,1,0,  1,1,1,  1,1,0
          ,
          1,1,0,  1,1,1,  1,0,0
          ,
          1,0,0,  1,1,1,  1,0,1
          ,
          0,1,0,  0,1,1,  0,0,0
          ,
          0,0,0,  0,1,1,  0,0,1
          ,
          0,0,0,  0,0,1,  1,0,1
          ,
          0,0,0,  1,0,1,  1,0,0
          ,
          0,0,1,  1,1,1,  1,0,1
          ,
          0,0,1,  0,1,1,  1,1,1
        ]
        this.UVcubeVerts=[
          0,0, 1,1, 1,0  //front
          ,
          0,0, 0,1, 1,1
          ,
          0,0, 0,1, 1,1  //top
          ,
          0,0, 1,1, 1,0
          ,
          0,1, 1,1, 0,0  //left
          ,
          0,0, 1,1, 1,0
          ,
          1,1, 0,1, 1,0  //right
          ,
          1,0, 0,1, 0,0
          ,
          1,0, 1,1, 0,1  //bot
          ,
          1,0, 0,1, 0,0
          ,
          1,0, 0,1, 0,0  //back
          ,
          1,0, 1,1, 0,1
        ];
    }
//-------------------------------------------------------------------------------------------------------
    render() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Pass the color of a point to u_FragColor uniform variable
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        
        //draw front of the cube
        drawTriangle3DUVNormal([ 0,0,0,  1,1,0,  1,0,0 ], [0,0, 1,1, 1,0], [ 0,0,-1, 0,0,-1, 0,0,-1 ]);
        drawTriangle3DUVNormal([ 0,0,0,  0,1,0,  1,1,0 ], [ 0,0,   0,1,   1,1 ], [ 0,0,-1, 0,0,-1, 0,0,-1 ]);

        //draw top of the cube
        // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3])
        drawTriangle3DUVNormal([ 0,1,0,  0,1,1,  1,1,1 ], [ 0,0,   0,1,   1,1 ], [ 0,1,0, 0,1,0, 0,1,0 ]);
        drawTriangle3DUVNormal([ 0,1,0,  1,1,1,  1,1,0 ], [ 0,0,   1,1,   1,0 ], [ 0,1,0, 0,1,0, 0,1,0 ]);

        //draw right of the cube
        // gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3])
        drawTriangle3DUVNormal([ 1,1,0,  1,1,1,  1,0,0 ], [ 0,0,   0,1,   1,1 ], [ 1,0,0, 1,0,0, 1,0,0 ]);
        drawTriangle3DUVNormal([ 1,0,0,  1,1,1,  1,0,1 ], [ 0,0,   1,1,   1,0 ], [ 1,0,0, 1,0,0, 1,0,0 ]);

        //draw left of the cube
        // gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3])
        drawTriangle3DUVNormal([ 0,1,0,  0,1,1,  0,0,0 ], [ 0,0,   0,1,   1,1 ], [ -1,0,0, -1,0,0, -1,0,0 ]);
        drawTriangle3DUVNormal([ 0,0,0,  0,1,1,  0,0,1 ], [ 0,0,   1,1,   1,0 ], [ -1,0,0, -1,0,0, -1,0,0 ]);

        //draw bottom of the cube
        // gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3])
        drawTriangle3DUVNormal([ 0,0,0,  0,0,1,  1,0,1 ], [ 0,0,   0,1,   1,1 ], [ 0,-1,0, 0,-1,0, 0,-1,0 ]);
        drawTriangle3DUVNormal([ 0,0,0,  1,0,1,  1,0,0 ], [ 0,0,   1,1,   1,0 ], [ 0,-1,0, 0,-1,0, 0,-1,0 ]);

        //draw back of the cube
        // gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3])
        drawTriangle3DUVNormal([ 0,0,1,  1,1,1,  1,0,1 ], [ 0,0,   0,1,   1,1 ], [ 0,0,1, 0,0,1, 0,0,1 ]);
        drawTriangle3DUVNormal([ 0,0,1,  0,1,1,  1,1,1 ], [ 0,0,   1,1,   1,0 ], [ 0,0,1, 0,0,1, 0,0,1 ]);
    }

    renderFast() {
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        initTriangle3D();

        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}
