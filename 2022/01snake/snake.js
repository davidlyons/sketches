import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import TWEEN from 'three/addons/libs/tween.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const container = document.getElementById('container');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

renderer.setClearColor('#000', 1);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(0, 0, 3);
camera.lookAt(new THREE.Vector3());

const controls = new OrbitControls(camera, renderer.domElement);

const scene = new THREE.Scene();

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

const dLight2 = new THREE.DirectionalLight(0xffffff, 0.1);
dLight2.position.set(0, 2, -2);
scene.add(dLight2);

const textureLoader = new THREE.TextureLoader();

const ao = textureLoader.load('maps/Stylized_Scales_002_ambientOcclusion.jpg');
const baseColor = textureLoader.load('maps/Stylized_Scales_002_basecolor.jpg');
const displacement = textureLoader.load('maps/Stylized_Scales_002_height.png');
const normal = textureLoader.load('maps/Stylized_Scales_002_normal.jpg');
const roughness = textureLoader.load('maps/Stylized_Scales_002_roughness.jpg');

[ao, baseColor, displacement, normal, roughness].forEach((texture) => {
  texture.center.set(0.5, 0.5);
  texture.rotation = -Math.PI / 2;
  texture.repeat.set(1, 4);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
});

// const geo = new THREE.TorusGeometry(1, 0.4, 32, 100);
const geo = new THREE.TorusGeometry(1.2, 0.32, 200, 340);
const mat = new THREE.MeshStandardMaterial({
  color: 0x000000,
  // map: baseColor,
  normalMap: normal,
  normalScale: new THREE.Vector2().setScalar(0.5),
  displacementMap: displacement,
  displacementScale: 0.06,
  aoMap: ao,
  roughnessMap: roughness,
  roughness: 0.8,
  metalness: 0.1,
});

const torus1 = new THREE.Mesh(geo, mat);
torus1.rotation.x = THREE.MathUtils.degToRad(115);
torus1.rotation.y = THREE.MathUtils.degToRad(-30);
torus1.position.set(-0.1, 0, 0);
scene.add(torus1);

const torus2 = torus1.clone();
torus2.rotation.x = THREE.MathUtils.degToRad(85);
torus2.rotation.y = THREE.MathUtils.degToRad(18);
torus2.position.set(1, 0.05, -0.2);
scene.add(torus2);

const torus3 = torus1.clone();
torus3.rotation.x = THREE.MathUtils.degToRad(160);
torus3.rotation.y = THREE.MathUtils.degToRad(-45);
torus3.position.set(-0.6, 0.1, 0.5);
scene.add(torus3);

const torus4 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.45, 200, 350), mat);
torus4.rotation.x = THREE.MathUtils.degToRad(40);
torus4.rotation.y = THREE.MathUtils.degToRad(60 + 180);
torus4.position.set(0.3, 0.6, -0.9);
scene.add(torus4);

const torus5 = torus1.clone();
torus5.rotation.x = THREE.MathUtils.degToRad(-70);
torus5.rotation.y = THREE.MathUtils.degToRad(-115);
torus5.position.set(1.7, 0.0, 0.4);
scene.add(torus5);

const torus6 = torus1.clone();
torus6.rotation.x = THREE.MathUtils.degToRad(45);
torus6.rotation.y = THREE.MathUtils.degToRad(-115);
torus6.position.set(1.8, -0.3, -0.2);
scene.add(torus6);

const torus7 = torus1.clone();
torus7.rotation.x = THREE.MathUtils.degToRad(85);
torus7.rotation.y = THREE.MathUtils.degToRad(40 + 180);
torus7.position.set(1.3, 0.9, -2.1);
scene.add(torus7);

var timeline = {
  playhead: 0,
};

var tween1 = new TWEEN.Tween(timeline)
  .to({ playhead: 1 }, 1000 * 20)
  .easing(TWEEN.Easing.Linear.None)
  .repeat(Infinity)
  .start();

window.addEventListener('resize', resize, false);
function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

renderer.setAnimationLoop(loop);

function loop() {
  TWEEN.update();

  torus1.rotation.z =
    torus2.rotation.z =
    torus3.rotation.z =
    torus4.rotation.z =
    torus5.rotation.z =
    torus6.rotation.z =
    torus7.rotation.z =
      0.5 * Math.PI * timeline.playhead;

  controls.update();
  renderer.render(scene, camera);
}
