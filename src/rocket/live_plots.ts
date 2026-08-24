// live_plots.ts — 7 live telemetry charts (optimised).

const PAD  = { top: 18, right: 52, bottom: 20, left: 46 };
const CW   = 400;
const CH   = 118;

// ── Chart chrome, matched to the site design system ───────────────────────────
const MONO       = "'JetBrains Mono', ui-monospace, monospace";
const SAND       = "#C9A96A";
const CHART_BG   = "#0a0a0f";
const AXIS_LINE  = "rgba(255,255,255,0.18)";
const GRID_LINE  = "rgba(255,255,255,0.05)";
const ZERO_LINE  = "rgba(255,255,255,0.12)";

// Data series — same roles as before, retuned from fluorescent to the
// site's calmer palette. The setpoint uses the brand sand.
const C_POS      = "#4ade80";  // measured position
const C_SETPOINT = SAND;       // commanded setpoint
const C_ALPHA    = "#38bdf8";  // gimbal α
const C_BETA     = "#4ade80";  // gimbal β
const C_THRUST   = "#fbbf24";  // thrust
const C_OMEGA_X  = "#c084fc";
const C_OMEGA_Y  = "#f472b6";
const C_OMEGA_Z  = "#818cf8";

// Minimum ms between redraws (~20 Hz is plenty for telemetry charts)
const RENDER_INTERVAL_MS = 50;

// ── Running min/max tracker ────────────────────────────────────────────────────
class Range {
  min = Infinity; max = -Infinity;
  reset() { this.min = Infinity; this.max = -Infinity; }
  add(v: number) { if (v < this.min) this.min = v; if (v > this.max) this.max = v; }
  addOther(r: Range) { if (r.min < this.min) this.min = r.min; if (r.max > this.max) this.max = r.max; }

  padded(fallback = 1): [number, number] {
    let lo = this.min, hi = this.max;
    if (!isFinite(lo)) { lo = -fallback; hi = fallback; }
    if (hi - lo < 1e-6) { lo -= fallback; hi += fallback; }
    const p = (hi - lo) * 0.15;
    return [lo - p, hi + p];
  }
}

// ── Static draw helpers ────────────────────────────────────────────────────────
function drawAxes(
  ctx: CanvasRenderingContext2D, pw: number, ph: number,
  yMinL: number, yMaxL: number, yMinR: number | null, yMaxR: number | null,
  title: string, leftColor: string, rightColor: string | null, leftUnit?: string,
) {
  const xp = PAD.left, yb = PAD.top + ph;
  ctx.strokeStyle = GRID_LINE; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = PAD.top + (i / 4) * ph;
    ctx.beginPath(); ctx.moveTo(xp, y); ctx.lineTo(xp + pw, y); ctx.stroke();
  }
  if (yMinL < 0 && yMaxL > 0) {
    const y0 = PAD.top + ph - ((0 - yMinL) / (yMaxL - yMinL)) * ph;
    ctx.strokeStyle = ZERO_LINE;
    ctx.beginPath(); ctx.moveTo(xp, y0); ctx.lineTo(xp + pw, y0); ctx.stroke();
  }
  ctx.strokeStyle = AXIS_LINE; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(xp, PAD.top); ctx.lineTo(xp, yb); ctx.lineTo(xp + pw, yb); ctx.stroke();
  if (rightColor) { ctx.beginPath(); ctx.moveTo(xp + pw, PAD.top); ctx.lineTo(xp + pw, yb); ctx.stroke(); }
  ctx.font = `9px ${MONO}`; ctx.textAlign = "right"; ctx.fillStyle = leftColor;
  for (let i = 0; i <= 2; i++) {
    const v = yMinL + (i / 2) * (yMaxL - yMinL);
    const y = PAD.top + ph - ((v - yMinL) / (yMaxL - yMinL)) * ph;
    ctx.fillText(v.toFixed(1), xp - 4, y + 3);
  }
  if (rightColor && yMinR !== null && yMaxR !== null) {
    ctx.textAlign = "left"; ctx.fillStyle = rightColor;
    for (let i = 0; i <= 2; i++) {
      const v = yMinR + (i / 2) * (yMaxR - yMinR);
      const y = PAD.top + ph - ((v - yMinR) / (yMaxR - yMinR)) * ph;
      ctx.fillText(v.toFixed(1), xp + pw + 4, y + 3);
    }
  }
  // Section title, uppercase + tracked to match the site's mono eyebrows
  ctx.fillStyle = SAND; ctx.font = `500 9px ${MONO}`; ctx.textAlign = "left";
  ctx.fillText(title.toUpperCase(), xp + 3, PAD.top - 5);
  ctx.font = `8px ${MONO}`; ctx.fillStyle = leftColor; ctx.textAlign = "left"; ctx.fillText(leftUnit ?? (leftColor === C_POS ? "m" : "deg"), 2, PAD.top + 4);
  if (rightColor) { ctx.textAlign = "right"; ctx.fillStyle = rightColor; ctx.fillText("kN", CW - 2, PAD.top + 4); }
}

