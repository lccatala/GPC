var VSHADER_SOURCE = 
    `attribute vec3 position;\n
     void main()\n
     {\n
        gl_Position = vec4(position,, 1.0);\n
        gl_PointSize = 10.0;\n
     }\n
     `;

var FSHADER_SOURCE =
     `uniform highp vec3 color;\n
      void main()\n
      {\n
        gl_FragColor = vec4(color, 1.0);\n
      }\n`;

var clicks = [];
var color;

function main() {
    var canvas = document.getElementById('canvas');
    if (!canvas) {
        console.log('Error: no hay elemento <canvas> en la página!');
        return;
    }

    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Error creando el contexto!');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Error cargando los shaders!');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.2, 1.0);

    var positionUniform = gl.getAttribLocation(gl.program, 'position');

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionUniform, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionUniform);
}