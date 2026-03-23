const header = document.querySelector(".site-header");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuPanel = document.querySelector("[data-menu-panel]");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
const trackedSections = Array.from(document.querySelectorAll("[data-section]"));
const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
const projectTriggers = Array.from(document.querySelectorAll("[data-project-trigger]"));
const toast = document.querySelector("[data-toast]");
const yearTarget = document.querySelector("[data-current-year]");
const contactForm = document.querySelector("[data-contact-form]");
const projectImageTarget = document.querySelector("[data-project-image-target]");
const projectLabelTarget = document.querySelector("[data-project-label-target]");
const projectTitleTarget = document.querySelector("[data-project-title-target]");
const projectRoleTarget = document.querySelector("[data-project-role-target]");
const projectSummaryTarget = document.querySelector("[data-project-summary-target]");
const projectTagsTarget = document.querySelector("[data-project-tags-target]");
const projectLiveTarget = document.querySelector("[data-project-live-target]");
const projectCodeTarget = document.querySelector("[data-project-code-target]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(pointer: fine)");

let toastTimer = null;

if (yearTarget) {
  yearTarget.textContent = String(new Date().getFullYear());
}

function setHeaderState() {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function closeMenu() {
  if (!menuToggle || !menuPanel) {
    return;
  }

  menuToggle.setAttribute("aria-expanded", "false");
  menuPanel.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

function toggleMenu() {
  if (!menuToggle || !menuPanel) {
    return;
  }

  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuPanel.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
}

function setActiveNav() {
  if (!trackedSections.length || !navLinks.length) {
    return;
  }

  const scrollPosition = window.scrollY + 160;

  trackedSections.forEach((section) => {
    const id = section.getAttribute("id");

    if (!id) {
      return;
    }

    const isActive =
      scrollPosition >= section.offsetTop &&
      scrollPosition < section.offsetTop + section.offsetHeight;

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}` && isActive);
    });
  });
}

function showToast(message) {
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2400);
}

function setupRevealObserver() {
  if (!revealItems.length) {
    return;
  }

  revealItems.forEach((item) => {
    const stagger = Number(item.dataset.stagger || 0);
    item.style.transitionDelay = `${stagger * 90}ms`;
  });

  if (reduceMotion.matches) {
    revealItems.forEach((item) => item.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -48px 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function setupPosterParallax() {
  if (!parallaxItems.length || reduceMotion.matches || !finePointer.matches) {
    return;
  }

  parallaxItems.forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
      const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
      const translateX = offsetX * 10;
      const translateY = offsetY * 10;
      item.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    });

    item.addEventListener("pointerleave", () => {
      item.style.transform = "translate3d(0, 0, 0)";
    });
  });
}

function replaceProjectTags(tags) {
  if (!projectTagsTarget) {
    return;
  }

  projectTagsTarget.innerHTML = "";

  tags
    .split("|")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .forEach((tag) => {
      const span = document.createElement("span");
      span.textContent = tag;
      projectTagsTarget.append(span);
    });
}

function updateProjectPreview(trigger) {
  if (!(trigger instanceof HTMLElement)) {
    return;
  }

  projectTriggers.forEach((item) => {
    const isActive = item === trigger;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  if (projectLabelTarget) {
    projectLabelTarget.textContent = trigger.dataset.projectLabel || "";
  }

  if (projectTitleTarget) {
    projectTitleTarget.textContent = trigger.dataset.projectTitle || "";
  }

  if (projectRoleTarget) {
    projectRoleTarget.textContent = trigger.dataset.projectRole || "";
  }

  if (projectSummaryTarget) {
    projectSummaryTarget.textContent = trigger.dataset.projectSummary || "";
  }

  if (projectImageTarget instanceof HTMLImageElement) {
    projectImageTarget.src = trigger.dataset.projectImage || "";
    projectImageTarget.alt = trigger.dataset.projectAlt || "";
  }

  replaceProjectTags(trigger.dataset.projectTags || "");

  if (projectLiveTarget instanceof HTMLAnchorElement) {
    const liveUrl = trigger.dataset.projectLive || "#";
    projectLiveTarget.href = liveUrl;
    projectLiveTarget.target = liveUrl.startsWith("#") ? "_self" : "_blank";
    projectLiveTarget.rel = liveUrl.startsWith("#") ? "" : "noreferrer";
  }

  if (projectCodeTarget instanceof HTMLAnchorElement) {
    projectCodeTarget.href = trigger.dataset.projectCode || "#";
  }
}

function setupProjectPreview() {
  if (!projectTriggers.length) {
    return;
  }

  projectTriggers.forEach((trigger) => {
    const activate = () => updateProjectPreview(trigger);

    trigger.addEventListener("mouseenter", activate);
    trigger.addEventListener("focus", activate);
    trigger.addEventListener("click", activate);
  });

  updateProjectPreview(projectTriggers[0]);
}

function setupContactForm() {
  if (!(contactForm instanceof HTMLFormElement)) {
    return;
  }

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      contactForm.reportValidity();
      return;
    }

    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nProject brief:\n${message}`
    );

    showToast("Opening your email client.");
    window.location.href = `mailto:egzon@oninova.net?subject=${subject}&body=${body}`;
  });
}

if (menuToggle) {
  menuToggle.addEventListener("click", toggleMenu);
}

if (menuPanel) {
  menuPanel.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement) || !target.classList.contains("nav-link")) {
      return;
    }

    closeMenu();
  });
}

window.addEventListener(
  "scroll",
  () => {
    setHeaderState();
    setActiveNav();
  },
  { passive: true }
);

document.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const copyEmail = target.closest("[data-copy-email]");

  if (!copyEmail) {
    return;
  }

  const email = copyEmail.getAttribute("data-copy-email");

  if (!email) {
    return;
  }

  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
    showToast(email);
    return;
  }

  navigator.clipboard
    .writeText(email)
    .then(() => {
      showToast("Email copied to clipboard.");
    })
    .catch(() => {
      showToast(email);
    });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

setHeaderState();
setActiveNav();
setupRevealObserver();
setupPosterParallax();
setupProjectPreview();
setupContactForm();
