(function () {
  "use strict";
  const script = document.currentScript;
  const businessId = Number(script && script.dataset.businessId);
  let reported = false;

  function visible(element) {
    if (!element) return false;
    const style = getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
  }

  function findResult() {
    const candidates = [
      document.querySelector(".result.open"),
      document.querySelector("#resultModal.open"),
      document.querySelector("[id*='result'][class*='open']")
    ];
    return candidates.find(visible);
  }

  function reportCompletion() {
    if (reported || !businessId || !findResult()) return;
    reported = true;
    const scoreNode = document.querySelector("#finalScore, #score");
    window.parent.postMessage({
      type: "yeongju-enterprise-experience-complete",
      businessId,
      score: scoreNode ? scoreNode.textContent.trim() : ""
    }, "*");
  }

  new MutationObserver(reportCompletion).observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ["class", "style", "hidden"]
  });
  window.addEventListener("load", reportCompletion);
})();
