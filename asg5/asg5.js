// Some ChatGPT was used to help format & structure this code and for 
// some of the shape setup.

import * as THREE from 'three';
import { OrbitControls }  from 'three/addons/controls/OrbitControls.js';
import { OBJLoader }      from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader }      from 'three/addons/loaders/MTLLoader.js';
import { GUI }            from 'three/addons/libs/lil-gui.module.min.js';

function main() {

// Renderer & Canvas
const canvas   = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.outputEncoding = THREE.sRGBEncoding;

// Camera & OrbitControls
const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 200); // FOV, aspect, near, far
camera.position.set(0, 10, 20);
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();

// GUI Helpers
class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDiff) {
    this.obj     = obj;
    this.minProp = minProp;
    this.maxProp = maxProp;
    this.minDiff = minDiff;
    }
    get min() { return this.obj[this.minProp]; }
    set min(v) {
    this.obj[this.minProp] = v;
    this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDiff);
    }
    get max() { return this.obj[this.maxProp]; }
    set max(v) {
    this.obj[this.maxProp] = v;
    this.min = this.min;
    }
}
class ColorGUIHelper {
    constructor(object, prop) {
    this.object = object;
    this.prop   = prop;
    }
    get value() {
    return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
    this.object[this.prop].set(hexString);
    }
}
function updateCamera() {
    camera.updateProjectionMatrix();
}

// GUI & Folders
const gui = new GUI();

// — Camera Folder —
const camFolder = gui.addFolder('Camera');
camFolder.add(camera, 'fov', 1, 180)
        .name('Camera FOV')
        .onChange(updateCamera);
const camHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
camFolder.add(camHelper, 'min', 0.1, 50, 0.1)
        .name('Camera Near')
        .onChange(updateCamera);
camFolder.add(camHelper, 'max', 0.1, 300, 0.1)
        .name('Camera Far')
        .onChange(updateCamera);
camFolder.open();

// Scene
const scene = new THREE.Scene();

// — Skybox —
{
    const loader = new THREE.TextureLoader();
    loader.load(
    'textures/sky2.jpg',
    (tx) => {
        tx.mapping  = THREE.EquirectangularReflectionMapping;
        tx.encoding = THREE.sRGBEncoding;
        scene.background  = tx;
        scene.environment = tx;
    },
    undefined,
    (err) => console.error('Error loading sky2.jpg:', err)
    );
}

// — Ground Plane —
{
    const size    = 100;
    const loader  = new THREE.TextureLoader();
    const tx      = loader.load('textures/grass.jpg');
    tx.colorSpace = THREE.SRGBColorSpace;
    tx.wrapS      = THREE.RepeatWrapping;
    tx.wrapT      = THREE.RepeatWrapping;
    tx.magFilter  = THREE.NearestFilter;
    tx.repeat.set(size / 2, size / 2);

    const geo  = new THREE.PlaneGeometry(size, size);
    const mat  = new THREE.MeshPhongMaterial({ map: tx, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);
}

// — Hemisphere Light Folder —
{
    const hemiLight = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 1);
    scene.add(hemiLight);

    const hemiFolder = gui.addFolder('Hemisphere Lighting');
    hemiFolder.addColor(new ColorGUIHelper(hemiLight, 'color'), 'value')
            .name('Sky Color');
    hemiFolder.addColor(new ColorGUIHelper(hemiLight, 'groundColor'), 'value')
            .name('Ground Color');
    hemiFolder.add(hemiLight, 'intensity', 0, 5, 0.01)
            .name('Intensity');
    hemiFolder.open();
}

