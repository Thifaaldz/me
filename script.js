import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';

/* Fade-in panels */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("show"); });
});
document.querySelectorAll(".panel").forEach(p => {
  if(!p.classList.contains("hero")) observer.observe(p);
  else p.classList.add("show");
});

/* Typing effect */
const span = document.querySelector(".highlight");
if(span){
  const text = span.textContent;
  span.textContent = "";
  let i=0;
  (function type(){
    if(i<text.length){
      span.textContent += text[i];
      i++;
      setTimeout(type,80);
    }
  })();
}

/* Carousel */
const projectSlides = document.querySelectorAll(".project-slide");
let current=0;
function showProject(i){
  projectSlides.forEach((s,idx)=>s.classList.toggle("active",idx===i));
}
document.querySelector(".next").onclick=()=>{ current=(current+1)%projectSlides.length; showProject(current); };
document.querySelector(".prev").onclick=()=>{ current=(current-1+projectSlides.length)%projectSlides.length; showProject(current); };
showProject(current);

/* Slideshow otomatis di dalam project */
document.querySelectorAll(".project-images").forEach(container=>{
  const imgs=container.querySelectorAll("img");
  let idx=0;
  setInterval(()=>{
    imgs[idx].classList.remove("active");
    idx=(idx+1)%imgs.length;
    imgs[idx].classList.add("active");
  },2000);
});

/* Cursor */
const cursor=document.querySelector(".cursor");
if(cursor){
  document.addEventListener("mousemove",e=>{
    cursor.style.transform=`translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  });
  document.querySelectorAll("a,button").forEach(el=>{
    el.addEventListener("mouseenter",()=>{cursor.style.width="40px";cursor.style.height="40px";});
    el.addEventListener("mouseleave",()=>{cursor.style.width="20px";cursor.style.height="20px";});
  });
}

/* Efek klik pada ikon skill: bounce + spin */
document.querySelectorAll('.slide-track img').forEach(icon => {
  icon.addEventListener('click', () => {
    icon.style.transition = 'transform 0.6s ease';
    icon.style.transform = 'scale(1.3) rotate(360deg)';
    setTimeout(() => {
      icon.style.transition = 'transform 0.3s ease';
      icon.style.transform = 'scale(1)';
    }, 600);
  });
});

/* Three.js */
const canvas=document.getElementById("three-canvas");
const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
renderer.setPixelRatio(window.devicePixelRatio);

function resizeRenderer(){
  const w=canvas.clientWidth, h=canvas.clientHeight;
  renderer.setSize(w,h,false);
  camera.aspect=w/h; camera.updateProjectionMatrix();
}
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(50,1,0.1,1000);
camera.position.z=5;

scene.add(new THREE.AmbientLight(0xffffff,0.6));
const dir=new THREE.DirectionalLight(0xffffff,1);
dir.position.set(3,5,2); scene.add(dir);

const starGeo=new THREE.BufferGeometry();
const starCount=250;
const pos=new Float32Array(starCount*3);
for(let i=0;i<starCount;i++){
  pos[i*3]=(Math.random()-0.5)*20;
  pos[i*3+1]=(Math.random()-0.5)*20;
  pos[i*3+2]=(Math.random()-0.5)*20;
}
starGeo.setAttribute("position",new THREE.BufferAttribute(pos,3));
const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:0.05}));
scene.add(stars);

let model=null,floatUp=true;
new GLTFLoader().load("model.glb",g=>{
  model=g.scene;
  model.scale.set(1.5,1.5,1.5);
  model.position.set(0,-1.5,0);
  scene.add(model);
});

function animate(){
  requestAnimationFrame(animate);
  if(model){
    model.rotation.y+=0.003;
    model.position.y+=floatUp?0.002:-0.002;
    if(model.position.y>-1.2) floatUp=false;
    if(model.position.y<-1.8) floatUp=true;
  }
  stars.rotation.y+=0.0005;
  resizeRenderer();
  renderer.render(scene,camera);
}
animate();

/* Mouse follow */
document.addEventListener("mousemove",e=>{
  if(!model) return;
  const x=(e.clientX/window.innerWidth-0.5)*2;
  const y=(e.clientY/window.innerHeight-0.5)*2;
  model.rotation.x=y*0.5;
  model.rotation.y=x*0.5;
});

window.addEventListener("resize",resizeRenderer);
resizeRenderer();

/* Hitung panjang 4 ikon pertama untuk animasi bolak-balik */
const track=document.querySelector(".slide-track");
if(track){
  const icons=track.querySelectorAll("img");
  let distance=0;
  for(let i=0;i<4 && i<icons.length;i++){
    distance+=icons[i].offsetWidth+24;
  }
  track.style.setProperty("--scroll-distance",`-${distance}px`);
}
