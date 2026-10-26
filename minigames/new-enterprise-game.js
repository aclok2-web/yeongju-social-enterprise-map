(function () {
  "use strict";
  const config = window.GAME_CONFIG;
  if (!config) return;

  document.documentElement.style.setProperty("--accent", config.color || "#2f7d61");
  const app = document.querySelector("#app");
  let round = 0;
  let score = 0;

  function button(label, className) {
    const node = document.createElement("button");
    node.type = "button";
    node.className = className || "";
    node.textContent = label;
    return node;
  }

  function renderIntro() {
    app.innerHTML = "";
    const card = document.createElement("main");
    card.className = "card intro";
    card.innerHTML = `<div class="icon">${config.icon}</div><p class="eyebrow">YEONGJU SOCIAL ENTERPRISE</p><h1>${config.title}</h1><p>${config.subtitle}</p><div class="value">${config.value}</div>`;
    const start = button("체험 시작 →", "primary");
    start.addEventListener("click", renderRound);
    card.appendChild(start);
    app.appendChild(card);
  }

  function renderRound() {
    const task = config.rounds[round];
    app.innerHTML = "";
    const card = document.createElement("main");
    card.className = "card";
    card.innerHTML = `<div class="top"><span>${config.icon} ${config.short}</span><strong>${round + 1} / ${config.rounds.length}</strong></div><div class="progress"><i style="width:${(round / config.rounds.length) * 100}%"></i></div><h1>${task.prompt}</h1><p class="hint">가장 알맞은 선택을 골라보세요.</p><div class="choices"></div><p class="feedback" aria-live="polite"></p>`;
    const choices = card.querySelector(".choices");
    const feedback = card.querySelector(".feedback");
    task.options.forEach((option, index) => {
      const choice = button(option, "choice");
      choice.addEventListener("click", () => {
        if (index !== task.answer) {
          choice.classList.add("wrong");
          feedback.textContent = "조금 아쉬워요. 사회적가치와 안전을 다시 생각해 보세요.";
          return;
        }
        score += 100;
        choice.classList.add("correct");
        choices.querySelectorAll("button").forEach((node) => { node.disabled = true; });
        feedback.textContent = task.feedback;
        const next = button(round + 1 === config.rounds.length ? "결과 보기" : "다음 단계", "primary");
        next.addEventListener("click", () => {
          round += 1;
          if (round === config.rounds.length) renderResult(); else renderRound();
        });
        card.appendChild(next);
      });
      choices.appendChild(choice);
    });
    app.appendChild(card);
  }

  function renderResult() {
    app.innerHTML = `<main class="card result open"><div class="icon">🏅</div><p class="eyebrow">EXPERIENCE COMPLETE</p><h1>${config.short} 체험 완료!</h1><p>${config.complete}</p><div class="score">가치점수 <strong id="finalScore">${score}</strong></div><button class="primary" id="again" type="button">다시 체험하기</button></main>`;
    document.querySelector("#again").addEventListener("click", () => { round = 0; score = 0; renderIntro(); });
  }

  renderIntro();
})();
