let can = document.getElementById("can");
let ctx = can.getContext("2d");

let draw = () => {
	ctx.clearRect(0, 0, can.clientWidth, can.clientHeight);
	for (let x = 0; x < can.clientWidth; x++){
		for (let y = 0; y < can.clientWidth; y++){
			let c0 = cordsToComplexNumber(x, y, can.clientWidth, can.clientHeight);
			ctx.fillStyle = toRGB(mandelbrot(c0, iterations));
			ctx.fillRect(x, y, 1, 1);
		}
	}
	slider.disabled = false;
}

let slider = document.querySelector("#iterations>.slider");
let sliderValue = document.querySelector("#iterations>.value");

let iterationsChanged = () => {
	if (sliderValue === document.activeElement) {
		iterations = sliderValue.value
	}else{
		iterations = Number(slider.value);
		sliderValue.value = iterations;
	}
	slider.disabled = true;
	setTimeout(draw, 1);
	return false;
}
slider.oninput = iterationsChanged;
slider.form.onsubmit = iterationsChanged;

draw();
