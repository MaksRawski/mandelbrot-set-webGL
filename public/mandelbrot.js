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

let iterations = 50;

let mandelbrot = (c) => {
	let z = new ComplexNumber(0, 0);
	for (let i = 0; i < iterations; i++){
		if (z.absolute() > 2) return i;
		z = z.square().add(c);
	}
	return iterations; // is stable
}

let toRGB = (n) => {
	let v = n/iterations;
	let color = [];

	let bg = [0, 0, 0];
	let center = [0, 0, 0];
	let fg = [0, 255, 0];

	if (v == 1){
		color = center;
	}else{
		// background (when v->0)
		// branches (when v->1)
		for (let i = 0; i < 3; i++){
			color[i] = bg[i] + v*(fg[i])
		}
	}
	return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

let cordsToComplexNumber = (x, y, width, height) => {
	let real = (x / width) * 3 - 2
	let imag = (y / height)* -2 + 1;
	return new ComplexNumber(real, imag);
}
