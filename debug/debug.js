const glsl = require('./../src/warp');

var vertexShaderSource = 'attribute vec4 a_position;' +
'uniform vec2 u_mouse;'+
'void main() {' +
'gl_Position=a_position;' +
'}';

const ast = glsl.parse(vertexShaderSource);

const [a,b] = glsl.getUniformsAndAttributes(ast);

const s = "";
