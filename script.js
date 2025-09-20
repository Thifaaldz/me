import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';

// Fade-in panels
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("show"); });
});
document.querySelectorAll(".panel").forEach(panel => {
  if (!panel.classList.contains("hero")) observer.observe(panel);
  else panel.classList.add("show");
});

// Typing effect
const span = document.querySelector(".highlight");
if (span) {
  const text = span.textContent;
  span.textContent = "";
  let i = 0;
  (function type() {
    if (i < text.length) {
      span.textContent += text.charAt(i);
      i++;
      setTimeout(type, 80);
    }
  })();
}

// Project carousel
const projectSlides = document.querySelectorAll(".project-slide");
let currentProject = 0;
function showProject(i) {
  projectSlides.forEach((s, idx) => s.classList.toggle("active", idx === i));
}
document.querySelector(".next").addEventListener("click", () => {
  currentProject = (currentProject + 1) % projectSlides.length;
  showProject(currentProject);
});
document.querySelector(".prev").addEventListener("click", () => {
  currentProject = (currentProject - 1 + projectSlides.length) % projectSlides.length;
  showProject(currentProject);
});
showProject(currentProject);

// Slideshow otomatis dalam project
document.querySelectorAll(".project-images").forEach(container => {
  const imgs = container.querySelectorAll("img");
  let idx = 0;
  setInterval(() => {
    imgs[idx].classList.remove("active");
    idx = (idx + 1) % imgs.length;
    imgs[idx].classList.add("active");
  }, 2000);
});

// Cursor
const cursor = document.querySelector(".cursor");
if (cursor) {
  document.addEventListener("mousemove", e => {
    cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  });
  document.querySelectorAll("a,button").forEach(el => {
    el.addEventListener("mouseenter", () => {
      cursor.style.width = "40px"; cursor.style.height = "40px";
    });
    el.addEventListener("mouseleave", () => {
      cursor.style.width = "20px"; cursor.style.height = "20px";
    });
  });
}

// Three.js stars & model
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.z = 5;

// Lights
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(3, 5, 2);
scene.add(dirLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// Stars
const starGeo = new THREE.BufferGeometry();
const starCount = 300;
const positions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 20;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 }));
scene.add(stars);

// Model
const loader = new GLTFLoader();
let model = null, floatUp = true;
loader.load('model.glb', gltf => {
  model = gltf.scene;
  model.scale.set(1.5, 1.5, 1.5);
  model.position.set(0, -1.5, 0);
  scene.add(model);
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  if (model) {
    model.rotation.y += 0.003;
    model.position.y += floatUp ? 0.002 : -0.002;
    if (model.position.y > -1.2) floatUp = false;
    if (model.position.y < -1.8) floatUp = true;
  }
  stars.rotation.y += 0.0005;
  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
});

// Mouse follow
document.addEventListener('mousemove', e => {
  if (!model) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;
  model.rotation.x = y * 0.5;
  model.rotation.y = x * 0.5;
});
