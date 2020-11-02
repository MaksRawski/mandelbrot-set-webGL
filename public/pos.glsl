precision highp float;

attribute vec3 pos;
varying vec2 _pos;

void main() {
	_pos = vec2(pos.x*1.5-0.5, pos.y);
	gl_Position = vec4(pos, 1.0);
}
