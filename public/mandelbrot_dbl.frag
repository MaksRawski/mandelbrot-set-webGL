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
    vec2 real;
    vec2 imag;
};

vec2 toDouble(float a){
	return vec2(a, 0.0);
}

// code below was taken from https://gist.github.com/LMLB/4242936fe79fb9de803c20d1196db8f3
float times_frc(float a, float b) {
  return mix(0.0, a * b, b != 0.0 ? 1.0 : 0.0);
}

float plus_frc(float a, float b) {
  return mix(a, a + b, b != 0.0 ? 1.0 : 0.0);
}

float minus_frc(float a, float b) {
  return mix(a, a - b, b != 0.0 ? 1.0 : 0.0);
}
// Double emulation based on GLSL Mandelbrot Shader by Henry Thasler (www.thasler.org/blog)
//
// Emulation based on Fortran-90 double-single package. See http://crd.lbl.gov/~dhbailey/mpdist/
// Substract: res = ds_add(a, b) => res = a + b
vec2 add (vec2 dsa, vec2 dsb) {
  vec2 dsc;
  float t1, t2, e;

  t1 = plus_frc(dsa.x, dsb.x);
  e = minus_frc(t1, dsa.x);
  t2 = plus_frc(plus_frc(plus_frc(minus_frc(dsb.x, e), minus_frc(dsa.x, minus_frc(t1, e))), dsa.y), dsb.y);
  dsc.x = plus_frc(t1, t2);
  dsc.y = minus_frc(t2, minus_frc(dsc.x, t1));
  return dsc;
}

// Substract: res = ds_sub(a, b) => res = a - b
vec2 sub (vec2 dsa, vec2 dsb) {
  vec2 dsc;
  float e, t1, t2;

  t1 = minus_frc(dsa.x, dsb.x);
  e = minus_frc(t1, dsa.x);
  t2 = minus_frc(plus_frc(plus_frc(minus_frc(minus_frc(0.0, dsb.x), e), minus_frc(dsa.x, minus_frc(t1, e))), dsa.y), dsb.y);

  dsc.x = plus_frc(t1, t2);
  dsc.y = minus_frc(t2, minus_frc(dsc.x, t1));
  return dsc;
}
vec2 mul (vec2 dsa, vec2 dsb) {
  vec2 dsc;
  float c11, c21, c2, e, t1, t2;
  float a1, a2, b1, b2, cona, conb, split = 8193.;

  cona = times_frc(dsa.x, split);
  conb = times_frc(dsb.x, split);
  a1 = minus_frc(cona, minus_frc(cona, dsa.x));
  b1 = minus_frc(conb, minus_frc(conb, dsb.x));
  a2 = minus_frc(dsa.x, a1);
  b2 = minus_frc(dsb.x, b1);

  c11 = times_frc(dsa.x, dsb.x);
  c21 = plus_frc(times_frc(a2, b2), plus_frc(times_frc(a2, b1), plus_frc(times_frc(a1, b2), minus_frc(times_frc(a1, b1), c11))));

  c2 = plus_frc(times_frc(dsa.x, dsb.y), times_frc(dsa.y, dsb.x));

  t1 = plus_frc(c11, c2);
  e = minus_frc(t1, c11);
  t2 = plus_frc(plus_frc(times_frc(dsa.y, dsb.y), plus_frc(minus_frc(c2, e), minus_frc(c11, minus_frc(t1, e)))), c21);

  dsc.x = plus_frc(t1, t2);
  dsc.y = minus_frc(t2, minus_frc(dsc.x, t1));

  return dsc;
}
// end code block

// returns 1 if a > b
// returns 0 if a == b
// return -b if a < b
int cmp(vec2 a, vec2 b){
	if (a.x > b.x) return 1;
	else if (a.x == b.x){
		if (a.y > b.y) return 1;
		else if (b.y == a.y) return 0;
		else return -1;
	}
	else return -1;
}

ComplexNumber mul(ComplexNumber x, ComplexNumber y){
    return ComplexNumber(
		add(mul(x.real, y.real), -mul(x.imag, y.imag)),
		add(mul(x.real, y.imag), mul(x.imag, y.real))
    );
}

ComplexNumber add(ComplexNumber x, ComplexNumber y){
    return ComplexNumber(
		add(x.real, y.real),
		add(x.imag, y.imag)
    );
}

float mandelbrot(ComplexNumber c){
	ComplexNumber z = ComplexNumber(toDouble(0.0), toDouble(0.0));
	for (float i = 0.0; i < max_iterations; i++){
		if (i >= iterations) break;
		// if z.real**2 + z.imag**2 > escape_radius
		if (cmp( add(mul(z.real, z.real), mul(z.imag, z.imag)), toDouble(escape_radius) ) == 1) {
			return i + 1.0 - log(log(length(vec4(z.real, z.imag)))) / log(2.0);
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
	vec4 scaledPos = vec4(mul(toDouble(_pos.x), scale), mul(toDouble(_pos.y), scale));
    ComplexNumber c = ComplexNumber(add(scaledPos.xy, pan.xy), add(scaledPos.zw, pan.zw));

	vec3 color = colorValue(mandelbrot(c));
    gl_FragColor = vec4(color,1.0);
}
