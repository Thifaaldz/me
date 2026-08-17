/* =====================
   UTILITY FUNCTIONS
===================== */
// Throttle function for performance
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Check if device is mobile
function isMobile() {
  return window.innerWidth <= 768;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForEvent(target, eventName, timeout = 1200) {
  return new Promise(resolve => {
    let done = false;

    function finish() {
      if (done) return;
      done = true;
      target.removeEventListener(eventName, finish);
      resolve();
    }

    target.addEventListener(eventName, finish, { once: true });
    setTimeout(finish, timeout);
  });
}

function waitForHeroImage(timeout = 1200) {
  const image = document.querySelector(".profile-bg-image");

  if (!image || image.complete) {
    return Promise.resolve();
  }

  const decoded = typeof image.decode === "function"
    ? image.decode().catch(() => {})
    : waitForEvent(image, "load", timeout);

  return Promise.race([decoded, wait(timeout)]);
}

function waitForFonts(timeout = 1400) {
  if (!document.fonts || !document.fonts.ready) {
    return Promise.resolve();
  }

  return Promise.race([document.fonts.ready.catch(() => {}), wait(timeout)]);
}

function initPageLoader() {
  const loader = document.getElementById("site-loader");

  if (!loader) return;

  const startedAt = performance.now();
  const minimumVisible = 520;
  const hardTimeout = 2600;

  function hideLoader() {
    const remaining = Math.max(0, minimumVisible - (performance.now() - startedAt));

    setTimeout(() => {
      clearTimeout(window.__portfolioLoaderFallback);
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-ready");
      restoreHashScroll();

      loader.addEventListener("transitionend", () => loader.remove(), { once: true });
      setTimeout(() => loader.remove(), 700);
    }, remaining);
  }

  Promise.race([
    Promise.all([
      waitForHeroImage(),
      waitForFonts(),
      waitForEvent(window, "web3scene:ready", 1500)
    ]),
    wait(hardTimeout)
  ]).then(hideLoader);
}

function restoreHashScroll() {
  if (!window.location.hash) return;

  let target;

  try {
    target = document.querySelector(window.location.hash);
  } catch (error) {
    return;
  }

  if (!target) return;

  const scrollToTarget = () => target.scrollIntoView({ block: "start", behavior: "auto" });

  requestAnimationFrame(scrollToTarget);
  setTimeout(scrollToTarget, 120);
  setTimeout(scrollToTarget, 480);
}

function optimizeMediaAttributes() {
  document.querySelectorAll("img:not(.profile-bg-image)").forEach(image => {
    if (!image.hasAttribute("loading")) {
      image.setAttribute("loading", "lazy");
    }

    if (!image.hasAttribute("decoding")) {
      image.setAttribute("decoding", "async");
    }
  });
}

function loadDeferredMedia(element) {
  const source = element?.getAttribute("data-src");

  if (!source) return;

  element.setAttribute("src", source);
  element.removeAttribute("data-src");
}

function initLazyMedia() {
  const media = Array.from(document.querySelectorAll("img[data-src]"))
    .filter(element => !element.closest(".modal-overlay"));

  if (!media.length) return;

  if (!("IntersectionObserver" in window)) {
    media.forEach(loadDeferredMedia);
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      loadDeferredMedia(entry.target);
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: "720px 0px",
    threshold: 0.01
  });

  media.forEach(element => observer.observe(element));
}

function hydrateDeferredMedia(container) {
  if (!container) return;

  container.querySelectorAll("[data-src]").forEach(element => {
    loadDeferredMedia(element);
  });
}

function openModal(modal) {
  if (!modal) return;

  hydrateDeferredMedia(modal);
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

initPageLoader();

/* =====================
   SCROLL REVEAL
===================== */
const reveals = document.querySelectorAll(".reveal");

if (reveals.length) {
  const threshold = isMobile() ? 0.1 : 0.15;
  
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: threshold }
  );

  reveals.forEach(el => observer.observe(el));
}

/* =====================
   MODAL HANDLER (PROJECTS)
===================== */
document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("click", () => {
    const modalId = card.getAttribute("data-modal");
    if (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        openModal(modal);
      }
    }
  });
});

/* =====================
   MODAL HANDLER (EXPERIENCE / TIMELINE WITH MODALS)
===================== */
document.querySelectorAll(".timeline-item[data-modal]").forEach(item => {
  item.addEventListener("click", (e) => {
    // Don't open modal if clicking on expandable content
    if (e.target.closest(".exp-content")) return;
    
    const modalId = item.getAttribute("data-modal");
    
    if (modalId) {
      const modal = document.getElementById(modalId);
      
      if (modal) {
        openModal(modal);
      }
    }
  });
});

