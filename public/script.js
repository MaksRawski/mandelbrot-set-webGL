let can = document.getElementById("can");
let ctx = can.getContext("2d");

class ComplexNumber{
	constructor(real, imaginary){
		this.real = real;
		this.imaginary = imaginary;
	}
	add(other){
		return new ComplexNumber(this.real + other.real, this.imaginary + other.imaginary);
	}
	multiply(other){
		let real = this.real * other.real - this.imaginary * other.imaginary;
		let imaginary = this.real * other.imaginary + this.imaginary * other.real;
		return new ComplexNumber(real, imaginary);
	}
	square(){
		return this.multiply(this);
	}
	absolute(){
		return Math.sqrt(this.real**2 + this.imaginary**2)
	}
}
const iterations = 1000;

// takes: c0: ComplexNumber
// returns: n: Number
let mandelbrot = (c0) => {
	let z = new ComplexNumber(0, 0);
	for (let i = 0; i < iterations; i++){
		if (z.absolute() > 2) return i;
		z = z.square().add(c0);
	}
	return iterations; // is stable
}

let toRGB = (n) => {
	return `rgb(${255*n/iterations},${255*n/iterations},${255*n/iterations})`;
}

let cordsToComplexNumber = (x, y) => {
	let real = (x / can.clientWidth) * 3 - 2
	let imag = (y / can.clientHeight)* -2 + 1;
	return new ComplexNumber(real, imag);
}

for (let x = 0; x < can.clientWidth; x++){
	for (let y = 0; y < can.clientWidth; y++){
		let c0 = cordsToComplexNumber(x, y);
		ctx.fillStyle = toRGB(mandelbrot(c0));
		ctx.fillRect(x, y, 1, 1);
	}
}
