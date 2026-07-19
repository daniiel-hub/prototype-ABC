const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const navbar = document.querySelector(".navbar");

function openMenu() {
  sidebar.classList.add("open");
  overlay.classList.add("active");
}

function closeMenu() {
  sidebar.classList.remove("open");
  overlay.classList.remove("active");
}

hamburger.addEventListener("click", (e) => {
  e.stopPropagation();
  sidebar.classList.contains("open") ? closeMenu() : openMenu();
});

overlay.addEventListener("click", closeMenu);

sidebar.addEventListener("click", (e) => {
  e.stopPropagation();
});

document.addEventListener("click", (e) => {
  if (sidebar.classList.contains("open") && !sidebar.contains(e.target) && e.target !== hamburger) {
    closeMenu();
  }
});

sidebar.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY && currentScrollY > 80) {
    navbar.classList.add("hide");
    closeMenu();
  } else {
    navbar.classList.remove("hide");
  }

  lastScrollY = currentScrollY;
});

const track = document.getElementById("carouselTrack");
const slides = Array.from(track.children);
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const modalClose = document.getElementById("modalClose");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let index = 0;
let step = 0;
let startX = 0;
let isDragging = false;
let currentTranslate = 0;
let prevTranslate = 0;
let autoTimer;

function updateStep() {
  step = track.getBoundingClientRect().width;
}

function setPosition(animate = true) {
  track.style.transition = animate ? "transform 0.35s ease" : "none";
  track.style.transform = `translateX(${currentTranslate}px)`;
}

function moveTo(newIndex, animate = true) {
  index = newIndex;
  currentTranslate = -index * step;
  setPosition(animate);
}

function nextSlide() {
  moveTo(index + 1);
}

function prevSlide() {
  moveTo(index - 1);
}

function startAuto() {
  stopAuto();
  autoTimer = setInterval(() => {
    if (!isDragging && !modal.classList.contains("active")) nextSlide();
  }, 3000);
}

function stopAuto() {
  if (autoTimer) clearInterval(autoTimer);
}

function rebuildCarousel() {
  const total = slides.length;
  track.innerHTML = "";

  const clonesBefore = slides.map((slide) => slide.cloneNode(true));
  const clonesAfter = slides.map((slide) => slide.cloneNode(true));

  clonesBefore.forEach((slide) => track.appendChild(slide));
  slides.forEach((slide) => track.appendChild(slide.cloneNode(true)));
  clonesAfter.forEach((slide) => track.appendChild(slide));

  index = total;
  updateStep();
  currentTranslate = -index * step;
  prevTranslate = currentTranslate;
  setPosition(false);
  addImageClicks();
}

track.addEventListener("transitionend", () => {
  const total = slides.length;

  if (index >= total * 2) {
    index = total;
    moveTo(index, false);
  }

  if (index < total) {
    index = total * 2 - 1;
    moveTo(index, false);
  }
});

function getX(e) {
  return e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
}

function pointerDown(e) {
  if (modal.classList.contains("active")) return;
  isDragging = true;
  startX = getX(e);
  prevTranslate = currentTranslate;
  track.style.transition = "none";
  stopAuto();
}

function pointerMove(e) {
  if (!isDragging) return;
  const x = getX(e);
  const delta = x - startX;
  currentTranslate = prevTranslate + delta;
  setPosition(false);
}

function pointerUp() {
  if (!isDragging) return;
  isDragging = false;
  const movedBy = currentTranslate - prevTranslate;

  if (Math.abs(movedBy) > step / 4) {
    movedBy < 0 ? nextSlide() : prevSlide();
  } else {
    moveTo(index);
  }

  startAuto();
}

function addImageClicks() {
  track.querySelectorAll(".carousel-slide img").forEach((img) => {
    img.addEventListener("click", () => {
      modalImage.src = img.src;
      modalImage.alt = img.alt;
      modal.classList.add("active");
      stopAuto();
    });
  });
}

prevBtn.addEventListener("click", () => {
  prevSlide();
  startAuto();
});

nextBtn.addEventListener("click", () => {
  nextSlide();
  startAuto();
});

track.addEventListener("mousedown", pointerDown);
track.addEventListener("mousemove", pointerMove);
track.addEventListener("mouseup", pointerUp);
track.addEventListener("mouseleave", pointerUp);
track.addEventListener("touchstart", pointerDown, { passive: true });
track.addEventListener("touchmove", pointerMove, { passive: true });
track.addEventListener("touchend", pointerUp);

modalClose.addEventListener("click", () => {
  modal.classList.remove("active");
  startAuto();
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("active");
    startAuto();
  }
});

window.addEventListener("resize", () => {
  updateStep();
  currentTranslate = -index * step;
  setPosition(false);
});

rebuildCarousel();
startAuto();