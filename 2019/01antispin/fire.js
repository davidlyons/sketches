import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import TWEEN from 'three/addons/libs/tween.module.js';

const container = document.getElementById('container');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

renderer.setClearColor('#210C47', 1);

const scene = new THREE.Scene();

var aspect = window.innerWidth / window.innerHeight;
var frustumSize = 2.2;

const camera = new THREE.OrthographicCamera(
  -frustumSize * aspect,
  frustumSize * aspect,
  frustumSize,
  -frustumSize,
  1,
  1000
);
camera.position.set(0, 0, 5);
scene.add(camera);

// const controls = new OrbitControls( camera, renderer.domElement );
// controls.screenSpacePanning = true;

// -----------------------------------------------------------

var GradientShader = {
  uniforms: {
    time: { type: 'f', value: 1.0 },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,

  fragmentShader: /* glsl */ `

    varying vec2 vUv;
    uniform float time;

    // Íñigo Quílez
    // https://www.shadertoy.com/view/MsS3Wc
    vec3 hsv2rgb( in vec3 c ) {
      vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
      rgb = rgb*rgb*(3.0-2.0*rgb); // cubic smoothing
      return c.z * mix( vec3(1.0), rgb, c.y);
    }

    void main() {
      float h = vUv.x - time;

      vec3 hsl = vec3( h, 0.6, 1.0 );
      vec3 col = hsv2rgb( hsl );

      gl_FragColor = vec4( col, 1.0 );
    }
  `,
};

var OutlineShader = {
  uniforms: {
    offset: { type: 'f', value: 0.03 },
    color: { type: 'v3', value: new THREE.Color('#ff2a1f') },
    alpha: { type: 'f', value: 1.0 },
  },

  vertexShader: /* glsl */ `
    uniform float offset;

    void main() {
      vec4 pos = modelViewMatrix * vec4( position + normal * offset, 1.0 );
      gl_Position = projectionMatrix * pos;
    }
  `,

  fragmentShader: /* glsl */ `
    uniform vec3 color;
    uniform float alpha;

    void main() {
      gl_FragColor = vec4( color, alpha );
    }
  `,
};

// ----------------------------------------------------------

// https://2pha.com/demos/threejs/shaders/2_color_fresnel.html

var fresnelMat = new THREE.ShaderMaterial({
  uniforms: {
    color1: { type: 'c', value: new THREE.Color(0xff5800) }, // edge
    color2: { type: 'c', value: new THREE.Color(0xffea59) }, // base
    alpha: { type: 'f', value: 1.0 },
    fresnelBias: { type: 'f', value: 0.1 },
    fresnelScale: { type: 'f', value: 1.0 },
    fresnelPower: { type: 'f', value: 1.5 },
  },

  vertexShader: /* glsl */ `
    uniform float fresnelBias;
    uniform float fresnelScale;
    uniform float fresnelPower;

    varying float vReflectionFactor;

    void main() {
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

      vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

      vec3 I = worldPosition.xyz - cameraPosition;

      vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower );

      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: /* glsl */ `
    uniform vec3 color1;
    uniform vec3 color2;
    uniform float alpha;

    varying float vReflectionFactor;

    void main() {
      gl_FragColor = vec4(mix(color2, color1, vec3(clamp( vReflectionFactor, 0.0, 1.0 ))), alpha);
    }
  `,
  // wireframe: true,
  transparent: true,
});

// ----------------------------------------------------------

var outlineMat = new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.clone(OutlineShader.uniforms),
  vertexShader: OutlineShader.vertexShader,
  fragmentShader: OutlineShader.fragmentShader,
  side: THREE.BackSide,
  transparent: true,
});

// ----------------------------------------------------------

// outer circle

const torusGeo = new THREE.TorusGeometry(1.13, 0.12, 16, 100);

const rainbowMat = new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.clone(GradientShader.uniforms),
  vertexShader: GradientShader.vertexShader,
  fragmentShader: GradientShader.fragmentShader,
  // wireframe: true
});

const torus = new THREE.Mesh(torusGeo, fresnelMat);
torus.rotation.z = Math.PI / 2;
scene.add(torus);

var torusOutline = new THREE.Mesh(torusGeo, outlineMat);
torus.add(torusOutline);

// ----------------------------------------------------------

// flower petal antispin pattern

var options = {
  armTurns: 1,
  poiTurns: -5,
  armLength: 1,
  poiLength: 0.55,
};

class FlowerCurve extends THREE.Curve {
  constructor(scale) {
    super(scale);
    this.scale = scale === undefined ? 1 : scale;
  }

  getPoint(t, target) {
    var { armTurns, poiTurns, armLength, poiLength } = options;

    var theta1 = t * armTurns * Math.PI * 2 + Math.PI / 2;
    var theta2 = t * poiTurns * Math.PI * 2 + Math.PI / 2;

    var tx = Math.cos(theta1) * armLength + Math.cos(theta2) * poiLength;
    var ty = Math.sin(theta1) * armLength + Math.sin(theta2) * poiLength;
    var tz = 1.4 * Math.sin(t * Math.PI * 12);

    var point = new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);

    if (target) target.copy(point);

    return point;
  }
}

var path = new FlowerCurve(1);
var tubeGeo = new THREE.TubeGeometry(path, 300, 0.14, 32, false);

var antispinMesh = new THREE.Mesh(tubeGeo, fresnelMat);
scene.add(antispinMesh);

var outlineMesh = new THREE.Mesh(tubeGeo, outlineMat);
antispinMesh.add(outlineMesh);

// ----------------------------------------------------------

// 3 moving poi

var poiGeo = new THREE.SphereGeometry(0.2, 32, 32);
var poiMat = new THREE.MeshBasicMaterial({
  color: 0xfffef6,
  // transparent: true,
  // opacity: 0.8
});

var spheres = [];

for (var i = 0; i < 3; i++) {
  var poi = new THREE.Mesh(poiGeo, fresnelMat);

  var poiOutline = new THREE.Mesh(poiGeo, outlineMat);
  poi.add(poiOutline);

  scene.add(poi);
  spheres.push(poi);
}

// ----------------------------------------------------------

// flower / seed of life
// thin white lines

var radius = 2;
var width = 0.008;

var seedGroup = new THREE.Group();
seedGroup.position.z = -2;
scene.add(seedGroup);

var circleGeo = new THREE.RingGeometry(radius - width, radius + width, 64);
var circleMat = new THREE.MeshBasicMaterial({
  color: 0xcccccc,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.1,
});

var circle = new THREE.Mesh(circleGeo, circleMat);
seedGroup.add(circle);

// create and position all of the outer circles

for (var j = 0; j < 6; j++) {
  var c = circle.clone();
  var angle = (j / 6) * 2 * Math.PI + Math.PI / 6;
  c.position.x = Math.cos(angle);
  c.position.y = Math.sin(angle);
  seedGroup.add(c);
}

// ---------------------------------------------------------

var timeline = {
  playhead: 0,
};

var tween1 = new TWEEN.Tween(timeline)
  .to({ playhead: 1 }, 1000 * 20)
  .easing(TWEEN.Easing.Linear.None)
  .repeat(Infinity)
  .start();

// ---------------------------------------------------------

window.addEventListener('resize', resize, false);
function resize() {
  // ortho
  aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.left = -frustumSize * aspect;
  camera.right = frustumSize * aspect;
  camera.top = frustumSize;
  camera.bottom = -frustumSize;
  camera.updateProjectionMatrix();
}

// ---------------------------------------------------------

renderer.setAnimationLoop(loop);

function loop() {
  TWEEN.update();
  // controls.update();

  var playhead = timeline.playhead;

  rainbowMat.uniforms.time.value = playhead;

  for (var i = 0; i < spheres.length; i++) {
    var t = playhead * 2 + i / spheres.length;
    path.getPoint(t, spheres[i].position);
  }

  renderer.render(scene, camera);
}