// — Directional Light Folder —
let dirLight, dirLightHelper;
{
    const folder = gui.addFolder('Directional Light');
    dirLight = new THREE.DirectionalLight(0xffffff, 3.0);
    dirLight.position.set(0, 10, 0);
    dirLight.target.position.set(0, 0, 0);
    scene.add(dirLight);
    scene.add(dirLight.target);

    dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 2, 0xff0000);
    scene.add(dirLightHelper);

    folder.add(dirLightHelper, 'visible')
        .name('Helper Visible')
        .onChange((v) => dirLightHelper.visible = v);
    folder.addColor(new ColorGUIHelper(dirLight, 'color'), 'value')
        .name('Color');
    folder.add(dirLight, 'intensity', 0, 5, 0.01)
        .name('Intensity');
    folder.add(dirLight.target.position, 'x', -10, 10, 0.1)
        .name('Target X');
    folder.add(dirLight.target.position, 'y',   0, 10, 0.1)
        .name('Target Y');
    folder.add(dirLight.target.position, 'z', -10, 10, 0.1)
        .name('Target Z');
    folder.open();
}

// — Load X-Wing Model —
{
    const mtlLoader = new MTLLoader();
    mtlLoader.load('textures/xwing.mtl', (mtl) => {
    mtl.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(mtl);

    objLoader.load('textures/xwing.obj', (root) => {
    
    root.scale.setScalar(8);
    root.rotation.y = Math.PI / 2;  // nose toward +Z
    root.position.set(0, 2, -2);

    // compute your spot offsets (must match the wall code)
    const spotCount   = 3;
    const wallCount   = 10;
    const blockSize   = 2;
    const gapBlocks   = 4;
    const spotSpacing = wallCount * blockSize + gapBlocks * blockSize;

    for (let s = 0; s < spotCount; s++) {
        const ship = root.clone(true);
        const centerX = (s - (spotCount - 1) / 2) * spotSpacing;
        ship.position.x = centerX;
        scene.add(ship);
    }

    });

    });
}

