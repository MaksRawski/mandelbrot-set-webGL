let can = document.getElementById("can");
let gl = can.getContext("webgl");

let unfiorms = {};
let iterations = 50;
let pan = [0, 0];
let scale = 1;

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
		pan: gl.getUniformLocation(program, 'pan'),
		scale: gl.getUniformLocation(program, 'scale')
	}

	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
		console.error(gl.getProgramInfoLog(program));
	}

	gl.useProgram(program);
	gl.vertexAttribPointer(gl.getAttribLocation(program, "pos"), 2, gl.FLOAT, false, 0, 0);
	draw();
};

let draw = () => {
  gl.clearColor(0, 0, 0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // update uniforms
  gl.uniform1f(uniforms.iterations, iterations);
  gl.uniform2fv(uniforms.pan, pan);
  gl.uniform1f(uniforms.scale, scale);
  
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(draw);
}

let slider = document.querySelector("#iterations>.slider");
let sliderValue = document.querySelector("#iterations>.value");

let iterationsChanged = () => {
	if (sliderValue === document.activeElement) {
		iterations = sliderValue.value
		slider.value = iterations
	}else{
		iterations = Number(slider.value);
		sliderValue.value = iterations;
	}
	draw();
	return false;
}
slider.oninput = iterationsChanged;
slider.form.onsubmit = iterationsChanged;
sliderValue.onchange = iterationsChanged;

init();