function polyline(
  ctx: CanvasRenderingContext2D, times: number[], data: number[],
  totalTime: number, pw: number, ph: number,
  yMin: number, yMax: number, color: string, lineWidth = 1.5, dashed = false,
) {
  const n = data.length;
  if (n < 2) return;
  ctx.strokeStyle = color; ctx.lineWidth = lineWidth;
  if (dashed) ctx.setLineDash([6, 4]); else ctx.setLineDash([]);
  const tMax = Math.max(totalTime, 1e-3);
  const yRange = yMax - yMin;
  ctx.beginPath();
  for (let j = 0; j < n; j++) {
    const x = PAD.left + (times[j] / tMax) * pw;
    const y = PAD.top + ph - ((data[j] - yMin) / yRange) * ph;
    j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

// Draw a horizontal dashed setpoint line without allocating an array
function hline(
  ctx: CanvasRenderingContext2D, value: number, pw: number, ph: number,
  yMin: number, yMax: number, color: string,
) {
  const y = PAD.top + ph - ((value - yMin) / (yMax - yMin)) * ph;
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
  ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pw, y); ctx.stroke();
  ctx.setLineDash([]);
}

function legend(ctx: CanvasRenderingContext2D, ph: number, items: [string, string, number | null][]) {
  ctx.font = `9px ${MONO}`; ctx.textAlign = "left";
  let lx = PAD.left + 3; const ly = PAD.top + ph + 13;
  for (const [color, lbl, val] of items) {
    ctx.fillStyle = color;
    const txt = val !== null ? `${lbl}=${val.toFixed(2)}` : lbl;
    ctx.fillText(txt, lx, ly);
    lx += ctx.measureText(txt).width + 10;
  }
}

// ── Per-chart draw functions ───────────────────────────────────────────────────
function drawPositionPlot(
  ctx: CanvasRenderingContext2D, axis: "X"|"Y"|"Z",
  times: number[], data: number[], setpoint: number,
  totalTime: number, range: Range,
) {
  const pw = CW - PAD.left - PAD.right, ph = CH - PAD.top - PAD.bottom;
  ctx.fillStyle = CHART_BG; ctx.fillRect(0, 0, CW, CH);
  const [yMin, yMax] = range.padded();
  drawAxes(ctx, pw, ph, yMin, yMax, null, null, `Position ${axis}`, C_POS, null);
  hline(ctx, setpoint, pw, ph, yMin, yMax, C_SETPOINT);
  polyline(ctx, times, data, totalTime, pw, ph, yMin, yMax, C_POS, 1.5);
  const last = data.length ? data[data.length - 1] : null;
  legend(ctx, ph, [[C_POS, `pos ${axis}`, last], [C_SETPOINT, `sp ${axis}`, setpoint]]);
}

function drawEnginePlot(
  ctx: CanvasRenderingContext2D, label: string,
  times: number[], alpha: number[], beta: number[], thrust: number[],
  totalTime: number, abRange: Range, tRange: Range,
) {
  const pw = CW - PAD.left - PAD.right, ph = CH - PAD.top - PAD.bottom;
  ctx.fillStyle = CHART_BG; ctx.fillRect(0, 0, CW, CH);
  const [aMin, aMax] = abRange.padded();
  const [tMin, tMax] = tRange.padded();
  drawAxes(ctx, pw, ph, aMin, aMax, tMin, tMax, label, C_ALPHA, C_THRUST);

  const tMaxT = Math.max(totalTime, 1e-3);
  const drawA = (d: number[], color: string) => {
    const n = d.length; if (n < 2) return;
    const span = aMax - aMin;
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([]);
    ctx.beginPath();
    for (let j = 0; j < n; j++) {
      const x = PAD.left + (times[j] / tMaxT) * pw;
      const y = PAD.top + ph - ((d[j] - aMin) / span) * ph;
      j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  };
  const drawT = (d: number[], color: string) => {
    const n = d.length; if (n < 2) return;
    const span = tMax - tMin;
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([]);
    ctx.beginPath();
    for (let j = 0; j < n; j++) {
      const x = PAD.left + (times[j] / tMaxT) * pw;
      const y = PAD.top + ph - ((d[j] - tMin) / span) * ph;
      j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  };
  drawA(alpha, C_ALPHA); drawA(beta, C_BETA); drawT(thrust, C_THRUST);

  const lastA = alpha.length ? alpha[alpha.length - 1] : null;
  const lastB = beta.length  ? beta[beta.length - 1]   : null;
  const lastT = thrust.length ? thrust[thrust.length - 1] : null;
  const maxA = isFinite(abRange.max) ? abRange.max : null;
  legend(ctx, ph, [
    [C_ALPHA, `α=${lastA !== null ? lastA.toFixed(2) : "N/A"} mx=${maxA !== null ? maxA.toFixed(2) : "N/A"}`, null],
    [C_BETA, `β=${lastB !== null ? lastB.toFixed(2) : "N/A"} mx=${maxA !== null ? maxA.toFixed(2) : "N/A"}`, null],
    [C_THRUST, lastT !== null ? `T=${lastT.toFixed(1)}kN` : "T=N/A", null],
  ]);
}

function drawOmegaCombinedPlot(
  ctx: CanvasRenderingContext2D,
  times: number[], omegaX: number[], omegaY: number[], omegaZ: number[],
  totalTime: number, range: Range,
) {
  const pw = CW - PAD.left - PAD.right, ph = CH - PAD.top - PAD.bottom;
  ctx.fillStyle = CHART_BG; ctx.fillRect(0, 0, CW, CH);
  const [yMin, yMax] = range.padded(0.1);
  drawAxes(ctx, pw, ph, yMin, yMax, null, null, "Body Rates", C_OMEGA_X, null, "rad/s");
  polyline(ctx, times, omegaX, totalTime, pw, ph, yMin, yMax, C_OMEGA_X, 1.5);
  polyline(ctx, times, omegaY, totalTime, pw, ph, yMin, yMax, C_OMEGA_Y, 1.5);
  polyline(ctx, times, omegaZ, totalTime, pw, ph, yMin, yMax, C_OMEGA_Z, 1.5);
  const lastX = omegaX.length ? omegaX[omegaX.length - 1] : null;
  const lastY = omegaY.length ? omegaY[omegaY.length - 1] : null;
  const lastZ = omegaZ.length ? omegaZ[omegaZ.length - 1] : null;
  legend(ctx, ph, [[C_OMEGA_X, "ωX", lastX], [C_OMEGA_Y, "ωY", lastY], [C_OMEGA_Z, "ωZ", lastZ]]);
}

// ── LivePlots class ────────────────────────────────────────────────────────────
export class LivePlots {
  private readonly ctxs: CanvasRenderingContext2D[] = [];
  private _wrapperEl: HTMLElement | null = null;
  private _dirty     = false;
  private _lastRender = 0;

  // When > 0, sliding-window mode: keep only the latest N samples
  private _maxSamples = 0;

  private times: number[] = [];
  private totalTime = 30;
  private setpoint: [number, number, number] = [0, 0, 0];
  private pos:    [number[], number[], number[]] = [[], [], []];
  private alpha:  [number[], number[], number[]] = [[], [], []];
  private beta:   [number[], number[], number[]] = [[], [], []];
  private thrust: [number[], number[], number[]] = [[], [], []];
  private omega:  [number[], number[], number[]] = [[], [], []];

  // Running ranges
  private posRange:    Range[] = [new Range(), new Range(), new Range()];
  private abRange:     Range[] = [new Range(), new Range(), new Range()];
  private thrustRange: Range[] = [new Range(), new Range(), new Range()];
  private omegaRange:  Range   = new Range();

  constructor() {
    this._buildPanel();
    // The panel is open from the start, so paint the empty axes immediately
    // rather than leaving seven blank canvases until the first sim frame.
    this._dirty = true;
    this.render();
  }

  /** Call before a live setpoint session to cap memory and scroll the x-axis. */
  setSlidingWindow(maxSamples: number): void {
    this._maxSamples = maxSamples;
  }

  updateSetpoint(setpoint: [number, number, number]): void {
    this.setpoint = setpoint;
    for (let i = 0; i < 3; i++) this.posRange[i].add(setpoint[i]);
    this._dirty = true;
  }

  setMeta(totalTime: number, setpoint: [number, number, number]): void {
    this.totalTime = totalTime; this.setpoint = setpoint;
    this.times = []; this.pos = [[], [], []]; this.alpha = [[], [], []]; this.beta = [[], [], []];
    this.thrust = [[], [], []]; this.omega = [[], [], []];
    for (let i = 0; i < 3; i++) {
      this.posRange[i].reset(); this.abRange[i].reset(); this.thrustRange[i].reset();
      this.posRange[i].add(setpoint[i]);
    }
    this.omegaRange.reset();
    this._dirty = true;
  }

  addFrame(
    t: number, pos: [number, number, number],
    engines: [number, number, number][],
    omega: [number, number, number],
    _u_cart?: [number, number, number][],
  ): void {
    const R2D = 180 / Math.PI;
    this.times.push(t);
    for (let i = 0; i < 3; i++) {
      this.pos[i].push(pos[i]);
      const a = engines[i][0] * R2D, b = engines[i][1] * R2D;
      this.alpha[i].push(a); this.beta[i].push(b);
      const T = engines[i][2];
      const tk = (T !== undefined && isFinite(T)) ? T / 1000 : NaN;
      this.thrust[i].push(tk);
      this.omega[i].push(omega[i]);
    }

    // Trim oldest sample when sliding-window mode is active
    if (this._maxSamples > 0 && this.times.length > this._maxSamples) {
      this.times.shift();
      for (let i = 0; i < 3; i++) {
        this.pos[i].shift(); this.alpha[i].shift(); this.beta[i].shift();
        this.thrust[i].shift(); this.omega[i].shift();
      }
      // Recompute ranges from scratch over the retained window
      for (let i = 0; i < 3; i++) {
        this.posRange[i].reset(); this.posRange[i].add(this.setpoint[i]);
        this.abRange[i].reset(); this.thrustRange[i].reset();
        for (let j = 0; j < this.times.length; j++) {
          this.posRange[i].add(this.pos[i][j]);
          this.abRange[i].add(this.alpha[i][j]); this.abRange[i].add(this.beta[i][j]);
          if (isFinite(this.thrust[i][j])) this.thrustRange[i].add(this.thrust[i][j]);
        }
      }
      this.omegaRange.reset();
      for (let j = 0; j < this.times.length; j++) {
        for (let i = 0; i < 3; i++) this.omegaRange.add(this.omega[i][j]);
      }
    } else {
      // Append-only: just extend ranges with new values
      for (let i = 0; i < 3; i++) {
        this.posRange[i].add(pos[i]);
        const a = engines[i][0] * R2D, b = engines[i][1] * R2D;
        this.abRange[i].add(a); this.abRange[i].add(b);
        const T = engines[i][2];
        const tk = (T !== undefined && isFinite(T)) ? T / 1000 : NaN;
        if (isFinite(tk)) this.thrustRange[i].add(tk);
        this.omegaRange.add(omega[i]);
      }
    }

    this._dirty = true;
  }

  render(): void {
    if (!this._dirty) return;
    const now = performance.now();
    if (now - this._lastRender < RENDER_INTERVAL_MS) return;
    this._lastRender = now;
    this._dirty = false;

    // In sliding mode the x-axis spans the retained window, not totalTime
    const windowDuration = this._maxSamples > 0 && this.times.length >= 2
      ? this.times[this.times.length - 1] - this.times[0]
      : this.totalTime;
    // Re-zero times relative to window start for the draw helpers
    const t0 = this.times.length ? this.times[0] : 0;
    const relTimes = this.times.map(t => t - t0);

    const axLabels: ("X"|"Y"|"Z")[] = ["X", "Y", "Z"];
    for (let i = 0; i < 3; i++) {
      drawPositionPlot(this.ctxs[i], axLabels[i], relTimes, this.pos[i], this.setpoint[i], windowDuration, this.posRange[i]);
    }
    for (let i = 0; i < 3; i++) {
      drawEnginePlot(this.ctxs[3 + i], `Engine ${i + 1}`, relTimes, this.alpha[i], this.beta[i], this.thrust[i], windowDuration, this.abRange[i], this.thrustRange[i]);
    }
    drawOmegaCombinedPlot(this.ctxs[6], relTimes, this.omega[0], this.omega[1], this.omega[2], windowDuration, this.omegaRange);
  }

  dispose(): void {
    if (this._wrapperEl?.parentNode) this._wrapperEl.parentNode.removeChild(this._wrapperEl);
  }

  private _buildPanel(): void {
    const wrapper = document.createElement("div");
    this._wrapperEl = wrapper;
    wrapper.style.cssText = [
      "position:fixed",
      "top:5.25rem",
      "left:1.25rem",
      "z-index:1000",
      "font:400 12px/1.6 Inter, ui-sans-serif, system-ui, sans-serif",
      "color:rgba(255,255,255,0.85)",
      "border-radius:1rem",
      "border:1px solid rgba(255,255,255,0.10)",
      "background:rgba(7,7,11,0.80)",
      "backdrop-filter:blur(14px)",
      "-webkit-backdrop-filter:blur(14px)",
      "box-shadow:inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 60px -32px rgba(0,0,0,0.9)",
      "overflow:hidden",
      "transform:translateZ(0)",
      "contain:layout paint",
      "will-change:transform",
    ].join(";");

    // Static header — the panel is always open, so there is no toggle here.
    const titleBar = document.createElement("div");
    titleBar.style.cssText =
      "display:flex;align-items:center;gap:0.6rem;border-bottom:1px solid rgba(255,255,255,0.08);padding:0.7rem 1rem;user-select:none;";

    const dot = document.createElement("span");
    dot.style.cssText =
      `width:5px;height:5px;border-radius:50%;background:${SAND};flex:none;box-shadow:0 0 8px ${SAND};`;

    const titleText = document.createElement("span");
    titleText.textContent = "Live Telemetry";
    titleText.style.cssText =
      `font-family:${MONO};font-weight:500;color:${SAND};font-size:0.62rem;letter-spacing:0.2em;text-transform:uppercase;`;

    titleBar.appendChild(dot); titleBar.appendChild(titleText);

    const body = document.createElement("div");
    body.className = "telemetry-scroll"; // slimmer scrollbar, see src/index.css
    body.style.cssText =
      "padding:0.7rem;display:flex;flex-direction:column;gap:0.5rem;max-height:min(72vh,720px);overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;";

    const dpr = window.devicePixelRatio || 1;
    for (let i = 0; i < 7; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = CW * dpr; canvas.height = CH * dpr;
      canvas.style.cssText =
        `width:${CW}px;height:${CH}px;display:block;border-radius:0.5rem;border:1px solid rgba(255,255,255,0.06);`;
      body.appendChild(canvas);
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      this.ctxs.push(ctx);
    }

    // Stop wheel events from reaching OrbitControls underneath
    body.addEventListener("wheel", (e) => { e.stopPropagation(); }, { passive: false });
    body.addEventListener("touchmove", (e) => { e.stopPropagation(); }, { passive: false });
    wrapper.addEventListener("wheel", (e) => { e.stopPropagation(); }, { passive: false });

    wrapper.appendChild(titleBar); wrapper.appendChild(body);
    document.body.appendChild(wrapper);
  }
}
