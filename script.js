/* ============================================
   aha.cd — Interactive Script
   Draggable CDs with momentum + Scroll Animations
   ============================================ */

(function () {
  'use strict';

  // ---------- Random rotation for CDs on load ----------
  function initCDRotations() {
    const cds = document.querySelectorAll('.draggable');
    cds.forEach((cd) => {
      const rotation = Math.random() * 30 - 15; // -15 to 15 degrees
      cd.style.setProperty('--cd-rotate', `${rotation}deg`);
    });
  }

  // ---------- Draggable CDs with momentum ----------
  function initDraggable() {
    const draggables = document.querySelectorAll('.draggable');

    draggables.forEach((cd) => {
      let isDragging = false;
      let startX, startY;
      let initialLeft, initialTop;
      let currentLeft, currentTop;
      let velocityX = 0, velocityY = 0;
      let lastX = 0, lastY = 0;
      let lastTime = 0;
      let animFrame = null;

      function onStart(e) {
        e.preventDefault();
        isDragging = true;
        cd.classList.add('dragging');

        // Cancel any ongoing momentum animation
        if (animFrame) {
          cancelAnimationFrame(animFrame);
          animFrame = null;
        }

        // Get current position
        const rect = cd.getBoundingClientRect();
        const parentRect = cd.parentElement.getBoundingClientRect();

        initialLeft = rect.left - parentRect.left;
        initialTop = rect.top - parentRect.top;
        currentLeft = initialLeft;
        currentTop = initialTop;

        // Set position to pixels (remove percentage positioning)
        cd.style.left = `${initialLeft}px`;
        cd.style.top = `${initialTop}px`;

        const point = e.touches ? e.touches[0] : e;
        startX = point.clientX;
        startY = point.clientY;
        lastX = startX;
        lastY = startY;
        lastTime = Date.now();
        velocityX = 0;
        velocityY = 0;

        // Bring to front
        bringToFront(cd);
      }

      function onMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        const point = e.touches ? e.touches[0] : e;
        const dx = point.clientX - startX;
        const dy = point.clientY - startY;

        currentLeft = initialLeft + dx;
        currentTop = initialTop + dy;

        cd.style.left = `${currentLeft}px`;
        cd.style.top = `${currentTop}px`;

        // Track velocity for momentum
        const now = Date.now();
        const dt = now - lastTime;
        if (dt > 0) {
          velocityX = (point.clientX - lastX) / dt * 16;
          velocityY = (point.clientY - lastY) / dt * 16;
        }
        lastX = point.clientX;
        lastY = point.clientY;
        lastTime = now;
      }

      function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        cd.classList.remove('dragging');

        // Apply momentum
        const friction = 0.92;
        const minVelocity = 0.3;

        function animateMomentum() {
          velocityX *= friction;
          velocityY *= friction;

          if (Math.abs(velocityX) < minVelocity && Math.abs(velocityY) < minVelocity) {
            animFrame = null;
            return;
          }

          currentLeft += velocityX;
          currentTop += velocityY;

          cd.style.left = `${currentLeft}px`;
          cd.style.top = `${currentTop}px`;

          animFrame = requestAnimationFrame(animateMomentum);
        }

        if (Math.abs(velocityX) > 1 || Math.abs(velocityY) > 1) {
          animFrame = requestAnimationFrame(animateMomentum);
        }
      }

      // Mouse events
      cd.addEventListener('mousedown', onStart);
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);

      // Touch events
      cd.addEventListener('touchstart', onStart, { passive: false });
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    });
  }

  // Keep track of z-index stacking
  let highestZ = 20;
  function bringToFront(el) {
    highestZ++;
    el.style.zIndex = highestZ;
  }

  // ---------- Scroll Animations ----------
  function initScrollAnimations() {
    const sections = document.querySelectorAll('.section-inner');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  // ---------- Smooth Navigation ----------
  function initSmoothNav() {
    const navLinks = document.querySelectorAll('.nav-links a, .nav-logo');

    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            const navHeight = document.querySelector('.nav').offsetHeight;
            const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({
              top: targetPos,
              behavior: 'smooth',
            });
          }
        }
      });
    });
  }

  // ---------- Nav shadow on scroll ----------
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 60) {
            nav.style.boxShadow = '0 2px 20px rgba(13, 59, 102, 0.06)';
          } else {
            nav.style.boxShadow = 'none';
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ---------- Hide scroll hint on scroll ----------
  function initScrollHint() {
    const hint = document.querySelector('.scroll-hint');
    if (!hint) return;

    let hidden = false;
    window.addEventListener('scroll', () => {
      if (!hidden && window.scrollY > 100) {
        hint.style.opacity = '0';
        hint.style.transition = 'opacity 0.5s ease';
        hidden = true;
      }
    });
  }

  // ---------- CD hover — speed up sheen rotation ----------
  function initHoverEffects() {
    const cds = document.querySelectorAll('.cd');
    cds.forEach((cd) => {
      const sheen = cd.querySelector('.cd-sheen');
      if (!sheen) return;

      cd.addEventListener('mouseenter', () => {
        sheen.style.animationDuration = '3s';
      });

      cd.addEventListener('mouseleave', () => {
        sheen.style.animationDuration = '12s';
      });
    });
  }

  // ---------- Mobile Sidebar ----------
  function initSidebar() {
    const burger = document.querySelector('.nav-burger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.querySelector('.sidebar-close');
    const sidebarLinks = document.querySelectorAll('.sidebar-links a');

    if (!burger || !sidebar) return;

    function openSidebar() {
      sidebar.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    burger.addEventListener('click', openSidebar);
    closeBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    sidebarLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        closeSidebar();
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            const navHeight = document.querySelector('.nav').offsetHeight;
            const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
            setTimeout(() => {
              window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }, 300);
          }
        }
      });
    });
  }

  // ---------- Init Everything ----------
  function init() {
    initCDRotations();
    initDraggable();
    initScrollAnimations();
    initSmoothNav();
    initNavScroll();
    initScrollHint();
    initHoverEffects();
    initSidebar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
