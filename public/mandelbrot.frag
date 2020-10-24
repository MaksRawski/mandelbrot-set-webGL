precision highp float;

uniform vec2 pan;
uniform float scale;
uniform vec3 colorPhase;
uniform vec3 colorPhaseStart;

uniform float iterations;
const float max_iterations = 10000.0;

varying vec2 _pos;

vec3 bg = vec3(0);
vec3 cr = vec3(0);
vec3 fg = vec3(0,255,0);

struct ComplexNumber{
    float real;
    float imag;
};

ComplexNumber mul(in ComplexNumber x, in ComplexNumber y){
    return ComplexNumber(
		x.real*y.real - x.imag*y.imag,
		x.real*y.imag + x.imag*y.real
    );
}

ComplexNumber add(in ComplexNumber x, in ComplexNumber y){
    return ComplexNumber(
		x.real + y.real,
		x.imag + y.imag
    );
}

float mandelbrot(ComplexNumber c){
	ComplexNumber z = ComplexNumber(0.0,0.0);
	for (float i = 0.0; i < max_iterations; i++){
		if (i >= iterations) break;
		if (sqrt(z.real*z.real + z.imag*z.imag) > 2.0) return i;
		z = mul(z, z);
		z = add(z, c);
	}
	return iterations; // is stable
}

vec3 colorValue(float iterations) {
	return pow(sin(colorPhase.xyz * iterations + colorPhaseStart)*0.5+0.5, vec3(1.5));
}

void main() {
    ComplexNumber c = ComplexNumber((_pos.x*1.5 - 0.5 )*scale - pan.x, _pos.y *scale - pan.y);

	vec3 color = colorValue(mandelbrot(c));
    gl_FragColor = vec4(color,1.0);
}
