/*
 * The page hop's direction. Cross-document view transitions (global.css) hop forward to the right and back to the
 * left: back when the browser goes back in history or the destination is higher up the site (/features/windows →
 * /features), forward otherwise. A classic script in <head> so `pagereveal` is heard before the first frame.
 */
(function () {
  var depth = function (url) {
    return new URL(url, location.href).pathname.split("/").filter(Boolean).length;
  };
  var direction = function (activation, from, to) {
    if (activation && activation.navigationType === "traverse" && activation.from && activation.entry) {
      return activation.entry.index < activation.from.index ? "back" : "forward";
    }
    return from && to && depth(to) < depth(from) ? "back" : "forward";
  };
  window.addEventListener("pageswap", function (e) {
    if (e.viewTransition && e.activation) e.viewTransition.types.add(direction(e.activation, location.href, e.activation.entry.url));
  });
  window.addEventListener("pagereveal", function (e) {
    var a = window.navigation && navigation.activation;
    if (e.viewTransition && a) e.viewTransition.types.add(direction(a, a.from && a.from.url, a.entry && a.entry.url));
  });
})();
