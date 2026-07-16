const brandProjects = [
  {
    title: "嘚米小屋",
    type: "餐饮品牌",
    files: [
      "brand-demi-all-01.jpg",
      "brand-demi-all-02.jpg",
      "brand-demi-all-03.jpg",
      "brand-demi-all-04.jpg",
      "brand-demi-all-05.jpg",
      "brand-demi-all-06.jpg",
      "brand-demi-all-07.jpg",
      "brand-demi-all-08.jpg",
      "brand-demi-all-09.jpg",
      "brand-demi-all-10.jpg",
      "brand-demi-all-11.jpg",
      "brand-demi-all-12.jpg",
    ],
  },
  {
    title: "艺百卉",
    type: "品牌视觉",
    files: [
      "brand-yibaihui-all-01.jpg",
      "brand-yibaihui-all-02.jpg",
      "brand-yibaihui-all-03.jpg",
      "brand-yibaihui-all-04.jpg",
      "brand-yibaihui-all-05.jpg",
      "brand-yibaihui-all-06.jpg",
      "brand-yibaihui-all-07.jpg",
      "brand-yibaihui-all-08.jpg",
      "brand-yibaihui-all-09.jpg",
      "brand-yibaihui-all-10.jpg",
      "brand-yibaihui-all-11.jpg",
      "brand-yibaihui-all-12.jpg",
    ],
  },
  {
    title: "脊米",
    type: "轻餐饮视觉",
    files: [
      "brand-jimi-all-01.jpg",
      "brand-jimi-all-02.jpg",
      "brand-jimi-all-03.jpg",
      "brand-jimi-all-04.jpg",
      "brand-jimi-all-05.jpg",
      "brand-jimi-all-06.jpg",
      "brand-jimi-all-07.jpg",
      "brand-jimi-all-08.jpg",
      "brand-jimi-all-09.jpg",
      "brand-jimi-all-10.jpg",
      "brand-jimi-all-11.jpg",
      "brand-jimi-all-12.jpg",
      "brand-jimi-all-13.jpg",
    ],
  },
  {
    title: "徐妈掌勺",
    type: "餐饮海报视觉",
    files: ["brand-xuma-main.jpg", "brand-xuma-sub.jpg"],
  },
];

function twoDigit(number) {
  return String(number).padStart(2, "0");
}

function brandFiles(project) {
  return project.files;
}

function renderBrandStacks() {
  const mount = document.querySelector("#brandStackList");
  if (!mount) return;

  mount.innerHTML = brandProjects.map((project, projectIndex) => {
    const files = brandFiles(project);
    const cards = files.map((file, imageIndex) => {
      const no = twoDigit(projectIndex + 1);
      const imageNo = twoDigit(imageIndex + 1);
      const stackOffset = Math.min(imageIndex, 9);
      return `
        <article class="brand-slide-card" style="--z:${imageIndex + 1}; --stack-offset:${stackOffset}">
          <div class="brand-card-index">
            <strong>${no}</strong>
            <b>${project.type}</b>
            <span>${project.title}</span>
            <em>${imageNo} / ${twoDigit(files.length)}</em>
          </div>
          <div class="brand-card-image">
            <img src="./assets/${file}" alt="${project.title}品牌素材${imageNo}" />
          </div>
        </article>
      `;
    }).join("");
    return `
      <section class="brand-group" style="--card-count:${files.length}" data-stack-index="${projectIndex}">
        <div class="brand-stage">${cards}</div>
      </section>
    `;
  }).join("");
}

renderBrandStacks();

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function interpolate(value, input, output) {
  if (value <= input[0]) return output[0];
  const lastIndex = input.length - 1;
  if (value >= input[lastIndex]) return output[lastIndex];

  for (let index = 0; index < lastIndex; index += 1) {
    const start = input[index];
    const end = input[index + 1];
    if (value >= start && value <= end) {
      const progress = (value - start) / Math.max(0.0001, end - start);
      return output[index] + (output[index + 1] - output[index]) * progress;
    }
  }

  return output[lastIndex];
}

