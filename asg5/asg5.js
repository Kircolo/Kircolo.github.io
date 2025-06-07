import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader }     from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader }     from 'three/addons/loaders/MTLLoader.js';
import { GUI }           from 'three/addons/libs/lil-gui.module.min.js';

function main() {
  // ————————————————————————————
  // Renderer & Canvas
  // ————————————————————————————
  const canvas   = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.outputEncoding = THREE.sRGBEncoding;

  // ————————————————————————————
  // Camera & OrbitControls
  // ————————————————————————————
  const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
  camera.position.set(0, 10, 20);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  // ————————————————————————————
  // GUI Helpers
  // ————————————————————————————
  // Helper for clamped near/far sliders
  class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDiff) {
      this.obj     = obj;
      this.minProp = minProp;
      this.maxProp = maxProp;
      this.minDiff = minDiff;
    }
    get min() {
      return this.obj[this.minProp];
    }
    set min(v) {
      this.obj[this.minProp] = v;
      this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDiff);
    }
    get max() {
      return this.obj[this.maxProp];
    }
    set max(v) {
      this.obj[this.maxProp] = v;
      this.min = this.min; // re-clamp
    }
  }

  // Helper so lil-gui can edit THREE.Color
  class ColorGUIHelper {
    constructor(object, prop) {
      this.object = object;
      this.prop   = prop;
    }
    get value() {
      return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
      this.object[this[prop]].set(hexString);
    }
  }

  function updateCamera() {
    camera.updateProjectionMatrix();
  }

  // ————————————————————————————
  // GUI & Folders
  // ————————————————————————————
  const gui = new GUI();

  // Camera controls
  const controlsFolder = gui.addFolder('Camera');
  controlsFolder
    .add(camera, 'fov', 1, 180)
    .name('Camera FOV')
    .onChange(updateCamera);

  const camHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
  controlsFolder
    .add(camHelper, 'min', 0.1, 50, 0.1)
    .name('Camera Near')
    .onChange(updateCamera);
  controlsFolder
    .add(camHelper, 'max', 0.1, 200, 0.1)
    .name('Camera Far')
    .onChange(updateCamera);
  controlsFolder.open();

  // ————————————————————————————
  // Scene & Skybox
  // ————————————————————————————
  const scene = new THREE.Scene();

  {
    const loader = new THREE.TextureLoader();
    loader.load(
      'textures/sky2.jpg',
      (texture) => {
        texture.mapping  = THREE.EquirectangularReflectionMapping;
        texture.encoding = THREE.sRGBEncoding;
        scene.background  = texture;
        scene.environment = texture;
      },
      undefined,
      (err) => console.error('Error loading sky2.jpg:', err)
    );
  }

  // ————————————————————————————
  // Ground Plane
  // ————————————————————————————
  {
    const planeSize = 100;
    const loader    = new THREE.TextureLoader();
    const tx        = loader.load('textures/grass.jpg');
    tx.colorSpace   = THREE.SRGBColorSpace;
    tx.wrapS        = THREE.RepeatWrapping;
    tx.wrapT        = THREE.RepeatWrapping;
    tx.magFilter    = THREE.NearestFilter;
    tx.repeat.set(planeSize / 2, planeSize / 2);

    const geo  = new THREE.PlaneGeometry(planeSize, planeSize);
    const mat  = new THREE.MeshPhongMaterial({ map: tx, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);
  }

  // ————————————————————————————
  // Hemisphere Light & GUI
  // ————————————————————————————
  {
    const hemiLight = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 1);
    scene.add(hemiLight);

    const hemiFolder = gui.addFolder('Hemisphere Lighting');
    hemiFolder
      .addColor(new ColorGUIHelper(hemiLight, 'color'), 'value')
      .name('Sky Color');
    hemiFolder
      .addColor(new ColorGUIHelper(hemiLight, 'groundColor'), 'value')
      .name('Ground Color');
    hemiFolder
      .add(hemiLight, 'intensity', 0, 5, 0.01)
      .name('Intensity');
    hemiFolder.open();
  }

  // ————————————————————————————
  // Directional Light
  // ————————————————————————————
  {
    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(5, 10, 2);
    scene.add(dirLight);
    scene.add(dirLight.target);
  }

  // ————————————————————————————
  // Load X-Wing Model
  // ————————————————————————————
  {
    const mtlLoader = new MTLLoader();
    mtlLoader.load('textures/xwing.mtl', (mtl) => {
      mtl.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(mtl);
      objLoader.load('textures/xwing.obj', (root) => {
        root.scale.multiplyScalar(8);
        root.position.set(0, 2, 0);
        scene.add(root);
      });
    });
  }

  // ————————————————————————————
  // Resize Helper & Render Loop
  // ————————————————————————————
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const needResize =
      canvas.width  !== canvas.clientWidth ||
      canvas.height !== canvas.clientHeight;
    if (needResize) {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;
    if (resizeRendererToDisplaySize(renderer)) {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
