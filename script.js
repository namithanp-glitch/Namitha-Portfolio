/**
 * NAMITHA NP — LUXURY PORTFOLIO SCRIPT
 * Features: Typewriter, Canvas 3D/Ambient Mesh, Theme Switcher, Cursor, Mobile Navigation
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Theme Switcher (Dark / Light Mode)
  // --------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');

  // Load saved preference or default to dark mode
  const savedTheme = localStorage.getItem('namitha_theme') || 'dark';
  htmlRoot.setAttribute('data-theme', savedTheme);
  updateMetaTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('namitha_theme', newTheme);
      updateMetaTheme(newTheme);
    });
  }

  function updateMetaTheme(theme) {
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#08080D' : '#F8F9FD');
    }
  }

  // --------------------------------------------------------------------------
  // 2. Typewriter Effect
  // --------------------------------------------------------------------------
  const typingElement = document.getElementById('typing-text');
  if (typingElement) {
    const words = [
      'UI/UX Designer',
      'Frontend Developer',
      'CS Undergrad',
      'Creative Problem Solver',
      'Interactive Web Creator'
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeLoop() {
      const currentWord = words[wordIndex];

      if (isDeleting) {
        typingElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        typingElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 110;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        // Pause at end of word
        typingSpeed = 1800;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typingSpeed = 400;
      }

      setTimeout(typeLoop, typingSpeed);
    }

    typeLoop();
  }

  // --------------------------------------------------------------------------
  // 3. Navbar Scroll State & Mobile Navigation
  // --------------------------------------------------------------------------
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }, { passive: true });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile menu when a nav link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('open');
        navMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close mobile menu on Escape key press for keyboard accessibility
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileToggle.classList.contains('open')) {
        mobileToggle.classList.remove('open');
        navMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.focus();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 4. Custom Magnetic Cursor (Desktop Devices Only)
  // --------------------------------------------------------------------------
  const cursorDot = document.querySelector('.custom-cursor-dot');
  const cursorRing = document.querySelector('.custom-cursor-ring');

  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  if (!isCoarse && cursorDot && cursorRing) {
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    // Smooth lerp follower for the outer ring
    function renderCursor() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Add hover expansion on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, input, textarea, .hero-image-wrapper');
    hoverTargets.forEach((target) => {
      target.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      target.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // --------------------------------------------------------------------------
  // 5. Enhanced 3D Parallax & Ambient Canvas (Stage 7 Component)
  // --------------------------------------------------------------------------
  const canvas = document.getElementById('ambient-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initScene();
    });

    let mouse = { x: null, y: null, targetX: 0, targetY: 0, radius: 150 };
    let parallax = { x: 0, y: 0 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // Normalised coordinates (-0.5 to 0.5) for layered camera parallax
      mouse.targetX = (e.clientX / width - 0.5) * 20;
      mouse.targetY = (e.clientY / height - 0.5) * 20;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
      mouse.targetX = 0;
      mouse.targetY = 0;
    });

    let foregroundParticles = [];
    let backgroundStars = [];

    const fgCount = Math.min(Math.floor((width * height) / 22000), 55);
    const bgCount = Math.min(Math.floor((width * height) / 28000), 40);

    // Deep distant ambient stars
    class BackgroundStar {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.2 + 0.4;
        this.alpha = Math.random() * 0.4 + 0.1;
        this.twinkleSpeed = Math.random() * 0.015 + 0.005;
        this.color = Math.random() > 0.4 ? 'rgba(196, 181, 253,' : 'rgba(96, 165, 250,';
      }

      update() {
        if (!prefersReducedMotion) {
          this.alpha += Math.sin(Date.now() * this.twinkleSpeed) * 0.008;
          if (this.alpha < 0.08) this.alpha = 0.08;
          if (this.alpha > 0.55) this.alpha = 0.55;
        }
      }

      draw() {
        const renderX = this.x + parallax.x * 0.3;
        const renderY = this.y + parallax.y * 0.3;
        ctx.fillStyle = `${this.color} ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(renderX, renderY, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Interactive foreground constellation particles
    class ForegroundParticle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.55;
        this.speedY = (Math.random() - 0.5) * 0.55;
        this.color = Math.random() > 0.5 ? 'rgba(139, 92, 246,' : 'rgba(59, 130, 246,';
        this.alpha = Math.random() * 0.5 + 0.25;
      }

      update() {
        if (!prefersReducedMotion) {
          this.x += this.speedX;
          this.y += this.speedY;

          // Wrap edges
          if (this.x > width) this.x = 0;
          if (this.x < 0) this.x = width;
          if (this.y > height) this.y = 0;
          if (this.y < 0) this.y = height;

          // Mouse gravity interaction
          if (mouse.x !== null && mouse.y !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
              let force = (mouse.radius - dist) / mouse.radius;
              let dirX = (dx / dist) * force * 3.5;
              let dirY = (dy / dist) * force * 3.5;
              this.x -= dirX;
              this.y -= dirY;
            }
          }
        }
      }

      draw() {
        const renderX = this.x + parallax.x;
        const renderY = this.y + parallax.y;
        ctx.fillStyle = `${this.color} ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(renderX, renderY, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function initScene() {
      foregroundParticles = [];
      backgroundStars = [];
      for (let i = 0; i < bgCount; i++) {
        backgroundStars.push(new BackgroundStar());
      }
      for (let i = 0; i < fgCount; i++) {
        foregroundParticles.push(new ForegroundParticle());
      }
    }

    function connectForeground() {
      for (let a = 0; a < foregroundParticles.length; a++) {
        for (let b = a + 1; b < foregroundParticles.length; b++) {
          const pa = foregroundParticles[a];
          const pb = foregroundParticles[b];
          let dist = (pa.x - pb.x) ** 2 + (pa.y - pb.y) ** 2;
          if (dist < 115 * 115) {
            let opacity = 1 - Math.sqrt(dist) / 115;
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.16})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pa.x + parallax.x, pa.y + parallax.y);
            ctx.lineTo(pb.x + parallax.x, pb.y + parallax.y);
            ctx.stroke();
          }
        }
      }
    }

    function renderLoop() {
      ctx.clearRect(0, 0, width, height);

      // Smooth camera parallax easing
      if (!prefersReducedMotion) {
        parallax.x += (mouse.targetX - parallax.x) * 0.05;
        parallax.y += (mouse.targetY - parallax.y) * 0.05;
      }

      // Draw background layer
      backgroundStars.forEach((star) => {
        star.update();
        star.draw();
      });

      // Draw foreground interactive layer
      foregroundParticles.forEach((p) => {
        p.update();
        p.draw();
      });

      connectForeground();
      requestAnimationFrame(renderLoop);
    }

    initScene();
    renderLoop();
  }

  // --------------------------------------------------------------------------
  // 6. Scroll Reveal Observer
  // --------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach((el) => el.classList.add('revealed'));
  }

  // --------------------------------------------------------------------------
  // 7. Interactive 3D Tilt on Skill Cards (Desktop Only)
  // --------------------------------------------------------------------------
  const tiltCards = document.querySelectorAll('[data-tilt]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isCoarse && !prefersReducedMotion && tiltCards.length > 0) {
    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6; // Max 6 deg tilt
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  // --------------------------------------------------------------------------
  // 8. Active Nav Link Spy on Scroll
  // --------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const allNavLinks = document.querySelectorAll('.nav-link');

  if ('IntersectionObserver' in window && sections.length > 0) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          allNavLinks.forEach((link) => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      threshold: 0.35
    });

    sections.forEach((sec) => sectionObserver.observe(sec));
  }

  // --------------------------------------------------------------------------
  // 9. Contact Form Validation & Honest Submission Handling
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const formSubmitBtn = document.getElementById('form-submit-btn');
  const formStatus = document.getElementById('form-status');

  // Configuration for real backend form service (Formsubmit AJAX to Namitha's verified inbox)
  const FORM_SUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/namithanp36@gmail.com';
  const RECIPIENT_EMAIL = 'namithanp36@gmail.com';

  if (contactForm) {
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');

    const errorName = document.getElementById('error-name');
    const errorEmail = document.getElementById('error-email');
    const errorSubject = document.getElementById('error-subject');
    const errorMessage = document.getElementById('error-message');

    // Validation rules
    function validateField(input, errorElement, validatorFn, errorMsg) {
      const isValid = validatorFn(input.value.trim());
      if (!isValid) {
        input.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        if (errorElement) errorElement.textContent = errorMsg;
        return false;
      } else {
        input.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
        if (errorElement) errorElement.textContent = '';
        return true;
      }
    }

    const isNotEmpty = (val) => val.length > 0;
    const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const hasMinLength = (min) => (val) => val.length >= min;

    // Real-time blur validation
    nameInput?.addEventListener('blur', () => {
      validateField(nameInput, errorName, isNotEmpty, 'Please enter your full name.');
    });

    emailInput?.addEventListener('blur', () => {
      validateField(emailInput, errorEmail, isValidEmail, 'Please enter a valid email address.');
    });

    subjectInput?.addEventListener('blur', () => {
      validateField(subjectInput, errorSubject, isNotEmpty, 'Please enter a subject.');
    });

    messageInput?.addEventListener('blur', () => {
      validateField(messageInput, errorMessage, hasMinLength(10), 'Message should be at least 10 characters.');
    });

    // Form submit listener
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear previous status
      formStatus.className = 'form-status-alert';
      formStatus.innerHTML = '';

      const validName = validateField(nameInput, errorName, isNotEmpty, 'Please enter your full name.');
      const validEmail = validateField(emailInput, errorEmail, isValidEmail, 'Please enter a valid email address.');
      const validSubject = validateField(subjectInput, errorSubject, isNotEmpty, 'Please enter a subject.');
      const validMessage = validateField(messageInput, errorMessage, hasMinLength(10), 'Message should be at least 10 characters.');

      if (!validName || !validEmail || !validSubject || !validMessage) {
        showStatus('error', 'Please correct the highlighted errors above before submitting.');
        return;
      }

      // Pre-filled mailto URL for immediate access or error fallback
      const mailtoSubject = encodeURIComponent(`[Portfolio Inquiry] ${subjectInput.value.trim()}`);
      const mailtoBody = encodeURIComponent(
        `Hello Namitha,\n\nName: ${nameInput.value.trim()}\nEmail: ${emailInput.value.trim()}\nSubject: ${subjectInput.value.trim()}\n\nMessage:\n${messageInput.value.trim()}\n\n-- Sent via Namitha NP Portfolio`
      );
      const mailtoUrl = `mailto:${RECIPIENT_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`;

      // Submit via AJAX to email backend service
      try {
        setLoadingState(true);

        const payload = {
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          _subject: `[Portfolio Inquiry] ${subjectInput.value.trim()}`,
          message: messageInput.value.trim()
        };

        const response = await fetch(FORM_SUBMIT_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => null);

        if (response.ok && (data?.success === "true" || data?.success === true || response.status === 200)) {
          showStatus('success', '✓ Thank you! Your message has been sent successfully to Namitha NP. I will get back to you shortly.');
          contactForm.reset();
        } else {
          // Provide informative status and 1-click fallback link so the message is never lost
          showStatus(
            'error',
            `✕ Service message: ${data?.message || 'Unable to deliver message right now.'} You can dispatch it directly via email:
             <br><a href="${mailtoUrl}" class="status-action-link" target="_blank" rel="noopener noreferrer">📧 Send Directly via Email Client &rarr;</a>`
          );
        }
      } catch (err) {
        // Network or offline fallback
        showStatus(
          'error',
          `✕ Network connection issue. Click below to send your message directly via your email client:
           <br><a href="${mailtoUrl}" class="status-action-link" target="_blank" rel="noopener noreferrer">📧 Open in Email Client with Pre-filled Message &rarr;</a>`
        );
      } finally {
        setLoadingState(false);
      }
    });

    function setLoadingState(isLoading) {
      if (formSubmitBtn) {
        formSubmitBtn.disabled = isLoading;
        if (isLoading) {
          formSubmitBtn.classList.add('loading');
        } else {
          formSubmitBtn.classList.remove('loading');
        }
      }
    }

    function showStatus(type, htmlContent) {
      if (formStatus) {
        formStatus.className = `form-status-alert show status-${type}`;
        formStatus.innerHTML = htmlContent;
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 10. Copy Email to Clipboard
  // --------------------------------------------------------------------------
  const btnCopyEmail = document.getElementById('btn-copy-email');
  const copyTooltip = document.getElementById('copy-tooltip');
  const emailTextEl = document.getElementById('email-address-text');

  if (btnCopyEmail && copyTooltip && emailTextEl) {
    btnCopyEmail.addEventListener('click', async () => {
      const email = emailTextEl.textContent.trim();
      try {
        await navigator.clipboard.writeText(email);
        copyTooltip.textContent = 'Copied!';
        copyTooltip.style.opacity = '1';

        setTimeout(() => {
          copyTooltip.textContent = 'Copy';
          copyTooltip.style.opacity = '';
        }, 2200);
      } catch (err) {
        // Fallback for older browsers
        const tempInput = document.createElement('input');
        tempInput.value = email;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        copyTooltip.textContent = 'Copied!';
        copyTooltip.style.opacity = '1';
        setTimeout(() => {
          copyTooltip.textContent = 'Copy';
          copyTooltip.style.opacity = '';
        }, 2200);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 11. Back to Top Button Smooth Scroll
  // --------------------------------------------------------------------------
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // --------------------------------------------------------------------------
  // 12. Luxury Monogram Preloader Lifecycle (Stage 7 Component)
  // --------------------------------------------------------------------------
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const dismissPreloader = () => {
      if (!preloader.classList.contains('preloader-hidden')) {
        preloader.classList.add('preloader-hidden');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 700);
      }
    };

    // Smoothly dismiss once page finishes loading
    if (document.readyState === 'complete') {
      setTimeout(dismissPreloader, 400);
    } else {
      window.addEventListener('load', () => {
        setTimeout(dismissPreloader, 400);
      });
      // Safety timeout fallback (max 1.4 seconds) so user is never blocked
      setTimeout(dismissPreloader, 1400);
    }
  }

  // --------------------------------------------------------------------------
  // 13. Scroll Progress Bar (Stage 7 Component)
  // --------------------------------------------------------------------------
  const scrollProgressBar = document.getElementById('scroll-progress-bar');
  if (scrollProgressBar) {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      scrollProgressBar.style.width = `${progress.toFixed(2)}%`;
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
  }

  // --------------------------------------------------------------------------
  // 14. Interactive Spotlight Card Lighting (Stage 7 Component)
  // --------------------------------------------------------------------------
  const spotlightCards = document.querySelectorAll(
    '.spotlight-card, .project-card, .skill-category-card, .contact-card, .contact-form-card, .about-story-card, .timeline-card'
  );

  if (!isCoarse && !prefersReducedMotion && spotlightCards.length > 0) {
    spotlightCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--spotlight-x', `${x.toFixed(1)}px`);
        card.style.setProperty('--spotlight-y', `${y.toFixed(1)}px`);
      });
    });
  }
});