function updateBrandStackMotion() {
  document.querySelectorAll(".brand-group").forEach((group) => {
    const stage = group.querySelector(".brand-stage");
    const cards = Array.from(group.querySelectorAll(".brand-slide-card"));
    if (!cards.length) return;

    const rect = group.getBoundingClientRect();
    const scrollDistance = Math.max(1, rect.height - window.innerHeight);
    const progress = clamp(-rect.top / scrollDistance, 0, 1);
    const stackIndex = Number(group.dataset.stackIndex || 0);
    const cardDelayStart = stackIndex === 0 ? 0 : 0.12;
    const cardWindow = 1 - cardDelayStart;
    const lastCardSettled = Math.max(0.01, cardDelayStart + ((cards.length - 1) / cards.length) * cardWindow);
    const resistancePoint = Math.min(0.97, lastCardSettled + 0.035);

    if (stage) {
      const stageStartY = stackIndex === 0 ? 0 : 26;
      let stageY = 0;
      let stageOpacity = stackIndex === 0 ? 1 : 0.25;

      if (stackIndex > 0 && progress < 0.085) {
        const intro = clamp(progress / 0.085, 0, 1);
        stageY = stageStartY * (1 - intro);
        stageOpacity = 0.25 + intro * 0.75;
      }

      if (progress > resistancePoint) {
        const exit = clamp((progress - resistancePoint) / Math.max(0.01, 1 - resistancePoint), 0, 1);
        stageY = -exit * 56;
        stageOpacity = 1 - exit * 0.92;
      }

      stage.style.opacity = String(stageOpacity);
      stage.style.transform = `translate3d(0, ${stageY}vh, 0)`;
    }

    cards.forEach((card, index) => {
      const targetScale = Math.max(0.88, 1 - (cards.length - 1 - index) * 0.012);
      const scale = 1 + (targetScale - 1) * progress;
      const enterStart = index === 0 ? 0 : cardDelayStart + Math.max(0, (index - 1) / cards.length) * cardWindow;
      const enterEnd = index === 0 ? 0.01 : cardDelayStart + (index / cards.length) * cardWindow;
      const visibleEnd = enterStart + (enterEnd - enterStart) * 0.28;
      const cardProgress = index === 0 ? 1 : clamp((progress - enterStart) / Math.max(0.01, enterEnd - enterStart), 0, 1);
      const opacity = index === 0 ? 1 : clamp((progress - enterStart) / Math.max(0.01, visibleEnd - enterStart), 0, 1);
      const y = index === 0 ? 0 : 980 * (1 - cardProgress) + index * 20 * cardProgress;
      const isVisible = opacity > 0.01;

      card.classList.toggle("is-visible", isVisible);
      card.style.opacity = String(opacity);
      card.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
    });
  });
}

let brandMotionFrame = null;

function requestBrandStackMotion() {
  if (brandMotionFrame !== null) return;
  brandMotionFrame = window.requestAnimationFrame(() => {
    brandMotionFrame = null;
    updateBrandStackMotion();
  });
}

window.addEventListener("scroll", requestBrandStackMotion, { passive: true });
window.addEventListener("resize", requestBrandStackMotion);
updateBrandStackMotion();

