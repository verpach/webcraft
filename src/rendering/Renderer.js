import * as THREE from 'three';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.012);
    this.scene.background = new THREE.Color(0x87ceeb);

    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    // Directional (sun) light
    this.sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.sunLight.position.set(100, 200, 50);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 500;
    this.sunLight.shadow.camera.left = -100;
    this.sunLight.shadow.camera.right = 100;
    this.sunLight.shadow.camera.top = 100;
    this.sunLight.shadow.camera.bottom = -100;
    this.scene.add(this.sunLight);

    // Hemisphere light for sky
    this.hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3a2e1e, 0.3);
    this.scene.add(this.hemiLight);

    // Block highlight wireframe
    const highlightGeo = new THREE.BoxGeometry(1.002, 1.002, 1.002);
    const highlightMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    this.blockHighlight = new THREE.Mesh(highlightGeo, highlightMat);
    this.blockHighlight.visible = false;
    this.scene.add(this.blockHighlight);

    this._handleResize();
    window.addEventListener('resize', () => this._handleResize());
  }

  _handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
  }

  render(camera) {
    this.renderer.render(this.scene, camera);
  }

  getScene() {
    return this.scene;
  }

  showBlockHighlight(x, y, z) {
    this.blockHighlight.position.set(x + 0.5, y + 0.5, z + 0.5);
    this.blockHighlight.visible = true;
  }

  hideBlockHighlight() {
    this.blockHighlight.visible = false;
  }

  setSkyColor(r, g, b) {
    this.scene.background.setRGB(r, g, b);
    this.scene.fog.color.setRGB(r, g, b);
  }

  setSunPosition(x, y, z) {
    this.sunLight.position.set(x, y, z);
  }

  setLightIntensity(ambient, sun) {
    this.ambientLight.intensity = ambient;
    this.sunLight.intensity = sun;
  }

  getRenderer() {
    return this.renderer;
  }
}
