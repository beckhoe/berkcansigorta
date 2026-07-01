(function () {
  document.documentElement.classList.remove("no-js");

  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
      }
    });
  }

  const revealItems = document.querySelectorAll(".reveal, .story-scene");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, { threshold: 0.18 });

    revealItems.forEach((element) => {
      observer.observe(element);
    });
  } else {
    revealItems.forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  const motionScenes = document.querySelectorAll(".story-scene");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let motionFrame = 0;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function updateSceneMotion() {
    motionFrame = 0;

    if (reducedMotion.matches || !motionScenes.length) return;

    const viewportHeight = window.innerHeight || 1;

    motionScenes.forEach((scene) => {
      const rect = scene.getBoundingClientRect();

      if (rect.bottom < -120 || rect.top > viewportHeight + 120) return;

      const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);
      const wave = (progress - 0.5) * 2;
      const focus = 1 - Math.abs(wave);
      let backgroundX = Math.round(Math.sin(progress * Math.PI) * 12 + wave * 8);
      let backgroundY = Math.round(wave * -34);
      let backgroundScale = 1.06 + focus * 0.025;
      let backgroundTilt = wave * 0.08;
      let lightX = 78 + wave * 8;
      let lightY = 44 + (0.5 - progress) * 12;

      if (scene.classList.contains("health-scene")) {
        backgroundX = Math.round(wave * 8);
        backgroundY = Math.round(wave * -38);
        backgroundScale = 1.065 + focus * 0.025;
        backgroundTilt = wave * 0.06;
        lightX = 62 + wave * 6;
        lightY = 36 + progress * 18;
      } else if (scene.classList.contains("car-scene")) {
        backgroundX = Math.round(wave * -18);
        backgroundY = Math.round(wave * -24);
        backgroundScale = 1.07 + focus * 0.025;
        backgroundTilt = wave * -0.08;
        lightX = 70 - progress * 18;
        lightY = 48 + wave * 8;
      } else if (scene.classList.contains("home-scene")) {
        backgroundX = Math.round(wave * 12);
        backgroundY = Math.round(wave * -34);
        backgroundScale = 1.065 + focus * 0.025;
        backgroundTilt = wave * -0.05;
        lightX = 70 - wave * 4;
        lightY = 46 + progress * 8;
      } else if (scene.classList.contains("farm-scene")) {
        backgroundX = Math.round(wave * -16);
        backgroundY = Math.round(wave * -40);
        backgroundScale = 1.07 + focus * 0.03;
        backgroundTilt = wave * 0.08;
        lightX = 58 + wave * 14;
        lightY = 38 + progress * 18;
      }

      scene.style.setProperty("--scene-bg-x", backgroundX + "px");
      scene.style.setProperty("--scene-bg-y", backgroundY + "px");
      scene.style.setProperty("--scene-bg-scale", backgroundScale.toFixed(3));
      scene.style.setProperty("--scene-bg-tilt", backgroundTilt.toFixed(3) + "deg");
      scene.style.setProperty("--scene-light-x", clamp(lightX, 42, 88).toFixed(1) + "%");
      scene.style.setProperty("--scene-light-y", clamp(lightY, 28, 72).toFixed(1) + "%");
    });
  }

  function requestSceneMotion() {
    if (motionFrame || reducedMotion.matches) return;
    motionFrame = window.requestAnimationFrame(updateSceneMotion);
  }

  if (motionScenes.length && !reducedMotion.matches) {
    updateSceneMotion();
    window.addEventListener("scroll", requestSceneMotion, { passive: true });
    window.addEventListener("resize", requestSceneMotion);
  }

  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const status = document.querySelector("[data-form-status]");
  const typeSelect = document.querySelector("[data-type-select]");
  const params = new URLSearchParams(window.location.search);
  const selectedType = params.get("type");

  if (typeSelect && selectedType) {
    const options = Array.from(typeSelect.options);
    const match = options.find((option) => option.textContent.trim().toLowerCase() === selectedType.trim().toLowerCase());
    if (match) {
      typeSelect.value = match.value;
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const type = String(formData.get("type") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const submitButton = form.querySelector("button[type='submit']");
    const submitLabel = submitButton ? submitButton.innerHTML : "";
    const leadData = {
      type,
      name,
      phone,
      message,
      note: message,
      source: "berkcansigorta.com",
      createdAt: new Date().toISOString()
    };

    if (status) {
      status.className = "form-status";
      status.textContent = "Talebiniz kaydediliyor...";
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
      submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gönderiliyor';
    }

    try {
      await fetch("https://script.google.com/macros/s/AKfycbxEnm7UwTth16zy5wsBfhvTkRuZJsjI1nfrA83HjV_K-Wl0Uk2iXB3iM0anCs28FDVy/exec", {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(leadData)
      });

      form.reset();

      if (status) {
        status.className = "form-status is-success";
        status.textContent = "Talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.";
      }
    } catch (error) {
      if (status) {
        status.className = "form-status is-error";
        status.textContent = "Talep gönderilemedi. Lütfen tekrar deneyin veya telefonla ulaşın.";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
        submitButton.innerHTML = submitLabel;
      }
    }
  });
})();
