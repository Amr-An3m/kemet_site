/**
 * Main application initialization
 * Handles all interactive features: header scroll, mobile menu, portfolio filtering,
 * FAQ accordion, contact form, and scroll animations
 */
(function() {
  'use strict';

  // ============================================
  // DOM CACHE - Cache all frequently accessed elements
  // ============================================
  const domCache = {
    header: null,
    menuBtn: null,
    mobileMenu: null,
    menuIcon: null,
    mobileLinks: null,
    filterBtns: null,
    portfolioItems: null,
    faqQuestions: null,
    contactForm: null,
    aosElements: null
  };

  // ============================================
  // HEADER SCROLL EFFECT
  // ============================================
  const SCROLL_THRESHOLD = 50;
  let scrollTimeout = null;

  function initHeaderScroll() {
    domCache.header = document.querySelector('header');
    if (!domCache.header) return;

    function handleScroll() {
      // Throttle scroll events for better performance
      if (scrollTimeout) return;
      
      scrollTimeout = requestAnimationFrame(() => {
        const isScrolled = window.scrollY > SCROLL_THRESHOLD;
        domCache.header.classList.toggle('scrolled', isScrolled);
        scrollTimeout = null;
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // ============================================
  // MOBILE MENU TOGGLE
  // ============================================
  const MENU_ICONS = {
    open: 'x',
    closed: 'menu'
  };

  function initMobileMenu() {
    domCache.menuBtn = document.getElementById('menu-btn');
    domCache.mobileMenu = document.getElementById('mobile-menu');
    
    if (!domCache.menuBtn || !domCache.mobileMenu) return;

    domCache.menuIcon = domCache.menuBtn.querySelector('i');
    domCache.mobileLinks = domCache.mobileMenu.querySelectorAll('a');

    function toggleMenu() {
      const isOpen = domCache.mobileMenu.classList.toggle('open');
      const iconName = isOpen ? MENU_ICONS.open : MENU_ICONS.closed;
      
      domCache.menuIcon.setAttribute('data-lucide', iconName);
      lucide.createIcons();
    }

    function closeMenu() {
      domCache.mobileMenu.classList.remove('open');
      domCache.menuIcon.setAttribute('data-lucide', MENU_ICONS.closed);
      lucide.createIcons();
    }

    domCache.menuBtn.addEventListener('click', toggleMenu);
    
    // Close menu when clicking navigation links
    domCache.mobileLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // ============================================
  // PORTFOLIO FILTERING
  // ============================================
  const FILTER_ANIMATION_DURATION = 300;

  function initPortfolioFilter() {
    const filterContainer = document.querySelector('.filter-container');
    domCache.portfolioItems = document.querySelectorAll('.portfolio-item');
    
    // Validate required elements exist
    if (!filterContainer) {
      console.warn('Portfolio filter container not found');
      return;
    }
    
    if (!domCache.portfolioItems.length) {
      console.warn('No portfolio items found');
      return;
    }

    // Initialize all items as visible on page load
    domCache.portfolioItems.forEach(item => {
      item.classList.add('portfolio-item--visible');
      item.classList.remove('portfolio-item--hidden');
    });

    /**
     * Filter portfolio items based on selected category
     * @param {string} filterValue - The filter category to show ('all' or specific category)
     */
    function filterPortfolio(filterValue) {
      if (!filterValue) {
        console.error('Filter value is required');
        return;
      }

      // Update active button state
      const filterBtns = filterContainer.querySelectorAll('.filter-btn');
      filterBtns.forEach(btn => {
        const btnFilter = btn.getAttribute('data-filter');
        if (btnFilter === filterValue) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // Filter portfolio items with smooth animation
      domCache.portfolioItems.forEach((item, index) => {
        const category = item.getAttribute('data-category');
        const shouldShow = filterValue === 'all' || category === filterValue;
        
        // Use setTimeout to stagger animations slightly for better UX
        setTimeout(() => {
          if (shouldShow) {
            // Show item - remove all hidden states and add visible
            item.classList.remove('portfolio-item--hidden', 'portfolio-item--removed');
            requestAnimationFrame(() => {
              item.classList.add('portfolio-item--visible');
            });
          } else {
            // Hide item - start fade out animation
            item.classList.remove('portfolio-item--visible');
            item.classList.add('portfolio-item--hidden');
            
            // Remove from layout after transition completes
            setTimeout(() => {
              if (item.classList.contains('portfolio-item--hidden')) {
                item.classList.add('portfolio-item--removed');
              }
            }, FILTER_ANIMATION_DURATION);
          }
        }, index * 20); // Small delay for staggered effect
      });
    }

    // Use event delegation for better performance
    filterContainer.addEventListener('click', (event) => {
      const clickedBtn = event.target.closest('.filter-btn');
      
      if (!clickedBtn) return;
      
      event.preventDefault();
      
      const filterValue = clickedBtn.getAttribute('data-filter');
      
      if (!filterValue) {
        console.error('Filter button missing data-filter attribute');
        return;
      }

      // Prevent duplicate filtering if same button is clicked
      if (clickedBtn.classList.contains('active')) {
        return;
      }

      filterPortfolio(filterValue);
    });

    // Set initial filter state (show all items)
    const initialActiveBtn = filterContainer.querySelector('.filter-btn.active');
    if (initialActiveBtn) {
      const initialFilter = initialActiveBtn.getAttribute('data-filter');
      if (initialFilter) {
        filterPortfolio(initialFilter);
      }
    } else {
      // If no active button, default to 'all'
      filterPortfolio('all');
    }
  }

  // ============================================
  // FAQ ACCORDION
  // ============================================
  function initFAQAccordion() {
    domCache.faqQuestions = document.querySelectorAll('.faq-question');
    
    if (!domCache.faqQuestions.length) return;

    function toggleFAQItem(clickedItem) {
      const isActive = clickedItem.classList.contains('active');
      
      // Close all FAQ items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Open clicked item if it wasn't active
      if (!isActive) {
        clickedItem.classList.add('active');
      }
    }

    domCache.faqQuestions.forEach(question => {
      question.addEventListener('click', () => {
        toggleFAQItem(question.parentElement);
      });
    });
  }

  // ============================================
  // CONTACT FORM SUBMISSION
  // ============================================
  const FORM_SUBMIT_DELAY = 1500;
  const SUBMIT_BUTTON_SELECTOR = 'button[type="submit"]';

  function initContactForm() {
    domCache.contactForm = document.getElementById('contact-form');
    
    if (!domCache.contactForm) return;

    const submitBtn = domCache.contactForm.querySelector(SUBMIT_BUTTON_SELECTOR);
    if (!submitBtn) return;

    async function handleFormSubmit(event) {
      event.preventDefault();
      
      const originalContent = submitBtn.innerHTML;
      const originalDisabled = submitBtn.disabled;
      
      // Update button state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span style="display: flex; align-items: center; gap: 0.5rem;">
          <div class="spinner"></div>
          جاري الإرسال...
        </span>
      `;

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, FORM_SUBMIT_DELAY));
        
        // Show success message
        alert('تم إرسال رسالتك بنجاح! سيتواصل معك فريقنا خلال 24 ساعة.');
        
        // Reset form
        domCache.contactForm.reset();
      } catch (error) {
        console.error('Form submission error:', error);
        alert('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.');
      } finally {
        // Restore button state
        submitBtn.disabled = originalDisabled;
        submitBtn.innerHTML = originalContent;
      }
    }

    domCache.contactForm.addEventListener('submit', handleFormSubmit);
  }

  // ============================================
  // ANIMATE ON SCROLL (AOS)
  // ============================================
  const AOS_THRESHOLD = 0.1;

  function initScrollAnimations() {
    domCache.aosElements = document.querySelectorAll('[data-aos]');
    
    if (!domCache.aosElements.length) return;

    const observerOptions = {
      threshold: AOS_THRESHOLD,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          // Optional: Unobserve after animation to improve performance
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    domCache.aosElements.forEach(element => {
      observer.observe(element);
    });
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize all modules
    initHeaderScroll();
    initMobileMenu();
    initPortfolioFilter();
    initFAQAccordion();
    initContactForm();
    initScrollAnimations();

    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // Start initialization
  init();
})();