function updateFloatingNav() {
  const brand = document.querySelector("#brand");
  const trigger = brand;
  const triggerTop = trigger ? trigger.getBoundingClientRect().top + window.scrollY : Number.POSITIVE_INFINITY;
  document.body.classList.toggle("nav-project-active", window.scrollY + 84 >= triggerTop);

  const currentLabel = document.querySelector(".floating-current");
  const sections = [
    ["#home", "首页"],
    ["#brand", "品牌项目"],
    ["#packaging", "包装设计"],
    ["#poster", "海报"],
    ["#photo", "摄影"],
    ["#illustration", "插画"],
    ["#type", "字体练习"],
  ];
  let activeSelector = "#home";
  let activeLabel = "首页";
  for (let index = sections.length - 1; index >= 0; index -= 1) {
    const [selector, label] = sections[index];
    const section = document.querySelector(selector);
    if (section && section.getBoundingClientRect().top <= 120) {
      activeSelector = selector;
      activeLabel = label;
      break;
    }
  }
  if (currentLabel) currentLabel.textContent = activeLabel;

  document.querySelectorAll(".nav-pills a").forEach((link) => {
    const isActive = link.getAttribute("href") === activeSelector;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

window.addEventListener("scroll", updateFloatingNav, { passive: true });
window.addEventListener("resize", updateFloatingNav);
updateFloatingNav();

function syncHeroCoverHeight() {
  const hero = document.querySelector(".hero");
  const cover = document.querySelector(".hero-type");
  if (!hero || !cover) return;

  const coverBottom = cover.offsetTop + cover.offsetHeight;
  const safeBottomGap = 28;
  hero.style.height = `${Math.ceil(coverBottom + safeBottomGap)}px`;
}

window.addEventListener("load", syncHeroCoverHeight);
window.addEventListener("resize", syncHeroCoverHeight);
if ("ResizeObserver" in window) {
  new ResizeObserver(syncHeroCoverHeight).observe(document.querySelector(".hero-type"));
}
syncHeroCoverHeight();

function enhanceTiltedCards() {
  document.querySelectorAll(".masonry img").forEach((image) => {
    if (image.closest(".tilted-card-figure")) return;

    const figure = document.createElement("figure");
    figure.className = "tilted-card-figure";

    const inner = document.createElement("div");
    inner.className = "tilted-card-inner";

    image.classList.add("tilted-card-img");
    image.parentNode.insertBefore(figure, image);
    inner.appendChild(image);
    figure.appendChild(inner);

    figure.addEventListener("mousemove", (event) => {
      const rect = figure.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      const rotateY = ((offsetX - rect.width / 2) / (rect.width / 2)) * 10;
      const rotateX = ((offsetY - rect.height / 2) / (rect.height / 2)) * -10;

      inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    });

    figure.addEventListener("mouseleave", () => {
      inner.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    });
  });
}

enhanceTiltedCards();

function setupPortfolioLightbox() {
  const lightbox = document.querySelector(".lightbox");
  const lightboxImage = lightbox?.querySelector("img");
  const closeButton = document.querySelector(".lightbox-close");
  if (!lightbox || !lightboxImage) return;
  let lockedScrollY = 0;
  let previousScrollBehavior = "";

  function lockPageScroll() {
    lockedScrollY = window.scrollY;
    previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockPageScroll() {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo({ top: lockedScrollY, left: 0, behavior: "auto" });
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    });
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    const image =
      target.closest(".masonry img, .type-grid img, .brand-card-image img, .project-images img") ||
      target.closest(".tilted-card-figure")?.querySelector("img");
    if (!image) return;
    event.preventDefault();
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    lockPageScroll();
  });

  function closeLightbox() {
    if (!lightbox.classList.contains("open")) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.removeAttribute("src");
    unlockPageScroll();
  }

  closeButton?.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener("wheel", (event) => event.preventDefault(), { passive: false });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
  });
}

setupPortfolioLightbox();

const PROJECT_GROUP_ENTRY_PROGRESS = 0.08;
const PROJECT_CARD_DELAY_START = 0.12;
const PROJECT_PROGRESS_EPSILON = 0.002;

