const header = document.querySelector(".site-header");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuPanel = document.querySelector("[data-menu-panel]");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
const trackedSections = Array.from(document.querySelectorAll("[data-section]"));
const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
const toast = document.querySelector("[data-toast]");
const yearTarget = document.querySelector("[data-current-year]");
const contactForm = document.querySelector("[data-contact-form]");
const repositoryGrid = document.querySelector("[data-repository-grid]");
const repositoryStatus = document.querySelector("[data-repository-status]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(pointer: fine)");

let toastTimer = null;

const repositoryFallback = [
  {
    name: "fjolla-medika",
    description:
      "Healthcare booking interface with clearer service structure, stronger treatment browsing, and a simpler path into appointment-focused pages.",
    tags: ["HTML", "CSS", "Healthcare UI"],
    repoUrl: "https://github.com/egzonkadrija/fjolla-medika",
    liveUrl: "https://fjollamedika.netlify.app/",
    language: "HTML",
    isFork: false,
  },
  {
    name: "premium-park-hotel",
    description:
      "Hospitality presentation work focused on premium pacing, calmer section rhythm, and a cleaner visual browsing flow on top of a public fork.",
    tags: ["HTML", "Hospitality", "Forked Base"],
    repoUrl: "https://github.com/egzonkadrija/premium-park-hotel",
    liveUrl: "https://premiumparkhotel.netlify.app/",
    language: "HTML",
    isFork: true,
  },
  {
    name: "portfolio-app",
    description:
      "Current single-page portfolio system rebuilt into a work-first layout with restrained motion, clearer hierarchy, and direct project proof.",
    tags: ["Portfolio", "UI System", "JavaScript"],
    repoUrl: "https://github.com/egzonkadrija/portfolio-app",
    liveUrl: "",
    language: "JavaScript",
    isFork: false,
  },
];

if (yearTarget) {
  yearTarget.textContent = String(new Date().getFullYear());
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character] || character;
  });
}

function formatNumber(value) {
  return new Intl.NumberFormat("en", {
    notation: value > 999 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatUpdatedDate(value) {
  if (!value) {
    return "Local highlight";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getFallbackRepositories() {
  return repositoryFallback.map((repository) => ({
    ...repository,
    stars: null,
    updatedAt: "",
  }));
}

function normalizeRepository(repository) {
  const fallback = repositoryFallback.find(
    (item) => item.name.toLowerCase() === repository.name.toLowerCase()
  );

  return {
    name: repository.name,
    description:
      fallback?.description ||
      repository.description ||
      "Public repository available for direct review from the portfolio.",
    tags:
      fallback?.tags ||
      [repository.language, repository.fork ? "Fork" : "Public repo", "GitHub"].filter(Boolean).slice(0, 3),
    repoUrl: repository.html_url,
    liveUrl: fallback?.liveUrl || repository.homepage || "",
    language: fallback?.language || repository.language || "Source",
    stars: Number(repository.stargazers_count || 0),
    updatedAt: repository.updated_at,
    isFork: Boolean(repository.fork),
  };
}

function createRepositoryCard(repository) {
  const starLabel =
    repository.stars === null
      ? "Curated"
      : `${formatNumber(repository.stars)} star${repository.stars === 1 ? "" : "s"}`;

  const linkItems = [];

  if (repository.liveUrl) {
    linkItems.push(
      `<a href="${escapeHtml(repository.liveUrl)}" class="text-link" target="_blank" rel="noreferrer">Live site</a>`
    );
  }

  linkItems.push(
    `<a href="${escapeHtml(repository.repoUrl)}" class="text-link" target="_blank" rel="noreferrer">Open repository</a>`
  );

  return `
    <article class="repository-card">
      <div class="repository-card-top">
        <p class="repository-kicker">${repository.isFork ? "Forked repository" : "Public repository"}</p>
        <h3>${escapeHtml(repository.name)}</h3>
      </div>
      <p class="repository-description">${escapeHtml(repository.description)}</p>
      <div class="repository-metrics">
        <span>${escapeHtml(repository.language)}</span>
        <span>${escapeHtml(starLabel)}</span>
        <span>Updated ${escapeHtml(formatUpdatedDate(repository.updatedAt))}</span>
      </div>
      <div class="repository-tags">
        ${repository.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
      </div>
      <div class="repository-links">
        ${linkItems.join("")}
      </div>
    </article>
  `;
}

function renderRepositories(repositories, statusMessage) {
  if (!repositoryGrid) {
    return;
  }

  repositoryGrid.innerHTML = repositories.map((repository) => createRepositoryCard(repository)).join("");

  if (repositoryStatus) {
    repositoryStatus.textContent = statusMessage;
  }
}

async function loadRepositories() {
  if (!repositoryGrid) {
    return;
  }

  renderRepositories(
    getFallbackRepositories(),
    "Showing curated repository highlights while the latest GitHub data loads."
  );

  try {
    const response = await fetch(
      "https://api.github.com/users/egzonkadrija/repos?sort=updated&per_page=6&type=owner",
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub request failed with status ${response.status}`);
    }

    const repositories = (await response.json())
      .filter((repository) => !repository.archived)
      .slice(0, 6)
      .map((repository) => normalizeRepository(repository));

    if (!repositories.length) {
      throw new Error("No public repositories returned.");
    }

    renderRepositories(
      repositories,
      `Showing ${repositories.length} recent public repositories from GitHub.`
    );
  } catch (error) {
    renderRepositories(getFallbackRepositories(), "Showing curated repository highlights.");
  }
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

  const scrollPosition = window.scrollY + 140;

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
      rootMargin: "0px 0px -40px 0px",
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
      const translateX = offsetX * 8;
      const translateY = offsetY * 8;
      item.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    });

    item.addEventListener("pointerleave", () => {
      item.style.transform = "translate3d(0, 0, 0)";
    });
  });
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
setupContactForm();
loadRepositories();
