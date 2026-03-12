export class SkyBox {
  constructor(renderer) {
    this.renderer = renderer;
    this.time = 0; // 0-1 day cycle (0=noon, 0.5=midnight)
    this.daySpeed = 0.0003; // Full cycle in ~55 minutes
  }

  update(dt) {
    this.time = (this.time + this.daySpeed * dt) % 1;
    this._applyTimeOfDay();
  }

  _applyTimeOfDay() {
    const t = this.time;

    // Compute sun angle: 0=noon, 0.25=sunset, 0.5=midnight, 0.75=sunrise
    const angle = t * Math.PI * 2;
    const sunX = Math.sin(angle) * 200;
    const sunY = Math.cos(angle) * 200;
    const sunZ = 50;

    this.renderer.setSunPosition(sunX, sunY, sunZ);

    // Sky colors at key times
    // noon: 0.135 0.624 0.933
    // sunset/rise: 0.93 0.45 0.18
    // night: 0.02 0.02 0.08

    let r, g, b;
    let ambient, sun;

    if (t < 0.2) {
      // Day (0 to 0.2)
      const f = t / 0.2;
      r = 0.53; g = 0.81; b = 0.98;
      ambient = 0.6; sun = 0.8;
    } else if (t < 0.25) {
      // Sunset (0.2 to 0.25)
      const f = (t - 0.2) / 0.05;
      r = lerp(0.53, 0.95, f); g = lerp(0.81, 0.45, f); b = lerp(0.98, 0.18, f);
      ambient = lerp(0.6, 0.3, f); sun = lerp(0.8, 0.3, f);
    } else if (t < 0.3) {
      // Dusk
      const f = (t - 0.25) / 0.05;
      r = lerp(0.95, 0.05, f); g = lerp(0.45, 0.05, f); b = lerp(0.18, 0.1, f);
      ambient = lerp(0.3, 0.1, f); sun = lerp(0.3, 0.05, f);
    } else if (t < 0.7) {
      // Night
      r = 0.02; g = 0.02; b = 0.1;
      ambient = 0.08; sun = 0.02;
    } else if (t < 0.75) {
      // Dawn
      const f = (t - 0.7) / 0.05;
      r = lerp(0.02, 0.95, f); g = lerp(0.02, 0.45, f); b = lerp(0.1, 0.18, f);
      ambient = lerp(0.08, 0.3, f); sun = lerp(0.02, 0.3, f);
    } else if (t < 0.8) {
      // Sunrise
      const f = (t - 0.75) / 0.05;
      r = lerp(0.95, 0.53, f); g = lerp(0.45, 0.81, f); b = lerp(0.18, 0.98, f);
      ambient = lerp(0.3, 0.6, f); sun = lerp(0.3, 0.8, f);
    } else {
      // Day again
      r = 0.53; g = 0.81; b = 0.98;
      ambient = 0.6; sun = 0.8;
    }

    this.renderer.setSkyColor(r, g, b);
    this.renderer.setLightIntensity(ambient, sun);
  }

  getTimeOfDay() {
    return this.time;
  }

  isDay() {
    return this.time < 0.25 || this.time > 0.75;
  }
}

function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}
