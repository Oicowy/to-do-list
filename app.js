const techCards = Array.from(document.querySelectorAll(".tech-card"));
const techSections = Array.from(document.querySelectorAll(".tech-section"));
const railLinks = Array.from(document.querySelectorAll(".tech-rail a"));
const videoButtons = Array.from(document.querySelectorAll("[data-video]"));
const modal = document.querySelector(".video-modal");
const modalTitle = document.querySelector("#modal-title");
const modalClose = document.querySelector(".modal-close");
const subscribeForm = document.querySelector(".subscribe-form");

techCards.forEach((card) => {
  card.addEventListener("click", () => {
    const targetId = card.dataset.target;
    const target = document.getElementById(targetId);
    if (!target) return;
    setActiveTechnology(targetId);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

railLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const id = link.getAttribute("href").replace("#", "");
    setActiveTechnology(id);
  });
});

videoButtons.forEach((button) => {
  button.addEventListener("click", () => openVideo(button.dataset.video));
});

modalClose.addEventListener("click", closeVideo);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeVideo();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) closeVideo();
});

subscribeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = subscribeForm.querySelector("button");
  button.textContent = "Subscribed";
  setTimeout(() => { button.textContent = "Subscribe"; }, 2200);
  subscribeForm.reset();
});

const observer = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) setActiveTechnology(visible.target.id);
}, { rootMargin: "-35% 0px -45% 0px", threshold: [0.2, 0.45, 0.7] });

techSections.forEach((section) => observer.observe(section));

function setActiveTechnology(id) {
  techCards.forEach((card) => card.classList.toggle("is-active", card.dataset.target === id));
  railLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`));
}

function openVideo(title) {
  modalTitle.textContent = title || "OSIGHT Technology Overview";
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalClose.focus();
}

function closeVideo() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}
