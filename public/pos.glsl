precision highp float;

attribute vec2 pos;
varying vec2 _pos;

void main() {
	gl_Position = vec4(_pos = pos, 0.0, 1.0);
}
