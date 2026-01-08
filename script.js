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
   MODAL HANDLER (PROJECTS)
===================== */
document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("click", () => {
    const modalId = card.getAttribute("data-modal");
    if (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
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
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
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
  new ImageLightbox();
});

