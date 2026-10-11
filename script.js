const photos = [...document.querySelectorAll("#gallery img")];

const viewer = document.getElementById("viewer");
const largePhoto = document.getElementById("largePhoto");
const photoArea = document.getElementById("photoArea");
const counter = document.getElementById("counter");
const zoomLevel = document.getElementById("zoomLevel");
const filmstrip = document.getElementById("filmstrip");

let current = 0;
let zoom = 1;
let savedScrollX = 0;
let savedScrollY = 0;

function updateZoom() {
  largePhoto.style.transform = `scale(${zoom})`;
  zoomLevel.textContent = Math.round(zoom * 100) + "%";
}

function showPhoto(index) {
  current = (index + photos.length) % photos.length;

  largePhoto.src = photos[current].src;
  largePhoto.alt = photos[current].alt;

  counter.textContent = `${current + 1} / ${photos.length}`;

  zoom = 1;
  updateZoom();

  photoArea.scrollLeft = 0;
  photoArea.scrollTop = 0;

  [...filmstrip.children].forEach((thumb, i) => {
    thumb.classList.toggle("selected", i === current);
  });

  filmstrip.children[current]?.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "nearest",
  });
}

photos.forEach((photo, index) => {
  const thumb = document.createElement("img");
  thumb.src = photo.src;
  thumb.alt = photo.alt;
  thumb.addEventListener("click", () => showPhoto(index));
  filmstrip.appendChild(thumb);

  photo.addEventListener("click", () => {
    savedScrollX = window.scrollX;
    savedScrollY = window.scrollY;

    viewer.classList.add("active");
    viewer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    showPhoto(index);
  });
});

function closeViewer() {
  viewer.classList.remove("active");
  viewer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  window.scrollTo(savedScrollX, savedScrollY);
}

document.getElementById("close").onclick = closeViewer;

document.getElementById("prev").onclick = () => {
  showPhoto(current - 1);
};

document.getElementById("next").onclick = () => {
  showPhoto(current + 1);
};

document.getElementById("zoomIn").onclick = () => {
  zoom = Math.min(zoom + 0.25, 4);
  updateZoom();
};

document.getElementById("zoomOut").onclick = () => {
  zoom = Math.max(zoom - 0.25, 0.5);
  updateZoom();
};

document.getElementById("resetZoom").onclick = () => {
  zoom = 1;
  updateZoom();
  photoArea.scrollTo(0, 0);
};

largePhoto.addEventListener(
  "wheel",
  (event) => {
    if (!viewer.classList.contains("active")) return;

    event.preventDefault();

    zoom = Math.max(0.5, Math.min(4, zoom + (event.deltaY < 0 ? 0.2 : -0.2)));

    updateZoom();
  },
  { passive: false },
);

document.getElementById("fullscreen").onclick = async () => {
  try {
    if (!document.fullscreenElement) {
      await viewer.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.log("Fullscreen is unavailable.", error);
  }
};

document.addEventListener("keydown", (event) => {
  if (!viewer.classList.contains("active")) return;

  if (event.key === "Escape") closeViewer();
  if (event.key === "ArrowRight") showPhoto(current + 1);
  if (event.key === "ArrowLeft") showPhoto(current - 1);

  if (event.key === "+" || event.key === "=") {
    zoom = Math.min(zoom + 0.25, 4);
    updateZoom();
  }

  if (event.key === "-") {
    zoom = Math.max(zoom - 0.25, 0.5);
    updateZoom();
  }
});
