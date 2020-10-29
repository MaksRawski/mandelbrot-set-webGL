let can = document.getElementById("can");
let gl = can.getContext("webgl");

let unfiorms = {};
let iterations = 175;
let pan = [0, 0];
let scale = 1;
let escape_radius = 20;

let speed = 0.01;
let zoomingIn = false;
let zoomingOut = false;
let m = {x: 0, y: 0};

let colors = [110/255, 10/255, 80/255];

if (!gl) {
	console.log("WebGL not supported, falling back to experimental");
	gl = canvas.getContext("webgl-experimental");
}
if (!gl){
	can.outerHTML = "WebGL not supported"
}

const getShader = async (file, type) => {
	let res = await fetch(file);
	res = await res.text();

	let shader = gl.createShader(type);
	gl.shaderSource(shader, res);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error(
			'Shader compile error:',
			gl.getShaderInfoLog(shader)
		);
	}
	return shader;
}

const init = async () =>{
	let fragShader = await getShader('mandelbrot.frag', gl.FRAGMENT_SHADER);
	let vrtxShader = await getShader('pos.glsl', gl.VERTEX_SHADER);

	let program = gl.createProgram();
	gl.attachShader(program, fragShader);
	gl.attachShader(program, vrtxShader);
	gl.linkProgram(program);
	gl.enableVertexAttribArray(gl.getAttribLocation(program,"pos"));

	let vertices = new Float32Array([1, 1, -1, 1, 1, -1, -1, 1, 1, -1, -1, -1]);

	let buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	uniforms = {
		iterations: gl.getUniformLocation(program, 'iterations'),
		escape_radius: gl.getUniformLocation(program, 'escape_radius'),
		pan: gl.getUniformLocation(program, 'pan'),
		scale: gl.getUniformLocation(program, 'scale'),
		colors: gl.getUniformLocation(program, 'colors'),
	}

	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
		console.error(gl.getProgramInfoLog(program));
	}

	gl.useProgram(program);
	gl.vertexAttribPointer(gl.getAttribLocation(program, "pos"), 2, gl.FLOAT, false, 0, 0);
	draw();
};

let toDouble = (n) => {
	let dbl = [];
	dbl[0] = +n.toFixed(9).slice(0, -1);
	dbl[1] = +n.toFixed(17) - dbl[0];
	dbl[1] = +dbl[1].toFixed(17);

	return dbl;
}

let draw = () => {
	gl.clearColor(0, 0, 0, 1.0)
	gl.clear(gl.COLOR_BUFFER_BIT);

	// update uniforms
	gl.uniform1f(uniforms.iterations, iterations);
	gl.uniform1f(uniforms.escape_radius, escape_radius);
	gl.uniform4fv(uniforms.pan, toDouble(pan[0]).concat(toDouble(pan[1])));
	gl.uniform2fv(uniforms.scale, toDouble(scale));
	gl.uniform3fv(uniforms.colors, colors);

	if (zoomingIn || zoomingOut) {
		document.querySelector("#scale>.value").value = Math.round(1/scale);
		document.querySelector("#scale>.slider").max = 2*Math.round(1/scale);
		document.querySelector("#scale>.slider").value = Math.round(1/scale);
		requestAnimationFrame(draw);
	}
	if (zoomingIn){
		scale -= scale*speed;
		pan[0] -= scale*m.x*speed;
		pan[1] -= scale*m.y*speed;
	}else if(zoomingOut){
		scale += scale*speed;
		pan[0] += scale*m.x*speed;
		pan[1] += scale*m.y*speed;
	}
	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

can.ondblclick = can.oncontextmenu = can.onmousedown = (e) => {
	if (e.button == 0){
		zoomingIn = true;
	}
	else if (e.button == 2){
		zoomingIn = false;
		zoomingOut = true;
	}
	m.x = 3*(e.offsetX/e.target.width)-2;
	m.y = 2*(1-e.offsetY/e.target.height)-1;
	e.preventDefault();
	requestAnimationFrame(draw);
}
can.onmouseup = (e) => {
	if (e.button == 0)
		zoomingIn = false;
	else if (e.button == 2)
		zoomingOut = false;
	document.querySelector("#x").value = pan[0];
	document.querySelector("#y").value = pan[1];
}
document.onkeydown = (e) => {
	if (e.key == "r") {
		pan = [0,0];
		scale = 1;
		draw();
	}
}

let change = (div) => {
	let range = div.children[0];
	let value = div.children[1];

	if (range === document.activeElement) {
		value.value = range.value;
	}else{
		range.value = value.value;
	}

	// update variables
	switch(div.id){
		case "iterations":
			iterations = value.value;
			break;
		case "escape_radius":
			escape_radius = value.value;
			break;
		case "scale":
			scale = 1/value.value;
			break;
		case "r":
			colors[0] = value.value/255;
			break;
		case "g":
			colors[1] = value.value/255;
			break;
		case "b":
			colors[2] = value.value/255;
			break;
	}
	draw();
	return false;
}
let updateCords = (elem) => {
	if (Number(elem.value)){
		pan[elem.id=="x"?0:1] = Number(elem.value);
	}
	else pan[elem.id=="x"?0:1] = 0;
	draw();
}
let zoom = () => {
	if (zoomingIn == false){
		zoomingIn = true; 
		m.x = 0;
		m.y = 0;
		document.querySelector("#zoomButton").innerHTML = "🗙";
	}else{
		zoomingIn = false
		document.querySelector("#zoomButton").innerHTML = "▶";
	}
	draw();
}
init();
