// Auto-scrolling image strip with clickable arrows.
// The track scrolls continuously to the right at a slow, steady pace.
// Clicking an arrow pauses the auto-scroll, glides over by one image,
// then resumes auto-scrolling after a short pause. Hovering also pauses it.
document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("marqueeTrack");
  const prevBtn = document.getElementById("marqueePrev");
  const nextBtn = document.getElementById("marqueeNext");

  if (!track) return;

  const items = Array.from(track.children);
  if (items.length === 0) return;

  // Respect "reduce motion" accessibility setting: no auto-scroll, arrows still work.
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const AUTO_SCROLL_SPEED = 0.4;        // pixels per animation frame
  const RESUME_DELAY_MS = 2500;         // how long to wait after a click/hover before auto-scroll resumes

  let isPaused = prefersReducedMotion;
  let isHovering = false;
  let resumeTimer = null;
  let halfWidth = 0;

  function measureHalfWidth() {
    // The track contains two identical copies of the images, back to back,
    // so scrollWidth / 2 is the point where we can silently jump back to 0
    // for a seamless loop.
    halfWidth = track.scrollWidth / 2;
  }
  measureHalfWidth();
  window.addEventListener("resize", measureHalfWidth);

  function stepWidth() {
    // Width of one item plus the gap between items, used for arrow clicks.
    const first = items[0];
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return first.getBoundingClientRect().width + gap;
  }

  function autoScrollFrame() {
    if (!isPaused && !isHovering) {
      track.scrollLeft += AUTO_SCROLL_SPEED;
      if (track.scrollLeft >= halfWidth) {
        track.scrollLeft -= halfWidth;
      }
    }
    requestAnimationFrame(autoScrollFrame);
  }
  requestAnimationFrame(autoScrollFrame);

  function pauseThenResume() {
    isPaused = true;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      isPaused = prefersReducedMotion; // stays paused permanently if reduced motion is set
    }, RESUME_DELAY_MS);
  }

  function nudge(direction) {
    pauseThenResume();
    track.scrollBy({ left: direction * stepWidth(), behavior: "smooth" });
    // If the nudge pushes us past the halfway point, loop back once the smooth
    // scroll settles so it stays seamless.
    setTimeout(() => {
      if (track.scrollLeft >= halfWidth) {
        track.scrollLeft -= halfWidth;
      } else if (track.scrollLeft < 0) {
        track.scrollLeft += halfWidth;
      }
    }, 350);
  }

  prevBtn.addEventListener("click", () => nudge(-1));
  nextBtn.addEventListener("click", () => nudge(1));

  // Pause on hover/focus so people can read a caption without it sliding away.
  track.addEventListener("mouseenter", () => { isHovering = true; });
  track.addEventListener("mouseleave", () => { isHovering = false; });
  track.addEventListener("focusin", () => { isHovering = true; });
  track.addEventListener("focusout", () => { isHovering = false; });
});