/* =====================
   MODAL CLOSE HANDLERS
===================== */
document.querySelectorAll(".modal-close").forEach(btn => {
  btn.addEventListener("click", () => {
    closeModal(btn.closest(".modal-overlay"));
  });
});

document.querySelectorAll(".modal-overlay").forEach(overlay => {
  overlay.addEventListener("click", e => {
    if (e.target === overlay) closeModal(overlay);
  });
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-overlay.active")
      .forEach(modal => closeModal(modal));
  }
});

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

/* =====================
   IMAGE LIGHTBOX (CLICK TO ZOOM)
===================== */
class ImageLightbox {
  constructor() {
    this.lightbox = document.getElementById("image-lightbox");
    
    // Guard against missing lightbox element
    if (!this.lightbox) {
      return;
    }
    
    this.lightboxImg = this.lightbox.querySelector(".lightbox-content img");
    this.caption = this.lightbox.querySelector(".lightbox-caption");
    this.closeBtn = this.lightbox.querySelector(".lightbox-close");
    this.prevBtn = this.lightbox.querySelector(".lightbox-prev");
    this.nextBtn = this.lightbox.querySelector(".lightbox-next");

    this.currentIndex = 0;
    this.currentGallery = [];
    this.isOpen = false;

    this.init();
  }

  init() {
    // Add click handlers to gallery images - only if elements exist
    const galleryImages = document.querySelectorAll(".modal-gallery img");
    
    galleryImages.forEach(img => {
      img.style.cursor = "pointer";
      img.addEventListener("click", e => this.open(e.target));
    });

    // Add click handlers to certificate modal images
    const certImages = document.querySelectorAll(".cert-modal-img");
    certImages.forEach(img => {
      img.style.cursor = "pointer";
      img.addEventListener("click", e => {
        // Open single certificate image in lightbox
        this.openSingle(img.src, img.alt || "Certificate");
      });
    });

    // Navigation buttons - only if elements exist
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => this.navigate(-1));
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => this.navigate(1));
    }

    // Close handlers
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }
    this.lightbox.addEventListener("click", e => {
      if (e.target === this.lightbox) this.close();
    });

    // Keyboard navigation
    document.addEventListener("keydown", e => {
      if (!this.isOpen) return;
      if (e.key === "Escape") this.close();
      if (e.key === "ArrowLeft") this.navigate(-1);
      if (e.key === "ArrowRight") this.navigate(1);
    });
  }

  open(imgElement) {
    if (!imgElement || !this.lightboxImg) return;
    
    // Get all images in the same gallery
    const gallery = imgElement.closest(".modal-gallery");
    if (!gallery) return;
    
    this.currentGallery = Array.from(gallery.querySelectorAll("img"));
    if (this.currentGallery.length === 0) return;
    
    this.currentIndex = this.currentGallery.indexOf(imgElement);
    if (this.currentIndex === -1) this.currentIndex = 0;

    // Update navigation visibility
    this.updateNavVisibility();

    // Show image
    this.lightboxImg.src = imgElement.src;
    this.lightboxImg.alt = imgElement.alt || "Project screenshot";

    // Show caption if available
    if (this.caption) {
      const projectTitle = imgElement.closest(".modal")?.querySelector("h3");
      if (projectTitle) {
        this.caption.textContent = `${projectTitle.textContent} (${this.currentIndex + 1}/${this.currentGallery.length})`;
      } else {
        this.caption.textContent = `${this.currentIndex + 1}/${this.currentGallery.length}`;
      }
    }

    // Show lightbox
    this.lightbox.classList.add("active");
    this.isOpen = true;
    document.body.style.overflow = "hidden";
  }

  close() {
    this.lightbox.classList.remove("active");
    this.isOpen = false;
    document.body.style.overflow = "";
  }

  // Open a single image (for certificates)
  openSingle(src, alt) {
    if (!this.lightboxImg) return;
    
    this.currentGallery = [];
    this.currentIndex = 0;
    
    // Hide navigation for single image
    if (this.prevBtn) this.prevBtn.style.display = "none";
    if (this.nextBtn) this.nextBtn.style.display = "none";
    
    // Show image
    this.lightboxImg.src = src;
    this.lightboxImg.alt = alt;
    
    // Show caption
    if (this.caption) {
      this.caption.textContent = alt;
    }
    
    // Show lightbox
    this.lightbox.classList.add("active");
    this.isOpen = true;
    document.body.style.overflow = "hidden";
  }

  navigate(direction) {
    if (!this.currentGallery || this.currentGallery.length === 0) return;

    this.currentIndex += direction;

    // Wrap around
    if (this.currentIndex < 0) {
      this.currentIndex = this.currentGallery.length - 1;
    } else if (this.currentIndex >= this.currentGallery.length) {
      this.currentIndex = 0;
    }

    const img = this.currentGallery[this.currentIndex];
    if (!img || !this.lightboxImg) return;
    
    this.lightboxImg.src = img.src;
    this.lightboxImg.alt = img.alt || "Project screenshot";

    // Update caption
    if (this.caption) {
      const projectTitle = img.closest(".modal")?.querySelector("h3");
      if (projectTitle) {
        this.caption.textContent = `${projectTitle.textContent} (${this.currentIndex + 1}/${this.currentGallery.length})`;
      } else {
        this.caption.textContent = `${this.currentIndex + 1}/${this.currentGallery.length}`;
      }
    }

    this.updateNavVisibility();
  }

  updateNavVisibility() {
    // Show/hide nav buttons based on gallery size
    const showNav = this.currentGallery.length > 1;
    if (this.prevBtn) this.prevBtn.style.display = showNav ? "block" : "none";
    if (this.nextBtn) this.nextBtn.style.display = showNav ? "block" : "none";
  }
}

