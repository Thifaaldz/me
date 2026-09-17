function loadDeferredMedia(element) {
  const source = element?.getAttribute("data-src");

  if (!source) return;

  element.setAttribute("src", source);
  element.removeAttribute("data-src");
}

function hydrateDeferredMedia(container) {
  if (!container) return;

  container.querySelectorAll("[data-src]").forEach(loadDeferredMedia);
}

function openModal(modal) {
  if (!modal) return;

  hydrateDeferredMedia(modal);
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  if (!modal) return;

  modal.classList.remove("active");
  document.body.style.overflow = "";
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
    rootMargin: "500px 0px",
    threshold: 0.01
  });

  media.forEach(element => observer.observe(element));
}

function initReveal() {
  const reveals = document.querySelectorAll(".reveal");

  if (!reveals.length) return;

  if (!("IntersectionObserver" in window)) {
    reveals.forEach(element => element.classList.add("active"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("active");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.1
  });

  reveals.forEach(element => observer.observe(element));
}

function initModals() {
  document.querySelectorAll("[data-modal]").forEach(trigger => {
    trigger.addEventListener("click", event => {
      if (event.target.closest("a")) return;

      const modal = document.getElementById(trigger.getAttribute("data-modal"));
      openModal(modal);
    });
  });

  document.querySelectorAll(".modal-close").forEach(button => {
    button.addEventListener("click", () => closeModal(button.closest(".modal-overlay")));
  });

  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", event => {
      if (event.target === overlay) closeModal(overlay);
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    document.querySelectorAll(".modal-overlay.active").forEach(closeModal);
  });
}

class ImageLightbox {
  constructor() {
    this.lightbox = document.getElementById("image-lightbox");

    if (!this.lightbox) return;

    this.image = this.lightbox.querySelector(".lightbox-content img");
    this.caption = this.lightbox.querySelector(".lightbox-caption");
    this.closeButton = this.lightbox.querySelector(".lightbox-close");
    this.prevButton = this.lightbox.querySelector(".lightbox-prev");
    this.nextButton = this.lightbox.querySelector(".lightbox-next");
    this.gallery = [];
    this.index = 0;
    this.isOpen = false;

    this.bindEvents();
  }

  bindEvents() {
    document.querySelectorAll(".modal-gallery img").forEach(image => {
      image.addEventListener("click", event => this.openGallery(event.currentTarget));
    });

    document.querySelectorAll(".cert-modal-img").forEach(image => {
      image.addEventListener("click", event => {
        const target = event.currentTarget;
        this.openSingle(target.currentSrc || target.src, target.alt || "Certificate");
      });
    });

    this.closeButton?.addEventListener("click", () => this.close());
    this.prevButton?.addEventListener("click", () => this.navigate(-1));
    this.nextButton?.addEventListener("click", () => this.navigate(1));

    this.lightbox.addEventListener("click", event => {
      if (event.target === this.lightbox) this.close();
    });

    document.addEventListener("keydown", event => {
      if (!this.isOpen) return;
      if (event.key === "Escape") this.close();
      if (event.key === "ArrowLeft") this.navigate(-1);
      if (event.key === "ArrowRight") this.navigate(1);
    });
  }

  openGallery(image) {
    const gallery = image.closest(".modal-gallery");

    if (!gallery || !this.image) return;

    hydrateDeferredMedia(gallery);
    this.gallery = Array.from(gallery.querySelectorAll("img"));
    this.index = Math.max(0, this.gallery.indexOf(image));
    this.showCurrentImage();
    this.open();
  }

  openSingle(src, alt) {
    if (!src || !this.image) return;

    this.gallery = [];
    this.index = 0;
    this.image.src = src;
    this.image.alt = alt;
    if (this.caption) this.caption.textContent = alt;
    this.updateNavigation();
    this.open();
  }

  showCurrentImage() {
    const image = this.gallery[this.index];

    if (!image || !this.image) return;

    this.image.src = image.currentSrc || image.src;
    this.image.alt = image.alt || "Project screenshot";

    if (this.caption) {
      const title = image.closest(".modal")?.querySelector("h3")?.textContent;
      const count = `${this.index + 1}/${this.gallery.length}`;
      this.caption.textContent = title ? `${title} (${count})` : count;
    }

    this.updateNavigation();
  }

  navigate(direction) {
    if (!this.gallery.length) return;

    this.index = (this.index + direction + this.gallery.length) % this.gallery.length;
    this.showCurrentImage();
  }

  updateNavigation() {
    const display = this.gallery.length > 1 ? "grid" : "none";

    if (this.prevButton) this.prevButton.style.display = display;
    if (this.nextButton) this.nextButton.style.display = display;
  }

  open() {
    this.lightbox.classList.add("active");
    this.isOpen = true;
    document.body.style.overflow = "hidden";
  }

  close() {
    this.lightbox.classList.remove("active");
    this.isOpen = false;
    document.body.style.overflow = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLazyMedia();
  initReveal();
  initModals();
  new ImageLightbox();
});
