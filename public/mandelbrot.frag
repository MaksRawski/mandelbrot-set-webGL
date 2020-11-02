#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec4 pan;
uniform vec2 scale;
uniform vec3 colors;

uniform float iterations;
const float max_iterations = 10000.0;
uniform float escape_radius;

varying vec2 _pos;

struct ComplexNumber{
    float real;
    float imag;
};

vec2 add(vec2 a, vec2 b){
    return vec2(a.x + b.x, 0.0);
}
vec2 mul(vec2 a, vec2 b){
	return vec2(a.x * b.x, 0.0);
}

// returns 1 if a > b
// returns 0 if a == b
// return -b if a < b
int cmp(vec2 a, vec2 b){
	if (a.x > b.x) return 1;
	else if (a.x == b.x){
		return 0;
	}
	else return -1;
}

ComplexNumber mul(ComplexNumber x, ComplexNumber y){
    return ComplexNumber(
		x.real * y.real - x.imag * y.imag,
		x.real * y.imag + x.imag * y.real
    );
}

ComplexNumber add(ComplexNumber x, ComplexNumber y){
    return ComplexNumber(
		x.real + y.real,
		x.imag + y.imag
    );
}

float mandelbrot(ComplexNumber c){
	ComplexNumber z = ComplexNumber(0.0, 0.0);
	for (float i = 0.0; i < max_iterations; i++){
		if (i >= iterations) break;
		// if z.real**2 + z.imag**2 > escape_radius
		if (z.real * z.real + z.imag * z.imag > escape_radius) {
			return i + 1.0 - log(log(length(vec2(z.real, z.imag)))) / log(2.0);
		}
		z = mul(z, z);
		z = add(z, c);
	}
	return 0.0; // is stable
}

vec3 colorValue(float iterations) {
	return (-cos(colors*iterations) + 1.0) / 2.0;
}

void main() {
	vec2 scaledPos = vec2(_pos.x * scale.x, _pos.y * scale.x);
    ComplexNumber c = ComplexNumber(scaledPos.x + pan.x, scaledPos.y + pan.z);

	vec3 color = colorValue(mandelbrot(c));
    gl_FragColor = vec4(color,1.0);
}
