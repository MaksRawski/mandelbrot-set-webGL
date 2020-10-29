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

// first element of the vector is the high part of the double
// we initialize second one to 0
vec2 toDouble(float a){
	return vec2(a, 0.0);
}

// functions to work on emulated doubles
// taken from https://blog.cyclemap.link/2011-06-09-glsl-part2-emu/
vec2 add(vec2 a, vec2 b){
    vec2 c;
    float t1, t2, e;

    t1 = a.x + b.x;
    e = t1 - a.x;
    t2 = ((b.x - e) + (a.x - (t1 - e))) + a.y + b.y;

    c.x = t1 + t2;
    c.y = t2 - (c.x - t1);
    return c;	
}
vec2 mul(vec2 a, vec2 b){
	vec2 c;
    float c11, c21, c2, e, t1, t2;
    float a1, a2, b1, b2, cona, conb, split = 8193.0;

    cona = a.x * split;
    conb = b.x * split;
    a1 = cona - (cona - a.x);
    b1 = conb - (conb - b.x);
    a2 = a.x - a1;
    b2 = b.x - b1;

    c11 = a.x * b.x;
    c21 = a2 * b2 + (a2 * b1 + (a1 * b2 + (a1 * b1 - c11)));

    c2 = a.x * b.y + a.y * b.x;

    t1 = c11 + c2;
    e = t1 - c11;
    t2 = a.y * b.y + ((c2 - e) + (c11 - (t1 - e))) + c21;

    c.x = t1 + t2;
    c.y = t2 - (c.x - t1);

    return c;
}

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
		// if z.real**2 + z.imag**2 > 4.0
		if (cmp( add(mul(z.real, z.real), mul(z.imag, z.imag)), toDouble(escape_radius) ) == 1) {
			return i + 1.0 - log(log(length(vec2(z.real.x, z.imag.x)))) / log(2.0);
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
	vec2 pos = vec2(_pos.x*1.5-0.5, _pos.y);
	vec4 scaledPos = vec4(mul(toDouble(pos.x), scale), mul(toDouble(pos.y), scale));
    ComplexNumber c = ComplexNumber(add(scaledPos.xy, -pan.xy), add(scaledPos.zw, -pan.zw));

	vec3 color = colorValue(mandelbrot(c));
    gl_FragColor = vec4(color,1.0);
}
