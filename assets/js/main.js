/**
 * ALEXSANDRO MEDEIROS · CONSULTORIA IMOBILIÁRIA · CRECI 6469
 * Main Application Script · v1.0.0
 * Stack: Three.js ambient background + GSAP 3 / ScrollTrigger
 */

(function () {
  'use strict';

  // 1. Accessibility & Motion Preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 2. Three.js Ambient Particle Background (Gold & Wine Atmosphere)
  function initThreeBackground() {
    if (prefersReducedMotion) return;

    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // Check WebGL availability
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'low-power'
      });
    } catch (e) {
      console.warn('WebGL not supported, falling back to CSS background.');
      return;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    // Create subtle particles in brand gold & warm wine tones
    const particleCount = window.innerWidth < 768 ? 40 : 80;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Official gold: #cca848 (0.80, 0.66, 0.28) and wine glow: #753737 (0.46, 0.22, 0.22)
    const goldColor = new THREE.Color('#cca848');
    const wineColor = new THREE.Color('#753737');

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 800;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 800;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;

      const mixedColor = Math.random() > 0.4 ? goldColor : wineColor;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let animationFrameId;
    let isVisible = true;

    function renderParticles() {
      if (!isVisible) return;
      particles.rotation.y += 0.0004;
      particles.rotation.x += 0.0002;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(renderParticles);
    }

    renderParticles();

    // Pause when page is hidden (Frente 5: economiza bateria e CPU)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        isVisible = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        isVisible = true;
        renderParticles();
      }
    });

    // Resize Handler (debounced)
    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }, 150);
    });
  }

  // 3. GSAP 3 & ScrollTrigger Animations
  function initScrollAnimations() {
    if (prefersReducedMotion) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ limitCallbacks: true, syncInterval: 100 });

    // Subtle parallax on hero image
    const heroPhoto = document.querySelector('.hero-photo');
    if (heroPhoto && window.innerWidth >= 768) {
      gsap.to(heroPhoto, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5
        }
      });
    }

    // Scroll reveal for flow sections
    const flowCards = gsap.utils.toArray('.pillar-item, .step-card');
    flowCards.forEach(function (card) {
      gsap.from(card, {
        opacity: 0.6,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      });
    });

    // Refresh triggers after fonts and complete page load
    window.addEventListener('load', function () {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          ScrollTrigger.refresh();
        });
      } else {
        ScrollTrigger.refresh();
      }
    });

    let resizeDebounce;
    window.addEventListener('resize', function () {
      clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(function () {
        ScrollTrigger.refresh();
      }, 200);
    });
  }

  // 4. Initialize everything on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initThreeBackground();
      initScrollAnimations();
    });
  } else {
    initThreeBackground();
    initScrollAnimations();
  }
})();