function setupProjectSideNavigation({
  sectionSelector,
  rootSelector,
  ariaLabel,
  shortNames,
  stopBeforeSelector = null,
}) {
  const brandSection = document.querySelector(sectionSelector);
  const projectRoot = document.querySelector(rootSelector);
  const stopBeforeSection = stopBeforeSelector ? document.querySelector(stopBeforeSelector) : null;
  if (!brandSection || !projectRoot) return;
  let groups = [];
  let sideNav = null;
  let updateFrame = null;

  function readGroups() {
    return Array.from(brandSection.querySelectorAll(".project-stack")).map((stack, index) => {
      const fullName = stack.querySelector(".project-top h3")?.textContent?.trim() || `项目 ${index + 1}`;
      return {
        stack,
        index,
        fullName,
        shortName: shortNames[fullName] || fullName,
        cardCount: stack.querySelectorAll(".project-card").length,
      };
    });
  }

  function scrollToGroup(group, cardIndex = 0) {
    const stackTop = group.stack.getBoundingClientRect().top + window.scrollY;
    const scrollRange = Math.max(1, group.stack.offsetHeight - window.innerHeight);
    const delayStart = group.index === 0 ? 0 : PROJECT_CARD_DELAY_START;
    const groupSettledProgress = group.index === 0 ? 0 : PROJECT_GROUP_ENTRY_PROGRESS;
    const targetProgress = cardIndex === 0
      ? groupSettledProgress
      : delayStart + (cardIndex / group.cardCount) * (1 - delayStart);

    window.scrollTo({
      top: Math.round(stackTop + scrollRange * targetProgress),
      behavior: "smooth",
    });
  }

  function buildNavigation() {
    groups = readGroups();
    if (!groups.length) return false;

    sideNav?.remove();
    sideNav = document.createElement("aside");
    sideNav.className = "brand-side-nav";
    sideNav.setAttribute("aria-label", ariaLabel);

    groups.forEach((group) => {
      const item = document.createElement("div");
      item.className = "brand-side-item";
      item.dataset.groupIndex = String(group.index);

      const label = document.createElement("button");
      label.type = "button";
      label.className = "brand-side-label";
      label.textContent = group.shortName;
      label.setAttribute("aria-label", `定位到${group.fullName}`);
      label.addEventListener("click", () => scrollToGroup(group));

      const progress = document.createElement("div");
      progress.className = "brand-side-progress";
      progress.setAttribute("aria-label", `${group.fullName}图片进度`);

      for (let cardIndex = 0; cardIndex < group.cardCount; cardIndex += 1) {
        const segment = document.createElement("button");
        segment.type = "button";
        segment.className = "brand-side-segment";
        segment.dataset.cardIndex = String(cardIndex);
        segment.setAttribute("aria-label", `${group.fullName}第 ${cardIndex + 1} 张`);
        segment.addEventListener("click", () => scrollToGroup(group, cardIndex));
        progress.appendChild(segment);
      }

      item.append(label, progress);
      sideNav.appendChild(item);
    });

    document.body.appendChild(sideNav);
    return true;
  }

  function getGroupProgress(group) {
    const stackTop = group.stack.getBoundingClientRect().top + window.scrollY;
    const scrollRange = Math.max(1, group.stack.offsetHeight - window.innerHeight);
    return Math.min(1, Math.max(0, (window.scrollY - stackTop) / scrollRange));
  }

  function updateNavigation() {
    updateFrame = null;
    if (!sideNav || !groups.length) return;

    const brandRect = brandSection.getBoundingClientRect();
    const brandTop = brandRect.top + window.scrollY;
    const hasReachedBrand = window.scrollY + 84 >= brandTop;
    const hasNotReachedNextSection = !stopBeforeSection || stopBeforeSection.getBoundingClientRect().top > 84;
    const isInBrandSection = hasReachedBrand && brandRect.bottom > 110 && hasNotReachedNextSection;
    sideNav.classList.toggle("is-visible", isInBrandSection);
    sideNav.setAttribute("aria-hidden", String(!isInBrandSection));
    sideNav.toggleAttribute("inert", !isInBrandSection);
    if (!isInBrandSection) return;

    const progresses = groups.map(getGroupProgress);
    let activeGroupIndex = 0;
    progresses.forEach((progress, index) => {
      const settledProgress = index === 0 ? 0 : PROJECT_GROUP_ENTRY_PROGRESS;
      if (progress + PROJECT_PROGRESS_EPSILON >= settledProgress) activeGroupIndex = index;
    });

    const activeStage = groups[activeGroupIndex]?.stack.querySelector(".project-stage");
    if (activeStage) {
      const stageRect = activeStage.getBoundingClientRect();
      const preferredLeft = stageRect.right + 14;
      const maximumLeft = window.innerWidth - sideNav.offsetWidth - 6;
      sideNav.style.left = `${Math.round(Math.min(preferredLeft, maximumLeft))}px`;
    }

    groups.forEach((group, groupIndex) => {
      const item = sideNav.querySelector(`[data-group-index="${groupIndex}"]`);
      if (!item) return;

      const isActive = groupIndex === activeGroupIndex;
      item.classList.toggle("is-active", isActive);
      const label = item.querySelector(".brand-side-label");
      label?.setAttribute("aria-current", isActive ? "true" : "false");

      const delayStart = groupIndex === 0 ? 0 : PROJECT_CARD_DELAY_START;
      const normalized = Math.min(
        1,
        Math.max(0, (progresses[groupIndex] - delayStart) / (1 - delayStart)),
      );
      const activeCardIndex = Math.min(
        group.cardCount - 1,
        Math.max(0, Math.floor((normalized + PROJECT_PROGRESS_EPSILON) * group.cardCount)),
      );

      item.querySelectorAll(".brand-side-segment").forEach((segment, cardIndex) => {
        const isComplete = groupIndex < activeGroupIndex || (isActive && cardIndex <= activeCardIndex);
        segment.classList.toggle("is-complete", isComplete);
        segment.classList.toggle("is-current", isActive && cardIndex === activeCardIndex);
      });
    });
  }

  function requestNavigationUpdate() {
    if (updateFrame !== null) return;
    updateFrame = window.requestAnimationFrame(updateNavigation);
  }

  function initialize() {
    if (!buildNavigation()) return false;
    requestNavigationUpdate();
    return true;
  }

  if (!initialize() && "MutationObserver" in window) {
    const observer = new MutationObserver(() => {
      if (!initialize()) return;
      observer.disconnect();
    });
    observer.observe(projectRoot, { childList: true, subtree: true });
  }

  window.addEventListener("scroll", requestNavigationUpdate, { passive: true });
  window.addEventListener("resize", requestNavigationUpdate);
}

