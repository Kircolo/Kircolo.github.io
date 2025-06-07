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
camFolder.open();  // :contentReference[oaicite:5]{index=5}

// Scene
const scene = new THREE.Scene();

// — Skybox (equirectangular) —
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
    hemiFolder.open();  // :contentReference[oaicite:6]{index=6}
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
    folder.open();  // :contentReference[oaicite:7]{index=7}
}

// — Load X-Wing Model —
{
    const mtlLoader = new MTLLoader();
    mtlLoader.load('textures/xwing.mtl', (mtl) => {
    mtl.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(mtl);
    // … inside your MTLLoader.load → OBJLoader.load callback …
    objLoader.load('textures/xwing.obj', (root) => {
    // common setup
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
        // deep‐clone the loaded X-wing group
        const ship = root.clone(true);
        const centerX = (s - (spotCount - 1) / 2) * spotSpacing;
        ship.position.x = centerX;
        scene.add(ship);
    }

    // // finally dispose the original template if you like:
    // root.traverse(n => {
    //     if (n.material) n.material = n.material.clone();
    // });
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
    // compute this spot’s X-center offset
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
    // 1) Create the cylinder geometry & material
    const radiusTop     = .1;      // top radius
    const radiusBottom  = 5;      // bottom radius
    const height        = 22;      // total height
    const radialSegments = 8;    // how smooth the roundness is
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

    // 2) Position it in world space
    //    Y should be height/2 so it sits on the ground plane
    cylinder.position.set(
    /* x: */  0,
    /* y: */  height / 2,
    /* z: */  -30
    );

    // (Optional) rotate if you want it lying on its side
    // cylinder.rotation.z = Math.PI / 2;

    // 3) Add to the scene
    scene.add(cylinder);
}
let starMesh = null;
    // — Load Star Model —
{
    
    const mtlLoader = new MTLLoader();
    mtlLoader.load(
        'textures/star.mtl',        // path to your .mtl
        (materials) => {
        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(
            'textures/star.obj',     // path to your .obj
            (star) => {
            // tweak these to taste:
            star.scale.setScalar(3);       // make it 3× bigger
            star.position.set(0, 25, -30);   // lift up & move back
            starMesh = star;

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
        // rotate the star for a little animation
        starMesh.rotation.y = time * 0.75;
    }

    // update directional‐light helper so it follows target
    dirLightHelper.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);
}

main();
