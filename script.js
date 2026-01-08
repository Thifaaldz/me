/* =====================
   SCROLL REVEAL
===================== */
const reveals = document.querySelectorAll(".reveal");

if (reveals.length) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    { threshold: 0.15 }
  );

  reveals.forEach(el => observer.observe(el));
}

/* =====================
   PARALLAX BACKGROUND GLOW
===================== */
const glow = document.querySelector(".bg-glow");

if (glow) {
  window.addEventListener("mousemove", e => {
    // disable parallax when modal open
    if (document.body.style.overflow === "hidden") return;

    const x = (e.clientX / window.innerWidth - 0.5) * 60;
    const y = (e.clientY / window.innerHeight - 0.5) * 60;

    glow.style.transform = `translate(${x}px, ${y}px)`;
  });
}

/* =====================
   PROJECT CARD 3D HOVER
===================== */
document.querySelectorAll(".project-card").forEach(card => {

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

  /* =====================
     OPEN MODAL (RESET CARD)
  ===================== */
  card.addEventListener("click", () => {
    card.style.transform = ""; // reset hover transform
  });

});

/* =====================
   MODAL HANDLER
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