setupProjectSideNavigation({
  sectionSelector: "#brand",
  rootSelector: "#root",
  ariaLabel: "品牌项目进度导航",
  stopBeforeSelector: "#packaging",
  shortNames: {
    "鸟剑居酒屋": "鸟剑",
    "嘚米小屋": "嘚米",
    "艺百卉": "艺百卉",
    "脊米": "脊米",
  },
});

setupProjectSideNavigation({
  sectionSelector: "#packaging",
  rootSelector: "#packagingRoot",
  ariaLabel: "包装项目进度导航",
  shortNames: {
    "果茶": "果茶",
    "香水": "香水",
  },
});

function setupProjectWheelPaging() {
  if (!window.matchMedia("(min-width: 768px)").matches) return;

  let wheelLocked = false;

  function getActiveStack() {
    const stacks = Array.from(document.querySelectorAll("#brand .project-stack, #packaging .project-stack"));
    return stacks.find((stack) => {
      const stage = stack.querySelector(".project-stage");
      if (!stage) return false;
      const stackRect = stack.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      return stackRect.top <= 96 && stackRect.bottom > 160 && stageRect.top >= 68 && stageRect.top <= 108;
    });
  }

  function getStackMilestones(stack) {
    const section = stack.closest("#brand, #packaging");
    const sectionStacks = Array.from(section?.querySelectorAll(".project-stack") || []);
    const stackIndex = Math.max(0, sectionStacks.indexOf(stack));
    const cardCount = Math.max(1, stack.querySelectorAll(".project-card").length);
    const delayStart = stackIndex === 0 ? 0 : PROJECT_CARD_DELAY_START;
    const milestones = [stackIndex === 0 ? 0 : PROJECT_GROUP_ENTRY_PROGRESS];

    for (let cardIndex = 1; cardIndex < cardCount; cardIndex += 1) {
      milestones.push(delayStart + (cardIndex / cardCount) * (1 - delayStart));
    }
    return milestones;
  }

  function getAdjacentStack(stack, direction) {
    const section = stack.closest("#brand, #packaging");
    const stacks = Array.from(section?.querySelectorAll(".project-stack") || []);
    const stackIndex = stacks.indexOf(stack);
    return stacks[stackIndex + direction] || null;
  }

  function getScrollTarget(stack, progress) {
    const stackTop = stack.getBoundingClientRect().top + window.scrollY;
    const scrollRange = Math.max(1, stack.offsetHeight - window.innerHeight);
    return Math.round(stackTop + scrollRange * progress);
  }

  window.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) < 8 || document.querySelector(".lightbox.open")) return;

    const stack = getActiveStack();
    if (!stack) return;

    if (wheelLocked) {
      event.preventDefault();
      return;
    }

    const stackTop = stack.getBoundingClientRect().top + window.scrollY;
    const scrollRange = Math.max(1, stack.offsetHeight - window.innerHeight);
    const progress = clamp((window.scrollY - stackTop) / scrollRange, 0, 1);
    const milestones = getStackMilestones(stack);
    const goingDown = event.deltaY > 0;
    let targetStack = stack;
    let targetProgress = goingDown
      ? milestones.find((milestone) => milestone > progress + 0.012)
      : [...milestones].reverse().find((milestone) => milestone < progress - 0.012);

    if (targetProgress === undefined) {
      targetStack = getAdjacentStack(stack, goingDown ? 1 : -1);
      if (!targetStack) return;

      const adjacentMilestones = getStackMilestones(targetStack);
      targetProgress = goingDown
        ? adjacentMilestones[0]
        : adjacentMilestones[adjacentMilestones.length - 1];
    }

    event.preventDefault();
    wheelLocked = true;
    window.scrollTo({
      top: getScrollTarget(targetStack, targetProgress),
      behavior: "smooth",
    });
    window.setTimeout(() => {
      wheelLocked = false;
    }, 460);
  }, { passive: false });
}

setupProjectWheelPaging();