// Initialize lightbox when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  optimizeMediaAttributes();
  initLazyMedia();
  new ImageLightbox();
  initWeb3Scene();
});

window.addEventListener("hashchange", () => {
  setTimeout(restoreHashScroll, 80);
});

/* =====================
   WEB3 THREE.JS SCENE
===================== */
function initWeb3Scene() {
  const canvas = document.getElementById("web3-scene");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canvas || typeof THREE === "undefined") {
    document.body.classList.add("web3-fallback");
    window.dispatchEvent(new Event("web3scene:ready"));
    return;
  }

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance"
    });

    if (!renderer.getContext()) {
      throw new Error("WebGL context unavailable");
    }
  } catch (error) {
    document.body.classList.add("web3-fallback");
    window.dispatchEvent(new Event("web3scene:ready"));
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  const clock = new THREE.Clock();
  const pointer = { x: 0, y: 0 };
  const scroll = { y: window.scrollY || 0, progress: 0 };
  const group = new THREE.Group();
  const objects = [];
  let firstFrameRendered = false;
  let animationFrameId = null;
  let lastRenderAt = 0;
  const frameInterval = 1000 / (isMobile() ? 18 : 24);

  camera.position.set(0, 0.35, 8.5);
  scene.add(group);

  const ambient = new THREE.AmbientLight(0x6c7dff, 0.62);
  const key = new THREE.DirectionalLight(0x22e6ff, 1.45);
  const rim = new THREE.PointLight(0xffb648, 1.9, 16);
  const rose = new THREE.PointLight(0xff5f8f, 1.2, 14);

  key.position.set(-2.5, 3, 5);
  rim.position.set(3.8, -1.2, 3.6);
  rose.position.set(-4, -2, 4);
  scene.add(ambient, key, rim, rose);

  const palettes = [
    { color: 0x22e6ff, emissive: 0x063c46 },
    { color: 0xffb648, emissive: 0x4b2a06 },
    { color: 0xff5f8f, emissive: 0x4a081d },
    { color: 0x9dff7a, emissive: 0x173a0d },
    { color: 0x8f7cff, emissive: 0x19105a }
  ];

  const shapes = [
    new THREE.IcosahedronGeometry(0.86, 1),
    new THREE.DodecahedronGeometry(0.72, 0),
    new THREE.TetrahedronGeometry(0.9, 0),
    new THREE.OctahedronGeometry(0.78, 0)
  ];

  const positions = [
    [-3.7, 1.55, -1.1],
    [3.25, 1.05, -1.5],
    [4.2, -1.8, -0.9],
    [-3.25, -1.7, -1.8],
    [0.8, 2.35, -2.3],
    [-0.35, -2.35, -2.2]
  ];

  positions.forEach((position, index) => {
    const palette = palettes[index % palettes.length];
    const material = new THREE.MeshStandardMaterial({
      color: palette.color,
      emissive: palette.emissive,
      emissiveIntensity: 0.28,
      roughness: 0.34,
      metalness: 0.72,
      transparent: true,
      opacity: 0.82
    });
    const mesh = new THREE.Mesh(shapes[index % shapes.length], material);
    mesh.position.set(...position);
    mesh.rotation.set(index * 0.45, index * 0.62, index * 0.28);
    mesh.scale.setScalar(index === 2 ? 0.92 : 1);
    mesh.userData = {
      speed: 0.18 + index * 0.035,
      drift: 0.2 + index * 0.04,
      baseY: position[1]
    };

    const wire = new THREE.Mesh(
      shapes[index % shapes.length],
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.18
      })
    );
    wire.scale.setScalar(1.018);
    mesh.add(wire);
    group.add(mesh);
    objects.push(mesh);
  });

  const blockGroup = createTetrisCluster();
  blockGroup.position.set(2.2, -0.15, -2.8);
  blockGroup.rotation.set(0.35, -0.55, 0.12);
  blockGroup.userData = { speed: 0.26, baseY: -0.15 };
  group.add(blockGroup);
  objects.push(blockGroup);

  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = isMobile() ? 56 : 105;
  const vertices = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    vertices[i * 3] = (Math.random() - 0.5) * 10;
    vertices[i * 3 + 1] = (Math.random() - 0.5) * 6;
    vertices[i * 3 + 2] = -2 - Math.random() * 5;
  }

  particleGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: 0x22e6ff,
      size: 0.025,
      transparent: true,
      opacity: 0.62,
      depthWrite: false
    })
  );
  scene.add(particles);

  function createTetrisCluster() {
    const cluster = new THREE.Group();
    const cubeGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
    const cubePositions = [
      [0, 0, 0],
      [0.44, 0, 0],
      [0.88, 0, 0],
      [0.44, 0.44, 0],
      [0.44, -0.44, 0],
      [0.88, -0.44, 0]
    ];

    cubePositions.forEach((pos, index) => {
      const palette = palettes[index % palettes.length];
      const cube = new THREE.Mesh(
        cubeGeo,
        new THREE.MeshStandardMaterial({
          color: palette.color,
          emissive: palette.emissive,
          emissiveIntensity: 0.22,
          roughness: 0.4,
          metalness: 0.6
        })
      );
      cube.position.set(...pos);
      cluster.add(cube);
    });

    return cluster;
  }

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile() ? 1 : 1.25));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  function onSceneScroll() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scroll.y = window.scrollY || 0;
    scroll.progress = Math.max(0, Math.min(1, scroll.y / maxScroll));
  }

  function animate(now = 0) {
    animationFrameId = requestAnimationFrame(animate);

    if (document.hidden || (!reduceMotion && now - lastRenderAt < frameInterval)) {
      return;
    }

    lastRenderAt = now;

    const elapsed = clock.getElapsedTime();
    const scrollLift = scroll.progress * 2.8;

    objects.forEach((object, index) => {
      object.rotation.x += (0.002 + index * 0.00035) * (reduceMotion ? 0.2 : 1);
      object.rotation.y += (0.003 + index * 0.00045) * (reduceMotion ? 0.2 : 1);
      object.position.y = (object.userData.baseY || object.position.y) + Math.sin(elapsed * (object.userData.speed || 0.28) + index) * 0.18 - scrollLift;
    });

    group.rotation.y += ((pointer.x * 0.12) - group.rotation.y) * 0.04;
    group.rotation.x += ((-pointer.y * 0.08) - group.rotation.x) * 0.04;
    group.position.x += ((scroll.progress - 0.5) * 0.9 - group.position.x) * 0.035;
    camera.position.y += ((0.35 - scroll.progress * 0.55) - camera.position.y) * 0.035;
    camera.position.z += ((8.5 - scroll.progress * 1.15) - camera.position.z) * 0.035;
    particles.rotation.y = elapsed * 0.018;
    particles.rotation.x = Math.sin(elapsed * 0.12) * 0.035;
    particles.position.y = -scroll.progress * 1.6;
    renderer.render(scene, camera);

    if (!firstFrameRendered) {
      firstFrameRendered = true;
      window.dispatchEvent(new Event("web3scene:ready"));
    }

    if (reduceMotion && animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  window.addEventListener("resize", throttle(resize, 100), { passive: true });
  window.addEventListener("pointermove", throttle(onPointerMove, 24), { passive: true });
  window.addEventListener("scroll", throttle(onSceneScroll, 80), { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !animationFrameId) {
      animate();
    }
  });
  resize();
  onSceneScroll();
  animate();
}
