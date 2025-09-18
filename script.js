import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';

gsap.registerPlugin(ScrollTrigger);

// Animasi panel
gsap.utils.toArray(".panel").forEach(panel => {
  gsap.from(panel, {
    scrollTrigger: { trigger: panel, start: "top center+=100" },
    opacity: 0,
    y: 60,
    duration: 1.2,
    ease: "power4.out"
  });
});

// Three.js
const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

// Lighting
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(3, 5, 2);
scene.add(dirLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// Stars
const starGeo = new THREE.BufferGeometry();
const starCount = 500;
const positions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 20;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04 });
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

// Model 3D
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
    model.rotation.y += 0.005;
    model.position.y += floatUp ? 0.003 : -0.003;
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
  gsap.to(model.rotation, { x: y * 0.5, y: x * 0.5, duration: 0.4, ease: 'power3.out' });
});

// Swiper skills
const skillSlides = document.querySelectorAll(".skills-swiper .swiper-slide").length;
new Swiper(".skills-swiper", {
  slidesPerView: 4,
  spaceBetween: 20,
  loop: skillSlides > 4, // aktif kalau slide lebih dari 4
  autoplay: { delay: 1500 },
  breakpoints: {
    320: { slidesPerView: 2 },
    480: { slidesPerView: 3 },
    768: { slidesPerView: 4 },
    1024: { slidesPerView: 5 }
  }
});

// Swiper projects
const projectSlides = document.querySelectorAll(".projects-swiper .swiper-slide").length;
new Swiper(".projects-swiper", {
  effect: "cube",
  grabCursor: true,
  cubeEffect: { shadow: true, slideShadows: true, shadowOffset: 20, shadowScale: 0.94 },
  loop: projectSlides > 1, // aktif kalau project lebih dari 1
  navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
  pagination: { el: ".projects-swiper .swiper-pagination", clickable: true }
});

// Nested project images
document.querySelectorAll(".project-images-swiper").forEach(swiperEl => {
  const imgSlides = swiperEl.querySelectorAll(".swiper-slide").length;
  new Swiper(swiperEl, {
    loop: imgSlides > 1,
    autoplay: { delay: 2000, disableOnInteraction: false },
    pagination: {
      el: swiperEl.querySelector(".swiper-pagination"),
      clickable: true,
    },
  });
});


// Typing effect nama
const nameSpan = document.querySelector(".hero-right .highlight");
if (nameSpan) {
  const fullName = nameSpan.textContent.trim();
  nameSpan.textContent = "";
  const h1 = document.querySelector(".hero-right h1");
  h1.innerHTML = 'Halo, saya <span class="highlight"></span>';
  const span = h1.querySelector('.highlight');
  let idx = 0;
  (function type() {
    if (idx < fullName.length) {
      span.textContent += fullName.charAt(idx);
      idx++;
      setTimeout(type, 80);
    }
  })();
}

// Custom cursor
const cursor = document.querySelector(".cursor");
if (cursor) {
  document.addEventListener("mousemove", e => {
    cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  });
  document.querySelectorAll("a,button,.swiper-button-next,.swiper-button-prev").forEach(el => {
    el.addEventListener("mouseenter", () => {
      cursor.style.width = "40px";
      cursor.style.height = "40px";
    });
    el.addEventListener("mouseleave", () => {
      cursor.style.width = "20px";
      cursor.style.height = "20px";
    });
  });
}
