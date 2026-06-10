// assembly.js - module
// Minimal Three.js assembly viewer with steps
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('assemblyCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x08101a);

const camera = new THREE.PerspectiveCamera(50, 2, 0.1, 1000);
camera.position.set(0, 3, 8);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;

// lights
const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.7);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(5, 10, 7);
scene.add(dir);

// ground grid subtle
const grid = new THREE.GridHelper(20, 40, 0x0e232e, 0x0c1a22);
grid.material.opacity = 0.3; grid.material.transparent = true;
scene.add(grid);

// sample parts: three boxes representing parts A, B, C
const parts = [];
const partMaterial = (color) => new THREE.MeshStandardMaterial({ color, metalness:0.2, roughness:0.6 });

const partA = new THREE.Mesh(new THREE.BoxGeometry(2.6,0.6,1.6), partMaterial(0xff8a65));
partA.position.set(0,0.3,0);
parts.push({mesh: partA, name:'Base plate', instruction: 'Place the base plate on a flat surface.'});

const partB = new THREE.Mesh(new THREE.BoxGeometry(0.6,1.2,0.6), partMaterial(0x4db6ac));
partB.position.set(-1,0.9,0);
parts.push({mesh: partB, name:'Post', instruction: 'Attach the post into the left slot of the base.'});

const partC = new THREE.Mesh(new THREE.BoxGeometry(1.0,0.5,1.0), partMaterial(0x64b5f6));
partC.position.set(1,0.6,0.3);
parts.push({mesh: partC, name:'Top cover', instruction: 'Secure the top cover over the base and posts.'});

parts.forEach(p=>scene.add(p.mesh));

// steps definition - focus on parts sequentially
let stepIndex = 0;
const steps = parts.map((p, i) => ({
  partIndex: i,
  text: `${i+1}. ${p.name}: ${p.instruction}`,
  cameraPos: new THREE.Vector3(p.mesh.position.x, p.mesh.position.y + 1.2, p.mesh.position.z + 3.0)
}));

// UI elements
const stepText = document.getElementById('stepText');
const prevBtn = document.getElementById('prevStep');
const nextBtn = document.getElementById('nextStep');
const resetBtn = document.getElementById('resetView');

function updateUI(){
  const s = steps[stepIndex];
  stepText.textContent = s.text;
  // highlight target part (simple emissive) and un-highlight others
  parts.forEach((p, idx)=>{
    if(idx === s.partIndex){
      p.mesh.material.emissive = new THREE.Color(0x223344);
      p.mesh.scale.set(1.03,1.03,1.03);
    } else {
      p.mesh.material.emissive = new THREE.Color(0x000000);
      p.mesh.scale.set(1,1,1);
    }
  });
  // animate camera to cameraPos
  animateCameraTo(steps[stepIndex].cameraPos, 600);
}

function animateCameraTo(targetVec, duration = 600){
  const start = camera.position.clone();
  const end = targetVec.clone();
  const startTime = performance.now();
  function frame(t){
    const p = Math.min(1, (t - startTime) / duration);
    camera.position.lerpVectors(start, end, easeOutCubic(p));
    camera.lookAt(0,0.6,0);
    if(p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

prevBtn.addEventListener('click', ()=>{
  stepIndex = Math.max(0, stepIndex - 1); updateUI();
});
nextBtn.addEventListener('click', ()=>{
  stepIndex = Math.min(steps.length - 1, stepIndex + 1); updateUI();
});
resetBtn.addEventListener('click', ()=>{
  camera.position.set(0,3,8); controls.target.set(0,0.6,0); controls.update();
  parts.forEach(p=>{ p.mesh.material.emissive.setHex(0x000000); p.mesh.scale.set(1,1,1); });
  stepText.textContent = 'View reset. Use Next to see steps.';
});

// initial UI
updateUI();

function resizeRenderer(){
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== Math.floor(width * window.devicePixelRatio) || canvas.height !== Math.floor(height * window.devicePixelRatio)){
    renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix();
  }
}

function renderLoop(){
  resizeRenderer();
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(renderLoop);
}
renderLoop();

window.addEventListener('resize', ()=>{
  // keep canvas full area
  const wrap = document.getElementById('canvasWrap');
  if(wrap){
    renderer.setSize(wrap.clientWidth, wrap.clientHeight, false);
    camera.aspect = wrap.clientWidth / wrap.clientHeight; camera.updateProjectionMatrix();
  }
});

// helpful note: to load a glTF model replace the boxes above with GLTFLoader and set parts array accordingly.
