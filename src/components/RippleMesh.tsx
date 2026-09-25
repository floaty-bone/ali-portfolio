import { useEffect, useRef } from 'react';

// Animated point-cloud topography: a fixed perspective grid of dots whose
// heights form irregular rolling hills that swell and subside in place, and
// that ripple where the cursor passes over them.

const VERT = `
attribute vec2 a_grid;      // x, z in world units — the grid never moves
uniform mat4  u_mvp;
uniform float u_time;
uniform vec2  u_mouse;      // cursor position on the terrain, in world x/z
uniform float u_agitation;  // 0 at rest, rises while the cursor is moving
uniform float u_px;         // canvas height in device pixels
uniform float u_dpr;
varying float v_h;
varying float v_fade;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise — smooth, but with no repeating structure the eye can lock onto.
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 2.0 - 1.0;
}

// Each octave's domain is nudged around a small circle rather than translated,
// so the hills breathe and reshape in place instead of drifting across the map.
vec2 wobble(float t, float rate, float phase) {
  return vec2(sin(t * rate + phase), cos(t * rate * 0.83 + phase)) * 0.55;
}

float height(vec2 p, float t) {
  float h  = 0.90 * vnoise(p * 0.17 + wobble(t, 0.11, 0.0));
  h += 0.46 * vnoise(p * 0.36 + wobble(t, 0.17, 1.7));
  h += 0.22 * vnoise(p * 0.74 + wobble(t, 0.23, 3.1));
  h += 0.11 * vnoise(p * 1.55 + wobble(t, 0.31, 4.6));
  return h;
}

void main() {
  float z = a_grid.y;
  float h = height(a_grid, u_time);

  // Cursor ripple: concentric waves centred on where the pointer meets the
  // ground plane, always faintly present and whipped up while the mouse moves.
  vec2  md = a_grid - u_mouse;
  float mr = length(md);
  float ring = sin(mr * 1.5 - u_time * 3.2) * exp(-mr * mr * 0.010);
  h += (0.18 + 1.05 * u_agitation) * ring;

  // Agitation also roughens the surface near the cursor.
  float near = exp(-mr * mr * 0.006);
  h += u_agitation * near * 0.45 * vnoise(a_grid * 0.9 + vec2(u_time * 0.9));

  vec4 clip = u_mvp * vec4(a_grid.x, h, z, 1.0);
  gl_Position = clip;
  // Size relative to the canvas, not in fixed pixels, so the field reads the
  // same on a small window and a large one.
  gl_PointSize = clamp(u_px * 0.026 / clip.w, 0.8 * u_dpr, u_px * 0.0055);

  v_h = h;
  // fade out at the far edge and right at the near clip
  v_fade = smoothstep(-72.0, -34.0, z) * (1.0 - smoothstep(0.5, 3.0, z));
}
`;

const FRAG = `
precision mediump float;
varying float v_h;
varying float v_fade;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = dot(d, d);
  if (r > 0.25) discard;
  float aa = 1.0 - smoothstep(0.10, 0.25, r);

  // deep slate in the valleys → cyan on the slopes → near-white on the peaks
  float t = clamp(v_h * 0.55 + 0.5, 0.0, 1.0);
  vec3 lo  = vec3(0.10, 0.22, 0.38);
  vec3 mid = vec3(0.22, 0.72, 0.86);
  vec3 hi  = vec3(0.88, 0.97, 1.00);
  vec3 c = mix(mix(lo, mid, clamp(t * 2.0, 0.0, 1.0)),
               mix(mid, hi, clamp((t - 0.5) * 2.0, 0.0, 1.0)),
               step(0.5, t));

  float a = aa * v_fade * (0.55 + 0.45 * t);
  gl_FragColor = vec4(c, a);
}
`;

type M4 = Float32Array;

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
  m[0] = f / aspect; m[5] = f;
  m[10] = (far + near) / (near - far); m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
}

function rotX(a: number): M4 {
  const c = Math.cos(a), s = Math.sin(a);
  return new Float32Array([1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]);
}

function translate(tx: number, ty: number, tz: number): M4 {
  const m = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  m[12] = tx; m[13] = ty; m[14] = tz;
  return m;
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    console.error('RippleMesh shader compile failed:', gl.getShaderInfoLog(s));
  return s;
}

function makeProgram(gl: WebGLRenderingContext, vs: string, fs: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    console.error('RippleMesh program link failed:', gl.getProgramInfoLog(p));
  return p;
}

// ── Grid ─────────────────────────────────────────────────────────────────────

const COLS    = 180;   // across
const ROWS    = 275;   // into the distance
const SPACING = 0.285;

