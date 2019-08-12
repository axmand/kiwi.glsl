# kiwi.glsl
[![Build Status](https://travis-ci.org/axmand/kiwi.glsl.svg?branch=master)](https://travis-ci.org/axmand/kiwi.glsl)
[![codecov](https://codecov.io/gh/axmand/kiwi.glsl/branch/master/graph/badge.svg)](https://codecov.io/gh/axmand/kiwi.glsl)
[![npm version](https://badge.fury.io/js/kiwi.glsl.svg)](https://badge.fury.io/js/kiwi.glsl)

> precompile *.glsl file
### usage ###
```javascript
const frgText = `precision mediump float;
uniform float time;
void main() {
	gl_FragColor = vec4(1, 0, 0.5, time);
}`

const ast = glsl.parse(frgText);

const [c,d] = glsl.getUniformsAndAttributes(ast);
```
output
``` javascript
{
    name:"time"
    type:"float"
}
```
