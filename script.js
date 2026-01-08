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

/* =====================
   SCROLL REVEAL
===================== */
const reveals = document.querySelectorAll(".reveal");

if (reveals.length) {
  // Use lower threshold on mobile for better performance
  const threshold = isMobile() ? 0.1 : 0.15;
  
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          // Stop observing once revealed to improve performance
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: threshold }
  );

  reveals.forEach(el => observer.observe(el));
}

/* =====================
   CURSOR CODE FOLLOWER
===================== */
const cursor = document.querySelector(".cursor-code");

if (cursor) {
  document.addEventListener("mousemove", e => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });

  document.addEventListener("mouseenter", () => {
    cursor.classList.add("active");
  });

  document.addEventListener("mouseleave", () => {
    cursor.classList.remove("active");
  });
}

/* =====================
   SCROLL PROGRESS BAR (Code Style)
===================== */
const scrollProgress = document.createElement("div");
scrollProgress.className = "scroll-progress";
document.body.appendChild(scrollProgress);

// Use throttled scroll handler for better performance
const updateScrollProgress = throttle(() => {
  const st = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  
  if (scrollHeight > 0) {
    const scrollPercent = (st / scrollHeight) * 100;
    scrollProgress.style.width = scrollPercent + "%";

    // Binary scroll counter - only update on desktop
    if (!isMobile()) {
      const binaryValue = Math.floor(scrollPercent).toString(2).padStart(8, '0');
      document.documentElement.style.setProperty('--scroll-binary', `"${binaryValue}"`);
    }
  }
}, 16); // ~60fps throttle

if (!isMobile()) {
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
}

/* =====================
   PARALLAX BACKGROUND GLOW
===================== */
const glow = document.querySelector(".bg-glow");

// Only enable parallax on desktop for better mobile performance
if (glow && !isMobile()) {
  const updateGlow = throttle(e => {
    // disable parallax when modal open
    if (document.body.style.overflow === "hidden") return;

    const x = (e.clientX / window.innerWidth - 0.5) * 60;
    const y = (e.clientY / window.innerHeight - 0.5) * 60;

    glow.style.transform = `translate(${x}px, ${y}px)`;
  }, 16);

  document.addEventListener("mousemove", updateGlow);
}

/* =====================
   PROJECT CARD 3D HOVER
===================== */
document.querySelectorAll(".project-card").forEach(card => {

  // Only add 3D hover effect on desktop
  if (!isMobile()) {
    card.addEventListener("mousemove", e => {
      // stop effect when modal open
      if (document.body.style.overflow === "hidden") return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rotateY = ((x / rect.width) - 0.5) * 10;
      const rotateX = ((y / rect.height) - 0.5) * -10;

      card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-8px)
      `;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  }

  /* =====================
     OPEN MODAL (RESET CARD)
  ===================== */
  card.addEventListener("click", () => {
    card.style.transform = ""; // reset hover transform
  });

});

/* =====================
   MODAL HANDLER (PROJECTS)
===================== */
document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("click", () => {
    const modalId = card.getAttribute("data-modal");
    const modal = document.getElementById(modalId);

    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
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
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    }
  });
});

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
    // Add click handlers to gallery images
    document.querySelectorAll(".modal-gallery img").forEach(img => {
      img.style.cursor = "pointer";
      img.addEventListener("click", e => this.open(e.target));
    });

    // Navigation buttons
    this.prevBtn.addEventListener("click", () => this.navigate(-1));
    this.nextBtn.addEventListener("click", () => this.navigate(1));

    // Close handlers
    this.closeBtn.addEventListener("click", () => this.close());
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
    // Get all images in the same gallery
    const gallery = imgElement.closest(".modal-gallery");
    this.currentGallery = Array.from(gallery.querySelectorAll("img"));
    this.currentIndex = this.currentGallery.indexOf(imgElement);

    // Update navigation visibility
    this.updateNavVisibility();

    // Show image
    this.lightboxImg.src = imgElement.src;
    this.lightboxImg.alt = imgElement.alt || "Project screenshot";

    // Show caption if available
    const projectTitle = imgElement.closest(".modal").querySelector("h3");
    if (projectTitle) {
      this.caption.textContent = `${projectTitle.textContent} (${this.currentIndex + 1}/${this.currentGallery.length})`;
    } else {
      this.caption.textContent = `${this.currentIndex + 1}/${this.currentGallery.length}`;
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

  navigate(direction) {
    this.currentIndex += direction;

    // Wrap around
    if (this.currentIndex < 0) {
      this.currentIndex = this.currentGallery.length - 1;
    } else if (this.currentIndex >= this.currentGallery.length) {
      this.currentIndex = 0;
    }

    const img = this.currentGallery[this.currentIndex];
    this.lightboxImg.src = img.src;
    this.lightboxImg.alt = img.alt || "Project screenshot";

    // Update caption
    const projectTitle = img.closest(".modal").querySelector("h3");
    if (projectTitle) {
      this.caption.textContent = `${projectTitle.textContent} (${this.currentIndex + 1}/${this.currentGallery.length})`;
    } else {
      this.caption.textContent = `${this.currentIndex + 1}/${this.currentGallery.length}`;
    }

    this.updateNavVisibility();
  }

  updateNavVisibility() {
    // Show/hide nav buttons based on gallery size
    if (this.currentGallery.length <= 1) {
      this.prevBtn.style.display = "none";
      this.nextBtn.style.display = "none";
    } else {
      this.prevBtn.style.display = "block";
      this.nextBtn.style.display = "block";
    }
  }
}

// Initialize lightbox when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new ImageLightbox();
});