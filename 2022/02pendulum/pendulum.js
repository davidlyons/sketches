import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.139.2/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.139.2/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'https://cdn.skypack.dev/three@0.139.2/examples/jsm/loaders/RGBELoader';
import { TWEEN } from 'https://cdn.skypack.dev/three@0.139.2/examples/jsm/libs/tween.module.min';

const container = document.getElementById('container');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

renderer.setClearColor('#000', 1);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(0, 0, 8);
camera.lookAt(new THREE.Vector3());

const controls = new OrbitControls(camera, renderer.domElement);

const scene = new THREE.Scene();

const dLight2 = new THREE.DirectionalLight(0xffffff, 0.1);
dLight2.position.set(0, 2, -2);
scene.add(dLight2);

// -------------------------------------------------------------

const pendulum = new THREE.Group();
scene.add(pendulum);
pendulum.position.y = 3.7;

// chain

const numLinks = 25; // controls length of pendulum
const spacing = 0.39 * 0.5;

class Chain extends THREE.Group {
  constructor(mesh) {
    super();

    for (let i = 0; i < numLinks; i++) {
      const link = mesh.clone();

      link.position.x = -i * spacing;

      if (i % 2) {
        link.rotation.x = Math.PI / 2;
      }

      this.add(link);
    }
  }
}

const gltfLoader = new GLTFLoader().setPath('models/');

gltfLoader.load('chain-link.glb', function (gltf) {
  const chainLink = gltf.scene.children[0];
  chainLink.scale.setScalar(0.5);
  chainLink.material.roughness = 0.3;
  chainLink.material.color.setStyle('#444444');

  const chain = new Chain(chainLink);
  chain.rotation.z = Math.PI / 2;
  pendulum.add(chain);
});

// watch

gltfLoader.setPath('models/pocket-watch1/');

gltfLoader.load('scene.gltf', function (gltf) {
  const watch = gltf.scene;
  watch.getObjectByName('Circle005').visible = false;
  watch.rotation.y = -Math.PI / 2;
  // watch.add(new THREE.AxesHelper(1));
  watch.position.z = 0.6;
  watch.position.y = -numLinks * spacing - 0.88;
  pendulum.add(watch);
});

// environment

const rgbeLoader = new RGBELoader().setPath('models/');
rgbeLoader.load('venice_sunset_1k.hdr', function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  // scene.background = texture;
  scene.environment = texture;
});

// animation

const angle = 10;

pendulum.rotation.z = THREE.MathUtils.degToRad(-angle);

const bpm = 137;

const duration = (60 / bpm) * 1000; // one swing in milliseconds

const tween = new TWEEN.Tween(pendulum.rotation)
  .to({ z: THREE.MathUtils.degToRad(angle) }, duration)
  .easing(TWEEN.Easing.Sinusoidal.InOut)
  .yoyo(true)
  .repeat(Infinity)
  .start();

// ---------------------------------------------

window.addEventListener('resize', resize, false);
function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

renderer.setAnimationLoop(loop);

function loop() {
  TWEEN.update();

  controls.update();
  renderer.render(scene, camera);
}
