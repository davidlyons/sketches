import * as THREE from 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r129/build/three.module.js';
// import { OrbitControls } from 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r129/examples/jsm/controls/OrbitControls.js';

const container = document.getElementById('container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

renderer.setClearColor(0x000000, 1);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(0, 0, 3);

// const controls = new OrbitControls( camera, renderer.domElement );
// controls.screenSpacePanning = true;

// lights
const dLight = new THREE.DirectionalLight(0xffffff, 0.5);
dLight.position.set(-1, 1, 1);
scene.add(dLight);

const aLight = new THREE.AmbientLight(0x777777); // soft white light
scene.add(aLight);

// ---------------------------------------------------------------

// large center sphere

const sphereGeo = new THREE.SphereBufferGeometry(0.5, 32, 16);
// const sphereMat = new THREE.MeshBasicMaterial({ color: 0x1f1f1f }); // flat
const sphereMat = new THREE.MeshPhongMaterial({ color: 0x1f1f1f });
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
scene.add(sphere);

// thin grey line

const radius = 0.68;

const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
const points = [];

for (var i = 0; i <= 50; i++) {
  const point = new THREE.Vector3();
  point.x = Math.cos((Math.PI * 2 * i) / 49) * radius;
  point.y = Math.sin((Math.PI * 2 * i) / 49) * radius;
  points.push(point);
}

const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(lineGeo, lineMat);
scene.add(line);

// small green dots

// const greenMat = new THREE.MeshBasicMaterial({ color: 0xccff00 }); // flat
const greenMat = new THREE.MeshPhongMaterial({ color: 0xccff00 });
const greenSphere = new THREE.Mesh(sphereGeo, greenMat);
greenSphere.scale.setScalar(0.07);

for (var i = 0; i <= 6; i++) {
  const dot = greenSphere.clone();
  dot.position.x = Math.cos((Math.PI * 2 * i) / 7) * radius;
  dot.position.y = Math.sin((Math.PI * 2 * i) / 7) * radius;
  line.add(dot);

  const pLight = new THREE.PointLight(0x007f00, 0.8, 2);
  dot.add(pLight);
}

line.rotation.x = THREE.Math.degToRad(-50);
line.rotation.y = THREE.Math.degToRad(-50);

// ---------------------------------------------------------------

window.addEventListener('resize', resize, false);
function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

renderer.setAnimationLoop(loop);

function loop() {
  // controls.update();

  line.rotation.z += 0.006;
  line.rotation.y += 0.005;

  renderer.render(scene, camera);
}
