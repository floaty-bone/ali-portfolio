import { useEffect, useRef } from 'react';

// ─── shaders ───────────────────────────────────────────────────────────────

const POINT_VERT = `
attribute vec3 a_pos;
uniform mat4 u_mvp;
void main() {
  vec4 clip = u_mvp * vec4(a_pos, 1.0);
  gl_Position = clip;
  // bigger near camera (w is camera distance in perspective)
  gl_PointSize = clamp(4.0 / clip.w, 1.5, 4.5);
}
`;

const POINT_FRAG = `
precision mediump float;
void main() {
  // crisp circular disc
  vec2 d = gl_PointCoord - 0.5;
  if (dot(d, d) > 0.23) discard;
  gl_FragColor = vec4(1.0, 1.0, 1.0, 0.92);
}
`;

const LINE_VERT = `
attribute vec3 a_pos;
attribute float a_fade;
uniform mat4 u_mvp;
varying float v_fade;
void main() {
  gl_Position = u_mvp * vec4(a_pos, 1.0);
  v_fade = a_fade;
}
`;

const LINE_FRAG = `
precision mediump float;
varying float v_fade;
void main() {
  // gold: #9F8E6D
  gl_FragColor = vec4(0.624, 0.557, 0.427, v_fade * 0.55);
}
`;

// ─── math helpers ──────────────────────────────────────────────────────────

type M4 = Float32Array;

function identity(): M4 {
  return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
}

function mul(a: M4, b: M4): M4 {
  const o = new Float32Array(16);
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      for (let k = 0; k < 4; k++)
        o[r + c * 4] += a[r + k * 4] * b[k + c * 4];
  return o;
}

function perspective(fovY: number, aspect: number, near: number, far: number): M4 {
  const f = 1 / Math.tan(fovY / 2);
  const m = new Float32Array(16);
  m[0]  = f / aspect;
  m[5]  = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
}

function rotY(a: number): M4 {
  const c = Math.cos(a), s = Math.sin(a);
  return new Float32Array([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]);
}

function rotX(a: number): M4 {
  const c = Math.cos(a), s = Math.sin(a);
  return new Float32Array([1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]);
}

function translate(tx: number, ty: number, tz: number): M4 {
  const m = identity();
  m[12] = tx; m[13] = ty; m[14] = tz;
  return m;
}

// ─── compile helper ────────────────────────────────────────────────────────

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function makeProgram(gl: WebGLRenderingContext, vs: string, fs: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  return p;
}

// ─── component ─────────────────────────────────────────────────────────────

const N = 110; // particle count
const CONN = 0.62; // connection distance threshold in world units

function seedParticles(): Float32Array {
  const p = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    // distribute in a slightly flattened sphere for better visual distribution
    const u = Math.random() * 2 - 1;
    const v = Math.random() * 2 * Math.PI;
    const r = Math.cbrt(Math.random()); // cube-root for uniform sphere volume
    const x = r * Math.sqrt(1 - u * u) * Math.cos(v);
    const y = r * Math.sqrt(1 - u * u) * Math.sin(v);
    const z = r * u;
    p[i * 3]     = x * 1.4;
    p[i * 3 + 1] = y * 1.0;
    p[i * 3 + 2] = z * 1.4;
  }
  return p;
}

export default function RippleMesh({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false })!;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 1);

    // programs
    const pointProg = makeProgram(gl, POINT_VERT, POINT_FRAG);
    const lineProg  = makeProgram(gl, LINE_VERT,  LINE_FRAG);

    // particle positions (static, rotation applied via MVP)
    const particles = seedParticles();

    // point buffer
    const ptBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
    gl.bufferData(gl.ARRAY_BUFFER, particles, gl.STATIC_DRAW);

    // line buffers (dynamic each frame)
    const lineBuf   = gl.createBuffer()!;
    const lineFades = gl.createBuffer()!;

    // max edges
    const MAX_LINES = N * N;
    const linePos   = new Float32Array(MAX_LINES * 6); // 2 verts * xyz
    const lineFade  = new Float32Array(MAX_LINES * 2); // 2 verts * alpha

    // uniforms
    const ptMVP   = gl.getUniformLocation(pointProg, 'u_mvp');
    const lineMVP = gl.getUniformLocation(lineProg,  'u_mvp');

    let animId: number;
    const start = performance.now();

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const t = (performance.now() - start) / 1000;

      gl.clear(gl.COLOR_BUFFER_BIT);

      const aspect = canvas.width / canvas.height;
      const proj   = perspective(0.85, aspect, 0.5, 20);
      const view   = translate(0, 0, -3.8);
      const ry     = rotY(t * 0.18);
      const rx     = rotX(t * 0.07);
      const model  = mul(ry, rx);
      const mvp    = mul(proj, mul(view, model));

      // ── build line geometry ─────────────────────────────────────────────
      let lc = 0; // line count
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i*3]   - particles[j*3];
          const dy = particles[i*3+1] - particles[j*3+1];
          const dz = particles[i*3+2] - particles[j*3+2];
          const d  = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (d < CONN) {
            const fade = 1 - d / CONN;
            linePos[lc*6+0] = particles[i*3];
            linePos[lc*6+1] = particles[i*3+1];
            linePos[lc*6+2] = particles[i*3+2];
            linePos[lc*6+3] = particles[j*3];
            linePos[lc*6+4] = particles[j*3+1];
            linePos[lc*6+5] = particles[j*3+2];
            lineFade[lc*2]   = fade;
            lineFade[lc*2+1] = fade;
            lc++;
            if (lc >= MAX_LINES) break;
          }
        }
        if (lc >= MAX_LINES) break;
      }

      // ── draw lines ──────────────────────────────────────────────────────
      gl.useProgram(lineProg);
      gl.uniformMatrix4fv(lineMVP, false, mvp);

      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
      gl.bufferData(gl.ARRAY_BUFFER, linePos.subarray(0, lc * 6), gl.DYNAMIC_DRAW);
      const lPosLoc = gl.getAttribLocation(lineProg, 'a_pos');
      gl.enableVertexAttribArray(lPosLoc);
      gl.vertexAttribPointer(lPosLoc, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, lineFades);
      gl.bufferData(gl.ARRAY_BUFFER, lineFade.subarray(0, lc * 2), gl.DYNAMIC_DRAW);
      const lFadeLoc = gl.getAttribLocation(lineProg, 'a_fade');
      gl.enableVertexAttribArray(lFadeLoc);
      gl.vertexAttribPointer(lFadeLoc, 1, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.LINES, 0, lc * 2);

      // ── draw points ─────────────────────────────────────────────────────
      gl.useProgram(pointProg);
      gl.uniformMatrix4fv(ptMVP, false, mvp);

      gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
      const pPosLoc = gl.getAttribLocation(pointProg, 'a_pos');
      gl.enableVertexAttribArray(pPosLoc);
      gl.vertexAttribPointer(pPosLoc, 3, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.POINTS, 0, N);

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
