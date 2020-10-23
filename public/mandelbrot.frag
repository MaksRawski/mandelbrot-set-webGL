precision highp float;

uniform vec2 pan;
uniform float scale;

uniform float iterations;
const float max_iterations = 1000.0;

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

void main() {
    ComplexNumber c = ComplexNumber((_pos.x*1.5 - 0.5 )*scale - pan.x, _pos.y *scale - pan.y);

	float v = mandelbrot(c)/iterations;
	vec3 color = cr;
	if (v != 1.0){
		color = bg + v*fg;
	}
    gl_FragColor = vec4(color/255.0,1.0);
}
