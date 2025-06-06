import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'lil-gui';
import TWEEN from 'three/addons/libs/tween.module.js';

import { gsap } from 'gsap';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const container = document.getElementById('container');

var skyBlue = new THREE.Color(0x535586);
var black = new THREE.Color(0x000000);

const scene = (window.scene = new THREE.Scene());
// scene.background = skyBlue;
scene.background = black;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// renderer.setClearColor('#333', 1);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(0, 0, 1);

const controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;

const gui = new GUI();
// gui.close();

// lights
// const aLight = new THREE.AmbientLight( 0x535586 );
const aLight = new THREE.AmbientLight(0x070707);
scene.add(aLight);

const dLight = new THREE.DirectionalLight(0xffffff, 0.8);
dLight.position.set(0, 0, 1);
scene.add(dLight);

// var dlh = new THREE.DirectionalLightHelper( dLight, 0.1 );
// scene.add( dlh );

// const gh = new THREE.GridHelper( 5, 10, 0x666666, 0x333333 );
// scene.add( gh );

// ---------------------------------------------------------------

const textureLoader = new THREE.TextureLoader();

const moonGeo = new THREE.SphereGeometry(0.27, 64, 64);
const moonMat = new THREE.MeshPhongMaterial({
  map: textureLoader.load('moon.jpg'),
  // color: 0xffbf00, // orange?
  shininess: 5,
  transparent: true,
  blending: THREE.AdditiveBlending,
  // wireframe: true
});
const moon = new THREE.Mesh(moonGeo, moonMat);
moon.rotation.y = -Math.PI / 1.8;
scene.add(moon);

// gui.add( moon.rotation, 'x', - Math.PI, Math.PI);
gui.add(moon.rotation, 'y', -Math.PI, Math.PI);
// gui.add( moon.rotation, 'z', - Math.PI, Math.PI);

// todo: greensock step animation 8 phases, light side // dark side

// ---------------------------------------------------------------

var composer = new EffectComposer(renderer);

var renderPass = new RenderPass(scene, camera);

var params = {
  exposure: 1,
  bloomStrength: 1,
  bloomThreshold: 0,
  bloomRadius: 0,

  log() {
    var str = `
  exposure: ${params.exposure},
  bloomStrength: ${params.bloomStrength},
  bloomThreshold: ${params.bloomThreshold},
  bloomRadius: ${params.bloomRadius},`;

    console.log(str);
  },
};

var bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
renderer.toneMappingExposure = Math.pow(params.exposure, 4.0);
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

const outputPass = new OutputPass();

composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(outputPass);

var f1 = gui.addFolder('bloom');
f1.open();

f1.add(params, 'exposure', 0.1, 2).onChange(function (value) {
  renderer.toneMappingExposure = Math.pow(value, 4.0);
});

f1.add(params, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {
  bloomPass.threshold = Number(value);
});

f1.add(params, 'bloomStrength', 0.0, 3.0).onChange(function (value) {
  bloomPass.strength = Number(value);
});

f1.add(params, 'bloomRadius', 0.0, 1.0)
  .step(0.01)
  .onChange(function (value) {
    bloomPass.radius = Number(value);
  });

f1.add(params, 'log');

// ---------------------------------------------------------------

const timeline = {
  playhead: 0,
};

// const tween1 = new TWEEN.Tween( timeline )
// .to( { playhead: 1 }, 1000 * 20 )
// .easing( TWEEN.Easing.Linear.None )
// .repeat( Infinity )
// .start();

const obj = {
  angle: 0,
};

gsap.to(obj, { duration: 6, angle: (5 * Math.PI) / 3, ease: 'steps(5)', repeat: -1 });

// ---------------------------------------------------------------

window.addEventListener('resize', resize, false);
function resize() {
  var width = window.innerWidth;
  var height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  composer.setSize(width, height);
}

renderer.setAnimationLoop(loop);

function loop() {
  TWEEN.update();
  controls.update();

  const playhead = timeline.playhead;

  // var angle = Math.PI * 2 * playhead + Math.PI;
  var angle = Math.PI + obj.angle;

  // scene.background.copy( blue.clone().lerp( black, playhead ) );

  // moon.rotation.x -= 0.0003;
  // moon.rotation.y += 0.0005;

  dLight.position.x = -Math.sin(angle);
  dLight.position.z = Math.cos(angle);
  dLight.position.y = Math.sin(Math.PI * 2 * playhead) * 0.5;

  // dlh.update();

  // renderer.render( scene, camera );
  composer.render();
}
