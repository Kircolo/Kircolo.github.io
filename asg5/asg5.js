import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

function main() {
  // ————————————————————————————
  // Renderer & Canvas
  // ————————————————————————————
  const canvas   = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  
  // ————————————————————————————
  // Camera & Controls
  // ————————————————————————————
  const fov    = 45;
  const aspect = 2;    // will be updated on first render
  const near   = 0.1;
  const far    = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();
  
  // ————————————————————————————
  // Scene & Skybox
  // ————————————————————————————
  const scene = new THREE.Scene();
  
  // Skybox (CubeTexture)
  {
  // ensure correct color encoding
  renderer.outputEncoding = THREE.sRGBEncoding;

  const loader = new THREE.TextureLoader();
  loader.load(
    'textures/sky2.jpg',       // ← use sky2 here
    (texture) => {
      texture.mapping  = THREE.EquirectangularReflectionMapping;
      texture.encoding = THREE.sRGBEncoding;

      scene.background  = texture;
      scene.environment = texture;  // optional, for PBR reflections
    },
    undefined,
    (err) => console.error('Error loading sky2.jpg:', err)
  );
  }
  
  // ————————————————————————————
  // Ground Plane
  // ————————————————————————————
  {
    const planeSize = 40;
    const loader    = new THREE.TextureLoader();
    const texture   = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS     = THREE.RepeatWrapping;
    texture.wrapT     = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.repeat.set(planeSize / 2, planeSize / 2);
  
    const geo = new THREE.PlaneGeometry(planeSize, planeSize);
    const mat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);
  }
  
  // ————————————————————————————
  // Lights
  // ————————————————————————————
  // Hemisphere Light
  {
    const skyColor    = 0xB1E1FF;
    const groundColor = 0xB97A20;
    const intensity   = 3;
    const hemiLight   = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(hemiLight);
  }
  
  // Directional Light
  {
    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 3);
    dirLight.position.set(5, 10, 2);
    scene.add(dirLight);
    scene.add(dirLight.target);
  }
  
  // ————————————————————————————
  // Load X-wing Model
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
  // Resize Helper
  // ————————————————————————————
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width  = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }
  
  // ————————————————————————————
  // Render Loop
  // ————————————————————————————
  function render(time) {
    time *= 0.001;
  
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
  
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
