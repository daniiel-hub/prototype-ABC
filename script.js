const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

const carouselTrack = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const slides = document.querySelectorAll('.carousel-slide');

const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalClose = document.getElementById('modalClose');
const previewableImages = document.querySelectorAll('.previewable');

let currentIndex = 0;
let startX = 0;
let currentTranslate = 0;
let previousTranslate = 0;
let isDragging = false;
let animationID = 0;

function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('active');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
}

hamburger.addEventListener('click', () => {
  if (sidebar.classList.contains('open')) closeSidebar();
  else openSidebar();
});

overlay.addEventListener('click', closeSidebar);

sidebar.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeSidebar);
});

function updateCarousel() {
  currentTranslate = -currentIndex * carouselTrack.clientWidth;
  carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
}

function goToSlide(index) {
  currentIndex = (index + slides.length) % slides.length;
  updateCarousel();
}

prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

window.addEventListener('resize', updateCarousel);

function touchStart(event) {
  startX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
  isDragging = true;
  animationID = requestAnimationFrame(animation);
  carouselTrack.style.transition = 'none';
  previousTranslate = currentTranslate;
}

function touchMove(event) {
  if (!isDragging) return;
  const currentX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
  const diff = currentX - startX;
  currentTranslate = previousTranslate + diff;
}

function touchEnd() {
  cancelAnimationFrame(animationID);
  isDragging = false;
  const movedBy = currentTranslate - previousTranslate;

  if (movedBy < -80 && currentIndex < slides.length - 1) currentIndex++;
  if (movedBy > 80 && currentIndex > 0) currentIndex--;

  setPositionByIndex();
}

function animation() {
  carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
  if (isDragging) requestAnimationFrame(animation);
}

function setPositionByIndex() {
  currentTranslate = -currentIndex * carouselTrack.clientWidth;
  previousTranslate = currentTranslate;
  carouselTrack.style.transition = 'transform 0.35s ease';
  carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
}

carouselTrack.addEventListener('mousedown', touchStart);
carouselTrack.addEventListener('mousemove', touchMove);
carouselTrack.addEventListener('mouseup', touchEnd);
carouselTrack.addEventListener('mouseleave', touchEnd);

carouselTrack.addEventListener('touchstart', touchStart, { passive: true });
carouselTrack.addEventListener('touchmove', touchMove, { passive: true });
carouselTrack.addEventListener('touchend', touchEnd);

window.addEventListener('load', updateCarousel);

previewableImages.forEach(img => {
  img.addEventListener('click', () => {
    modalImage.src = img.src;
    modalImage.alt = img.alt;
    imageModal.classList.add('active');
    imageModal.setAttribute('aria-hidden', 'false');
  });
});

function closeModal() {
  imageModal.classList.remove('active');
  imageModal.setAttribute('aria-hidden', 'true');
  modalImage.src = '';
}

modalClose.addEventListener('click', closeModal);
imageModal.addEventListener('click', (e) => {
  if (e.target === imageModal) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSidebar();
    closeModal();
  }
});