// Blocks
{
    const blockSize   = 2;
    const wallCount   = 10;
    const wallHeight  = 3;
    const spotCount   = 3;
    const gapBlocks   = 4; // two‐block gap between spots
    
    // compute half-width & half-height offsets
    const halfWidth  = (wallCount * blockSize) / 2;
    const halfGap    = (gapBlocks * blockSize) / 2;
    const yOffset    = blockSize / 2;

    // define X-spacing between spot centers
    const spotSpacing = wallCount * blockSize + gapBlocks * blockSize;

    // load wood texture
    const woodTex = new THREE.TextureLoader().load('textures/stone.jpg', tx => {
    tx.encoding   = THREE.sRGBEncoding;
    tx.magFilter  = THREE.NearestFilter;
    tx.minFilter  = THREE.NearestMipMapNearestFilter;
    });
    const geo = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
    const mat = new THREE.MeshPhongMaterial({ map: woodTex });

    // for each spot
    for (let s = 0; s < spotCount; s++) {

        const centerX = (s - (spotCount - 1) / 2) * spotSpacing;

    // build walls at each height level
    for (let h = 0; h < wallHeight; h++) {
        const y = yOffset + h * blockSize;

        // front & back walls
        for (let i = 0; i < wallCount; i++) {
        const x = centerX - halfWidth + i * blockSize + blockSize / 2;

        // front (positive Z)
        const front = new THREE.Mesh(geo, mat);
        front.position.set(x, y, halfWidth);
        scene.add(front);

        // back (negative Z)
        const back = new THREE.Mesh(geo, mat);
        back.position.set(x, y, -halfWidth);
        scene.add(back);
        }

        // left & right walls
        for (let i = 0; i < wallCount; i++) {
        const z = -halfWidth + i * blockSize + blockSize / 2;

        // left (X = centerX - halfWidth)
        const left = new THREE.Mesh(geo, mat);
        left.position.set(centerX - halfWidth, y, z);
        scene.add(left);

        // right (X = centerX + halfWidth)
        const right = new THREE.Mesh(geo, mat);
        right.position.set(centerX + halfWidth, y, z);
        scene.add(right);
        }
    }
    }
}

    // Tower
{
    const radiusTop     = .1;
    const radiusBottom  = 5;
    const height        = 22;
    const radialSegments = 8;
    const cylGeo = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    radialSegments
    );

    // you can use a color or a texture map here
    const cylMat = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('textures/obsidian.jpg'),
    });
    const cylinder = new THREE.Mesh(cylGeo, cylMat);
    cylinder.position.set( 0, height / 2, -30);
    scene.add(cylinder);
}
let starMesh = null;
let starLight   = null;
let starLightHelper = null;
    // — Star —
{
    
    const mtlLoader = new MTLLoader();
    mtlLoader.load(
        'textures/star.mtl', 
        (materials) => {
        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(
            'textures/star.obj',
            (star) => {
            star.scale.setScalar(3);
            star.position.set(0, 25, -30);
            starMesh = star;

            starLight = new THREE.PointLight(0xffffff, 10, 100, 2);
            starLight.position.set(0, 0, 0);       // centered on the star
            starMesh.add(starLight);

            starLightHelper = new THREE.PointLightHelper(starLight, 1);
            starMesh.add(starLightHelper);

            const starFolder = gui.addFolder('Star Light');
            starFolder
            .addColor(new ColorGUIHelper(starLight, 'color'), 'value')
            .name('Color');
            starFolder
            .add(starLight, 'intensity', 0, 250, 0.1)
            .name('Intensity');
            starFolder
            .add(starLight, 'distance', 0, 200, 1)
            .name('Distance')
            .onChange(() => starLightHelper.update());

            // position sliders inside a sub-folder
            const posF = starFolder.addFolder('Position');
            ['x','y','z'].forEach((axis) => {
            posF
                .add(starLight.position, axis, -20, 20, 0.1)
                .onChange(() => starLightHelper.update());
            });
            starFolder.open();
            posF.open();

            scene.add(star);
            },
            undefined,
            (err) => console.error('Error loading star.obj:', err)
        );
        },
        undefined,
        (err) => console.error('Error loading star.mtl:', err)
    );
}

    // Light Sphere Scatter
{
  const lightCount = 30;
  const planeSize  = 100;
  const margin     = 10;
  const range      = planeSize - margin * 2;
  
  for (let i = 0; i < lightCount; i++) {

    const sphereGeo = new THREE.SphereGeometry(0.3, 12, 12);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const lamp = new THREE.Mesh(sphereGeo, sphereMat);
    
    const x = (Math.random() - 0.5) * range;
    const z = (Math.random() - 0.5) * range;
    lamp.position.set(x, 0.3, z);
    scene.add(lamp);
    
    const pl = new THREE.PointLight(0xffffff, 1, 20, 2);
    pl.position.set(0, 0, 0);
    lamp.add(pl);
    
    lamp.add(pl);
  }
}

    // Random Block Scatter
{
    {
    const cubeCount = 50;
    const planeSize  = 100;
    const margin     = 10;
    const range      = planeSize - margin * 2;

    const loader = new THREE.TextureLoader();
    const texturePaths = [
        'textures/wood.jpg',
        'textures/diamonds.jpg',
        'textures/emeralds.jpg',
        'textures/gold.jpg',
    ];
    const textures = texturePaths.map(path => {
        const tx = loader.load(path);
        tx.encoding  = THREE.sRGBEncoding;
        tx.wrapS     = THREE.RepeatWrapping;
        tx.wrapT     = THREE.RepeatWrapping;
        tx.magFilter = THREE.NearestFilter;
        return tx;
    });

    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);

    for (let i = 0; i < cubeCount; i++) {
        // pick a random texture
        const mat = new THREE.MeshPhongMaterial({
        map: textures[Math.floor(Math.random() * textures.length)]
        });
        const cube = new THREE.Mesh(cubeGeo, mat);

        const x = (Math.random() - 0.5) * range;
        const z = (Math.random() - 0.5) * range;
        cube.position.set(x, 0.5, z);
        cube.rotation.y = Math.random() * Math.PI;

        scene.add(cube);
    }
    }

}

// Resize + Render Loop
function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const need = canvas.width  !== canvas.clientWidth ||
                canvas.height !== canvas.clientHeight;
    if (need) renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    return need;
}

function render(time) {
    time *= 0.001;
    if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    }
    
    if (starMesh) {
        starMesh.rotation.y = time * 0.75;
    }

    // update directional‐light helper so it follows target
    dirLightHelper.update();
    if (starLightHelper) {
        starLightHelper.update();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);
}

main();
