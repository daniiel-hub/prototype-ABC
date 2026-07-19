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
  if (sidebar.classList.contains("open")) closeMenu();
  else openMenu();
});

overlay.addEventListener("click", closeMenu);

sidebar.addEventListener("click", (e) => {
  e.stopPropagation();
});

document.addEventListener("click", (e) => {
  if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
    closeMenu();
  }
});

sidebar.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
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
  updateBodyGradient();
});

const track = document.getElementById("carouselTrack");
const originalSlides = Array.from(track.children);
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
let autoTimer = null;
let slideCount = originalSlides.length;

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
  autoTimer = null;
}

function rebuildCarousel() {
  track.innerHTML = "";

  const clonesBefore = originalSlides.map((slide) => slide.cloneNode(true));
  const clonesAfter = originalSlides.map((slide) => slide.cloneNode(true));

  clonesBefore.forEach((slide) => track.appendChild(slide));
  originalSlides.forEach((slide) => track.appendChild(slide.cloneNode(true)));
  clonesAfter.forEach((slide) => track.appendChild(slide));

  slideCount = originalSlides.length;
  index = slideCount;
  updateStep();
  currentTranslate = -index * step;
  prevTranslate = currentTranslate;
  setPosition(false);
  addImageClicks();
}

track.addEventListener("transitionend", () => {
  if (index >= slideCount * 2) {
    index = slideCount;
    moveTo(index, false);
  }

  if (index < slideCount) {
    index = slideCount * 2 - 1;
    moveTo(index, false);
  }
});

function getX(e) {
  if (e.type.startsWith("mouse")) return e.pageX;
  return e.touches[0].clientX;
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
    if (movedBy < 0) nextSlide();
    else prevSlide();
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
track.addEventListener("touchmove", pointerMove, { passive: false });
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
  updateBodyGradient();
});

function updateBodyGradient() {
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const progress = Math.min(window.scrollY / maxScroll, 1);

  const lerp = (a, b) => Math.round(a + (b - a) * progress);

  const top = `rgb(${lerp(229, 17)}, ${lerp(231, 24)}, ${lerp(235, 39)})`;
  const mid = `rgb(${lerp(156, 55)}, ${lerp(163, 65)}, ${lerp(175, 81)})`;
  const bottom = `rgb(${lerp(55, 17)}, ${lerp(65, 24)}, ${lerp(81, 39)})`;

  document.body.style.background = `linear-gradient(to bottom, ${top} 0%, ${mid} 45%, ${bottom} 100%)`;
}

rebuildCarousel();
startAuto();
updateBodyGradient();