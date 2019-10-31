
import * as THREE from 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r110/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r110/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r110/examples/jsm/loaders/FBXLoader.js';
import { GUI } from 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r110/examples/jsm/libs/dat.gui.module.js';
import { TWEEN } from 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r110/examples/jsm/libs/tween.module.min.js';

const container = document.getElementById( 'container' );

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x333333 );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );

renderer.setClearColor('#333', 1);

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 1000 );
camera.position.set( 0, 0, 3 );

const controls = new OrbitControls( camera, renderer.domElement );
controls.screenSpacePanning = true;

const gui = new GUI();
gui.close();

// lights
const aLight = new THREE.AmbientLight( 0x333333 );
scene.add( aLight );

const dLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
dLight.position.set( 0, 1, 1 );
scene.add( dLight );

// var dlh = new THREE.DirectionalLightHelper( dLight, 0.4 );
// scene.add( dlh );

const gh = new THREE.GridHelper( 5, 10, 0x000000, 0x808080 );
scene.add( gh );

// ---------------------------------------------------------------

const sphereGeo = new THREE.SphereBufferGeometry( 0.5, 32, 16 );
const sphereMat = new THREE.MeshPhongMaterial({ color: 0xcccccc });
const sphere = new THREE.Mesh( sphereGeo, sphereMat );
scene.add( sphere );

// ---------------------------------------------------------------

const timeline = {
  playhead: 0
};

const tween1 = new TWEEN.Tween( timeline )
.to( { playhead: 1 }, 1000 * 30 )
.easing( TWEEN.Easing.Linear.None )
.repeat( Infinity )
.start();

// ---------------------------------------------------------------

window.addEventListener( 'resize', resize, false );
function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

renderer.setAnimationLoop( loop );

function loop() {

  TWEEN.update();
  controls.update();

  const playhead = timeline.playhead;

  renderer.render(scene, camera);

}