function seedGrid(): Float32Array {
  const g = new Float32Array(COLS * ROWS * 2);
  let i = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      g[i++] = (c - (COLS - 1) / 2) * SPACING;
      g[i++] = 3.0 - r * SPACING; // rows recede from just in front of the camera
    }
  }
  return g;
}

// ── Camera ───────────────────────────────────────────────────────────────────

const FOV   = 0.95;
const PITCH = 0.19;  // radians, tipped down
const CAM_Y = 3.4;   // eye height above the ground plane

// Cast the cursor's screen position onto the y = 0 ground plane so the ripple
// follows the pointer across the terrain in world units rather than in pixels.
function cursorToGround(ndcX: number, ndcY: number, aspect: number): [number, number] | null {
  const tanHalf = Math.tan(FOV / 2);
  const vx = ndcX * tanHalf * aspect;
  const vy = ndcY * tanHalf;
  const vz = -1;

  // view -> world is the transpose of the camera's rotation
  const c = Math.cos(PITCH), sn = Math.sin(PITCH);
  const wx = vx;
  const wy = c * vy + sn * vz;
  const wz = -sn * vy + c * vz;

  if (wy > -1e-3) return null;      // ray points at or above the horizon
  const t = -CAM_Y / wy;
  if (t > 200) return null;         // grazing the horizon — too far to matter
  return [wx * t, wz * t];
}

// ── Component ────────────────────────────────────────────────────────────────

export default function RippleMesh({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false })!;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 1);

    const prog = makeProgram(gl, VERT, FRAG);
    gl.useProgram(prog);

    const grid = seedGrid();
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, grid, gl.STATIC_DRAW);

    const gridLoc = gl.getAttribLocation(prog, 'a_grid');
    gl.enableVertexAttribArray(gridLoc);
    gl.vertexAttribPointer(gridLoc, 2, gl.FLOAT, false, 0, 0);

    const uMVP    = gl.getUniformLocation(prog, 'u_mvp');
    const uTime   = gl.getUniformLocation(prog, 'u_time');
    const uMouse  = gl.getUniformLocation(prog, 'u_mouse');
    const uAgit   = gl.getUniformLocation(prog, 'u_agitation');
    const uPx     = gl.getUniformLocation(prog, 'u_px');
    const uDpr    = gl.getUniformLocation(prog, 'u_dpr');

    let animId = 0;
    const t0 = performance.now() / 1000;
    let lastFrame = t0;

    // Cursor state, parked far off the field until the pointer first moves.
    let mouseX = 0, mouseZ = -18;
    let agitation = 0;
    let lastPx = 0, lastPy = 0, hasLast = false;

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;

      if (hasLast) {
        const d = Math.hypot(e.clientX - lastPx, e.clientY - lastPy);
        // Ramp up with movement, but cap so a fast flick doesn't blow it out.
        agitation = Math.min(1, agitation + d / 260);
      }
      lastPx = e.clientX; lastPy = e.clientY; hasLast = true;

      const ndcX = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ndcY = 1 - ((e.clientY - r.top) / r.height) * 2;
      const hit = cursorToGround(ndcX, ndcY, r.width / r.height);
      if (hit) { mouseX = hit[0]; mouseZ = hit[1]; }
    };
    window.addEventListener('mousemove', onMove);

    const resize = () => {
      // Measure with getBoundingClientRect so the CSS root zoom is included —
      // offsetWidth is in the element's own (pre-zoom) coordinate space.
      const r = canvas.getBoundingClientRect();
      canvas.width  = Math.max(1, Math.round(r.width  * devicePixelRatio));
      canvas.height = Math.max(1, Math.round(r.height * devicePixelRatio));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uDpr, devicePixelRatio);
      gl.uniform1f(uPx, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const now = performance.now() / 1000;
      const t = now - t0;
      const dt = Math.min(now - lastFrame, 0.05);
      lastFrame = now;

      // Agitation bleeds off once the cursor settles.
      agitation *= Math.exp(-dt * 1.1);

      gl.clear(gl.COLOR_BUFFER_BIT);

      const aspect = canvas.width / canvas.height;
      const proj = perspective(FOV, aspect, 0.3, 130);
      // low camera, tipped down just enough to read the hills as terrain
      const view = mul(rotX(PITCH), translate(0, -CAM_Y, 0));
      const mvp  = mul(proj, view);

      gl.uniformMatrix4fv(uMVP, false, mvp);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mouseX, mouseZ);
      gl.uniform1f(uAgit, agitation);

      gl.drawArrays(gl.POINTS, 0, COLS * ROWS);
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
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
