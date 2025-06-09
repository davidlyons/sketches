import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'lil-gui';
import TWEEN from 'three/addons/libs/tween.module.js';

const container = document.getElementById('container');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

renderer.setClearColor('#000', 1);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1528);

// var ah = window.ah = new THREE.AxesHelper(1);
// scene.add( ah );

// const controls = new OrbitControls( camera, renderer.domElement );
// controls.screenSpacePanning = true;

camera.position.set(0, 0, 25);

const target = new THREE.Vector3();

// -----------------------------------------------------------------------

// https://2pha.com/demos/threejs/shaders/2_color_fresnel.html

var fresnelMat = new THREE.ShaderMaterial({
  uniforms: {
    color1: { type: 'c', value: new THREE.Color(0xb4f1ff) }, // edge, light blue
    color2: { type: 'c', value: new THREE.Color(0x475fbd) }, // base, dark blue
    alpha: { type: 'f', value: 0.75 },
    fresnelBias: { type: 'f', value: 0.1 },
    fresnelScale: { type: 'f', value: 1.0 },
    fresnelPower: { type: 'f', value: 1.3 },
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

var fresnelMat2 = fresnelMat.clone();
fresnelMat2.uniforms.color1.value.setHex(0xf9dbff); // light pink
fresnelMat2.uniforms.color2.value.setHex(0xc520cb); // pink

// -------------------------------

var gui = new GUI();
gui.close();

var f1 = gui.addFolder('fresnel');
f1.open();

f1.add(fresnelMat.uniforms.fresnelBias, 'value', 0, 1).name('bias');
f1.add(fresnelMat.uniforms.fresnelScale, 'value', 0, 10).name('scale');
f1.add(fresnelMat.uniforms.fresnelPower, 'value', 0, 10).name('power');

var colors = {
  color1: '#' + fresnelMat.uniforms.color1.value.getHexString(),
  color2: '#' + fresnelMat.uniforms.color2.value.getHexString(),
  color3: '#' + fresnelMat2.uniforms.color1.value.getHexString(),
  color4: '#' + fresnelMat2.uniforms.color2.value.getHexString(),
  particleColor: '#76aebc',
};

f1.addColor(colors, 'color1').onChange(function (val) {
  fresnelMat.uniforms.color1.value.setStyle(val);
});

f1.addColor(colors, 'color2').onChange(function (val) {
  fresnelMat.uniforms.color2.value.setStyle(val);
});

f1.addColor(colors, 'color3').onChange(function (val) {
  fresnelMat2.uniforms.color1.value.setStyle(val);
});

f1.addColor(colors, 'color4').onChange(function (val) {
  fresnelMat2.uniforms.color2.value.setStyle(val);
});

// -----------------------------------------------------

// curve path for dna strand

class SinCurve1 extends THREE.Curve {
  constructor(scale) {
    super(scale);
    this.scale = scale === undefined ? 1 : scale;
  }

  getPoint(t, target) {
    var ty = t * 10;
    var tx = Math.sin(2.5 * Math.PI * t);
    var tz = Math.cos(2.5 * Math.PI * t);

    var point = new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);

    if (target) target.copy(point);

    return point;
  }
}

class SinCurve2 extends THREE.Curve {
  constructor(scale) {
    super(scale);
    this.scale = scale === undefined ? 1 : scale;
  }

  getPoint(t, target) {
    var ty = t * 10;
    var tx = Math.sin(2 * Math.PI * t);
    var tz = Math.cos(2 * Math.PI * t);

    var point = new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);

    if (target) target.copy(point);

    return point;
  }
}

class SinCurve3 extends THREE.Curve {
  constructor(scale) {
    super(scale);
    this.scale = scale === undefined ? 1 : scale;
  }

  getPoint(t, target) {
    var ty = t * 15;
    var tx = -Math.sin(2.8 * Math.PI * t);
    var tz = -Math.cos(2.8 * Math.PI * t);
    // var tz = 0;

    var point = new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);

    if (target) target.copy(point);

    return point;
  }
}

var curve1 = new SinCurve1(4.5);
var curve2 = new SinCurve2(6);
var curve3 = new SinCurve3(4);

// visual for curve

var points = curve1.getPoints(50);
var geometryPoints = new THREE.BufferGeometry().setFromPoints(points);
var lineMat = new THREE.LineBasicMaterial({ color: 0xcccccc });
var line = new THREE.Line(geometryPoints, lineMat);

// ------------------------------------------

var cylLength = 1.65;
var cylGeo = new THREE.CylinderGeometry(0.1, 0.1, cylLength / 2, 16, 1, true);

var sphereGeo = new THREE.SphereGeometry(0.3, 32, 32);

class DNA extends THREE.Group {
  constructor(curve, total) {
    super();

    var cylinder = new THREE.Mesh(cylGeo, fresnelMat);
    cylinder.position.y = cylLength / 4;

    var cylinder2 = new THREE.Mesh(cylGeo, fresnelMat2);
    cylinder2.position.y = -cylLength / 4;

    var sphere = new THREE.Mesh(sphereGeo, fresnelMat);
    sphere.position.y = cylLength / 2 + 0.25;

    var sphere2 = new THREE.Mesh(sphereGeo, fresnelMat2);
    sphere2.position.y = -cylLength / 2 - 0.25;

    var barGroup = new THREE.Group();
    barGroup.add(cylinder);
    barGroup.add(cylinder2);
    barGroup.add(sphere);
    barGroup.add(sphere2);

    total = total || 80;

    for (var i = 1; i <= total; i++) {
      var bGroup = new THREE.Group();

      var bar = barGroup.clone();
      bar.rotation.z = Math.PI * (i / 10);
      bar.userData.startZ = bar.rotation.z;
      bGroup.add(bar);

      curve.getPoint(i / total, bGroup.position);

      var nextPoint = curve.getPoint((i + 1) / total);
      bGroup.lookAt(nextPoint);

      this.add(bGroup);
    }

    // this.add( new THREE.AxesHelper(1) );
  }

