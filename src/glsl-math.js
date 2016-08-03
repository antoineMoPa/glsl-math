/*
  Resources: 
  
  * https://gist.github.com/mbostock/5440492
  * http://memfrag.se/blog/simple-vertex-shader-for-2d
  * https://www.opengl.org/wiki/Data_Type_%28GLSL%29#Vector_constructors
  * https://www.opengl.org/wiki/Built-in_Variable_%28GLSL%29
  * https://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf

  */

// shortcuts
// keep at the top
function ID(id){
    return document.getElementById(id);
};

var canvas = ID("result");
canvas.height = 512;
canvas.width = 512;

var ctx = canvas.getContext("webgl");

ctx.clearColor(0.0, 0.0, 0.0, 1.0);
ctx.enable(ctx.DEPTH_TEST);
ctx.depthFunc(ctx.LEQUAL);
ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);

// Triangle strip for whole screen square
var vertices = [
    -1,-1,0,
    -1,1,0,
    1,-1,0,
    1,1,0,
];

var tri = ctx.createBuffer();
ctx.bindBuffer(ctx.ARRAY_BUFFER,tri);
ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(vertices), ctx.STATIC_DRAW);


var program = ctx.createProgram();

var vertex_shader =
    add_shader(ctx.VERTEX_SHADER,ID("vertex-shader").textContent);

var fragment_shader =
    add_shader(ctx.FRAGMENT_SHADER,ID("fragment-shader").textContent);

function add_shader(type,content){
    var shader = ctx.createShader(type);
    ctx.shaderSource(shader,content);
    ctx.compileShader(shader);
    if(!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)){
        console.log(ctx.getShaderInfoLog(shader))
    }
    ctx.attachShader(program, shader);
    return shader;
}

ctx.linkProgram(program);

if(!ctx.getProgramParameter(program, ctx.LINK_STATUS)){
    console.log(ctx.getProgramInfoLog(program));
}

ctx.useProgram(program);

var positionAttribute = ctx.getAttribLocation(program, "position");
ctx.enableVertexAttribArray(positionAttribute);
ctx.vertexAttribPointer(positionAttribute, 3, ctx.FLOAT, false, 0, 0);

function draw(){
    initDataTexture(ctx);
    ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, 4);

    ctx.viewport(0, 0, canvas.width, canvas.height);
}

draw();

/*
  Creates the texture that contains the data
  to pass to glsl. Assigns texture to uniform 'input-tex'
  
 */
function initDataTexture(ctx){
    var gl = ctx;

    var canvasTexture = ID('input_data');
    
    var size = 512;
    
    canvasTexture.width = size;
    canvasTexture.height = size;
    
    var texCtx = canvasTexture.getContext("2d");
    
    var imgdata = texCtx.createImageData(size, size);
    var len = size * size * 4;
    var data = imgdata.data;

    // Create a circle for testing
    for(var i = 0; i < size; i++){
        for(var j = 0; j < size; j++){
            var r = Math.sqrt(Math.pow(i-size/2,2) + Math.pow(j-size/2,2));
            if(r < size/3){
                set_one_pixel(i, j,
                              255, 256 * (i < 256),255 * (j > 256), 255);
            } else {
                set_one_pixel(i, j,
                              255 * (i>256), 255 * (i < 256),255 * (j > 256), 40);
            }
        }
    }
    
    function set_one_pixel(i,j,valr,valg,valb,vala){
        var index = 4 * (j * size + i);
        // Set value
        imgdata.data[index + 0] = valr;
        imgdata.data[index + 1] = valg;
        imgdata.data[index + 2] = valb;
        imgdata.data[index + 3] = vala;
    }

    texCtx.putImageData(imgdata, 0, 0);
    
    initTexture();
    
    function initTexture() {
        var tex = gl.createTexture();
        handleLoadedTexture(tex, canvasTexture);
    }
    
    // From: http://www.delphic.me.uk/webgltext.html
    function handleLoadedTexture(texture, textureCanvas) {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        gl.texImage2D( gl.TEXTURE_2D,
                       0,
                       gl.RGBA,
                       gl.RGBA,
                       gl.UNSIGNED_BYTE,
                       textureCanvas );
        
        gl.texParameteri( gl.TEXTURE_2D,
                          gl.TEXTURE_MAG_FILTER,
                          gl.LINEAR );
        
        gl.texParameteri( gl.TEXTURE_2D,
                          gl.TEXTURE_MIN_FILTER,
                          gl.LINEAR_MIPMAP_NEAREST );
        
        gl.generateMipmap(gl.TEXTURE_2D);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(gl.getUniformLocation(program, "input_tex"), 0);
    }
}
