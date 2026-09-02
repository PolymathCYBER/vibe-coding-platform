/* Öz Aksu Sıhhi Tesisat — ortak site davranışları (menü, scroll efektleri, form, vb.) */
(function () {
  "use strict";

  document.documentElement.classList.add("js-reveal");

  var header = document.querySelector(".header");
  var menuToggle = document.querySelector(".menu-toggle");
  var navList = document.querySelector(".nav-list");
  var navBackdrop = document.querySelector(".nav-backdrop");
  var backToTop = document.querySelector(".back-to-top");

  /* Yıl bilgisi */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Aktif menü linkini işaretle */
  var currentPage = (window.location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll(".nav-link").forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });

  /* Mobil menü aç/kapat */
  function closeMenu() {
    if (!menuToggle || !navList) return;
    menuToggle.setAttribute("aria-expanded", "false");
    navList.classList.remove("is-open");
    if (navBackdrop) navBackdrop.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function openMenu() {
    if (!menuToggle || !navList) return;
    menuToggle.setAttribute("aria-expanded", "true");
    navList.classList.add("is-open");
    if (navBackdrop) navBackdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  if (menuToggle && navList) {
    menuToggle.addEventListener("click", function () {
      var isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });

    navList.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    if (navBackdrop) navBackdrop.addEventListener("click", closeMenu);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* Header ve "yukarı çık" butonu için scroll durumu */
  var scrollTicking = false;
  function handleScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (backToTop) backToTop.classList.toggle("is-visible", y > 480);
    scrollTicking = false;
  }
  window.addEventListener("scroll", function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(handleScroll);
      scrollTicking = true;
    }
  });
  handleScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* Kaydırınca görünüme giren öğeler (data-reveal) */
  var revealTargets = document.querySelectorAll("[data-reveal]");
  if (revealTargets.length) {
    if ("IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      revealTargets.forEach(function (el) { revealObserver.observe(el); });
    } else {
      revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  /* Sayaç animasyonu (data-count) */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1400;
      var start = null;

      function step(timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = target % 1 === 0 ? Math.floor(eased * target) : (eased * target).toFixed(1);
        el.textContent = value + suffix;
        if (progress < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      var countObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach(function (el) { countObserver.observe(el); });
    } else {
      counters.forEach(function (el) {
        el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
      });
    }
  }

  /* SSS akordeon */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var question = item.querySelector(".faq-question");
    var answer = item.querySelector(".faq-answer");
    if (!question || !answer) return;

    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      document.querySelectorAll(".faq-item.is-open").forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove("is-open");
          openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
          openItem.querySelector(".faq-answer").style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove("is-open");
        question.setAttribute("aria-expanded", "false");
        answer.style.maxHeight = null;
      } else {
        item.classList.add("is-open");
        question.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  /* İletişim formu (istemci taraflı doğrulama + demo gönderim) */
  var contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    var successBox = contactForm.querySelector(".form-success");

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;

      contactForm.querySelectorAll("[required]").forEach(function (field) {
        var group = field.closest(".form-group");
        var value = field.value.trim();
        var fieldValid = value.length > 0;

        if (field.type === "email" && value) {
          fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
        if (field.type === "tel" && value) {
          fieldValid = value.replace(/[^0-9]/g, "").length >= 10;
        }

        if (group) group.classList.toggle("has-error", !fieldValid);
        if (!fieldValid) valid = false;
      });

      if (!valid) {
        var firstError = contactForm.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (firstError) firstError.focus();
        return;
      }

      if (successBox) {
        successBox.classList.add("is-visible");
        successBox.setAttribute("role", "status");
      }
      contactForm.reset();

      if (successBox) {
        successBox.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    contactForm.querySelectorAll("input, select, textarea").forEach(function (field) {
      field.addEventListener("input", function () {
        var group = field.closest(".form-group");
        if (group) group.classList.remove("has-error");
      });
    });
  }
})();
