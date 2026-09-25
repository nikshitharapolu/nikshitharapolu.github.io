const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}

/* Always begin at the top after refreshing */
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.addEventListener("pageshow", () => {
  const navigation =
    performance.getEntriesByType("navigation")[0];

  if (navigation?.type === "reload") {
    history.replaceState(
      null,
      "",
      `${location.pathname}${location.search}`
    );

    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto"
      });
    });
  }
});

/* Project tabs retained for the existing project structure */
const tabs = [
  ...document.querySelectorAll('[role="tab"]')
];

const panels = [
  ...document.querySelectorAll('[role="tabpanel"]')
];

function activateTab(tab) {
  tabs.forEach((item) => {
    item.setAttribute(
      "aria-selected",
      String(item === tab)
    );
  });

  panels.forEach((panel) => {
    const active =
      panel.id === tab.getAttribute("aria-controls");

    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    activateTab(tab);
  });

  tab.addEventListener("keydown", (event) => {
    const navigationKeys = [
      "ArrowDown",
      "ArrowRight",
      "ArrowUp",
      "ArrowLeft"
    ];

    if (!navigationKeys.includes(event.key)) {
      return;
    }

    event.preventDefault();

    const step = [
      "ArrowDown",
      "ArrowRight"
    ].includes(event.key)
      ? 1
      : -1;

    const next =
      tabs[
        (index + step + tabs.length) %
          tabs.length
      ];

    next.focus();
    activateTab(next);
  });
});

/* Scroll reveal animations */
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const revealItems = [
  ...document.querySelectorAll(".reveal")
];

if (
  reducedMotion ||
  !("IntersectionObserver" in window)
) {
  revealItems.forEach((item) => {
    item.classList.add("visible");
  });
} else {
  document.body.classList.add("reveal-ready");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.09
    }
  );

  revealItems.forEach((item, index) => {
    const delay =
      Math.min(index % 3, 2) * 70;

    item.style.transitionDelay = `${delay}ms`;
    revealObserver.observe(item);
  });
}

/* Compact navigation after scrolling */
const topbar =
  document.querySelector(".topbar");

function updateHeader() {
  topbar?.classList.toggle(
    "scrolled",
    window.scrollY > 20
  );
}

updateHeader();

window.addEventListener(
  "scroll",
  updateHeader,
  {
    passive: true
  }
);

/* Highlight only the section currently in view */
const navLinks = [
  ...document.querySelectorAll(
    '.topbar nav a[href^="#"]'
  )
];

const observedSections = navLinks
  .map((link) => {
    return document.querySelector(
      link.getAttribute("href")
    );
  })
  .filter(Boolean);

/* Nothing is selected while viewing the hero */
function clearActiveNavigation() {
  navLinks.forEach((link) => {
    link.classList.remove("active");
    link.removeAttribute("aria-current");
  });
}

function updateActiveNavigation(section) {
  navLinks.forEach((link) => {
    const matches =
      section &&
      link.getAttribute("href") ===
        `#${section.id}`;

    link.classList.toggle(
      "active",
      Boolean(matches)
    );

    if (matches) {
      link.setAttribute(
        "aria-current",
        "page"
      );
    } else {
      link.removeAttribute(
        "aria-current"
      );
    }
  });
}

clearActiveNavigation();

if ("IntersectionObserver" in window) {
  const visibleSections = new Map();

  const sectionObserver =
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.set(
              entry.target,
              entry.intersectionRatio
            );
          } else {
            visibleSections.delete(
              entry.target
            );
          }
        });

        const activeSection = [
          ...visibleSections.entries()
        ]
          .sort(
            (first, second) =>
              second[1] - first[1]
          )[0]?.[0];

        if (!activeSection) {
          clearActiveNavigation();
          return;
        }

        updateActiveNavigation(
          activeSection
        );
      },
      {
        rootMargin: "-30% 0px -58%",
        threshold: [0.05, 0.2, 0.5]
      }
    );

  observedSections.forEach((section) => {
    sectionObserver.observe(section);
  });
}

/* Interactive glow inside project cards */
if (
  window.matchMedia(
    "(pointer: fine)"
  ).matches
) {
  document
    .querySelectorAll(".project-card")
    .forEach((card) => {
      card.addEventListener(
        "pointermove",
        (event) => {
          const bounds =
            card.getBoundingClientRect();

          card.style.setProperty(
            "--mx",
            `${
              event.clientX -
              bounds.left
            }px`
          );

          card.style.setProperty(
            "--my",
            `${
              event.clientY -
              bounds.top
            }px`
          );
        }
      );
    });
}