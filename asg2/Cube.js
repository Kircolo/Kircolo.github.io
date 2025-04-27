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

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        //draw front of the cube
        drawTriangle3D([ 0,0,0,  1,1,0,  1,0,0 ]);
        drawTriangle3D([ 0,0,0,  0,1,0,  1,1,0 ]);
        //draw top of the cube
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3])
        drawTriangle3D([ 0,1,0,  0,1,1,  1,1,1 ]);
        drawTriangle3D([ 0,1,0,  1,1,1,  1,1,0 ]);
    }
}