  update(playhead) {
    this.children.forEach((obj) => {
      if (obj.isGroup) {
        var bar = obj.children[0];
        bar.rotation.z = bar.userData.startZ - Math.PI * playhead;
      }
    });
  }
}

// -------------------

var dna1 = (window.dna1 = new DNA(curve1, 95));
scene.add(dna1);
dna1.position.set(1, -21, 13);

// visual for curve
// dna1.add( line );

var dna2 = new DNA(curve2, 100);
scene.add(dna2);
// dna2.rotation.y = - Math.PI / 2;
dna2.position.set(10, -30, -4);

var dna3 = new DNA(curve3, 100);
scene.add(dna3);
dna3.position.set(-10, -28, -4);
// dna3.rotation.y = Math.PI / 2;
// dna3.rotation.z = Math.PI / 12;
// dna3.rotation.x = Math.PI / 12;

// -----------------------------------------------------------------------
// -----------------------------------------------------------------------

// particles

var ParticleShader = {
  uniforms: {
    color: { type: 'v3', value: new THREE.Color(colors.particleColor) },
    texture: { type: 't', value: null },
    time: { type: 'f', value: 0 },
    size: { type: 'f', value: 50.0 },
  },

  vertexShader: /* glsl */ `
    uniform float time;
    uniform float size;
    attribute float alphaOffset;
    varying float vAlpha;
    uniform vec4 origin;

    void main() {

      vAlpha = 0.5 * ( 1.0 + sin( alphaOffset + time ) );
      // vAlpha = 1.0;

      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      float cameraDist = distance( mvPosition, origin );
      gl_PointSize = size / cameraDist;
      gl_Position = projectionMatrix * mvPosition;

    }
  `,

  fragmentShader: /* glsl */ `
    uniform float time;
    uniform vec3 color;

    varying float vAlpha;

    void main() {
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;
      gl_FragColor = vec4( color, alpha );
    }
  `,
};

class Particles extends THREE.Group {
  constructor({
    // color = 0x333333,
    size = 0.4,
    pointCount = 40,
    range = new THREE.Vector3(2, 2, 2),
  } = {}) {
    super();

    ParticleShader.uniforms.size.value = size;

    var pointsMat = new THREE.ShaderMaterial({
      uniforms: ParticleShader.uniforms,
      vertexShader: ParticleShader.vertexShader,
      fragmentShader: ParticleShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });

    var pointsGeo = new THREE.BufferGeometry();

    var positions = new Float32Array(pointCount * 3);
    var alphas = new Float32Array(pointCount);

    for (var i = 0; i < pointCount; i++) {
      positions[i * 3 + 0] = THREE.MathUtils.randFloatSpread(range.x);
      positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(range.y);
      positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(range.z);

      alphas[i] = i;
    }

    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeo.setAttribute('alphaOffset', new THREE.BufferAttribute(alphas, 1));

    var points = (this.points = new THREE.Points(pointsGeo, pointsMat));
    points.sortParticles = true;
    points.renderOrder = 1;

    this.add(points);

    var box = new THREE.Box3();
    box.setFromCenterAndSize(points.position, range);

    // var boxHelper = new THREE.Box3Helper( box );
    // this.add( boxHelper );
  }
}

// ---------------------------------

// scale particles based on window height so they are the same size on different sized windows
function getParticleSize() {
  var size = 400 * (window.innerHeight / 900);
  return Math.max(size, 150);
}

var particles = new Particles({
  // color: 0xffffff,
  range: new THREE.Vector3(50, 50, 50),
  pointCount: 200,
  size: getParticleSize(),
  speed: 0.1,
});

f1.addColor(colors, 'particleColor').onChange(function (val) {
  particles.points.material.uniforms.color.value.set(val);
});

scene.add(particles);

//

var timeline = {
  playhead: 0,
};

new TWEEN.Tween(timeline)
  .to({ playhead: 1 }, 1000 * 30)
  .easing(TWEEN.Easing.Linear.None)
  .repeat(Infinity)
  .start();

// ---------------------------------------------------------------
// ---------------------------------------------------------------

window.addEventListener('resize', resize, false);
function resize() {
  particles.size = ParticleShader.uniforms.size.value = getParticleSize();

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

renderer.setAnimationLoop(loop);

function loop() {
  TWEEN.update();

  var playhead = timeline.playhead;

  dna1.update(playhead * 8);
  dna2.update(playhead * 8);
  dna3.update(playhead * 8);

  // controls.update();

  // update camera and target position

  camera.position.x = -Math.sin(2 * Math.PI * playhead) * 25;
  camera.position.z = Math.cos(2 * Math.PI * playhead) * 25;
  camera.position.y = Math.sin(2 * 2 * Math.PI * playhead) * 5;

  target.x = -Math.sin(2 * Math.PI * playhead) * 10;
  target.z = Math.cos(2 * Math.PI * playhead) * 10;

  camera.lookAt(target);

  //

  renderer.render(scene, camera);
}
