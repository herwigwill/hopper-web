/**
 * Moving banners: the still shows first; the loop loads only once the banner is near the screen, plays while it's in
 * view and pauses when it isn't. Reduced motion and Save-Data keep the still. A page's own pause control can hold it:
 * set `data-hold` on the video and dispatch "banner:hold".
 */
export function initBanner(video: HTMLVideoElement) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  if (saveData) return;

  let inView = false;
  const sync = () => {
    if (inView && !motion.matches && !video.hasAttribute("data-hold") && document.visibilityState === "visible") {
      if (!video.src) video.src = video.dataset.src!;
      video.play().catch(() => {});
    } else if (video.src) {
      video.pause();
    }
    if (motion.matches) video.classList.remove("is-playing");
  };

  video.addEventListener("playing", () => video.classList.add("is-playing"));
  video.addEventListener("banner:hold", sync);
  motion.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      sync();
    },
    { rootMargin: "200px 0px" },
  ).observe(video);
}
