/* ============================================
   Angel Hair Theme - Global JavaScript
   ============================================ */

// Utility Functions
const debounce = (fn, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
};

const throttle = (fn, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Fetch Configuration
const fetchConfig = (type = 'json') => {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': `application/${type}`
    }
  };
};

// Custom Elements Base Class
class AngelHairElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.init();
  }

  init() {
    // Override in child classes
  }

  emit(eventName, detail = {}) {
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      detail
    }));
  }
}

// Header Component
class StickyHeader extends AngelHairElement {
  init() {
    this.header = this;
    this.headerBounds = {};
    this.currentScrollTop = 0;
    this.preventReveal = false;

    this.onScrollHandler = this.onScroll.bind(this);
    window.addEventListener('scroll', this.onScrollHandler, false);

    this.createObserver();
  }

  createObserver() {
    const observer = new IntersectionObserver((entries) => {
      this.headerBounds = entries[0].intersectionRect;
      observer.disconnect();
    });

    observer.observe(this.header);
  }

  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
      requestAnimationFrame(this.hide.bind(this));
    } else if (scrollTop < this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
      if (!this.preventReveal) {
        requestAnimationFrame(this.reveal.bind(this));
      }
    } else if (scrollTop <= this.headerBounds.top) {
      requestAnimationFrame(this.reset.bind(this));
    }

    this.currentScrollTop = scrollTop;
  }

  hide() {
    this.header.classList.add('header--hidden', 'header--sticky');
  }

  reveal() {
    this.header.classList.add('header--sticky');
    this.header.classList.remove('header--hidden');
  }

  reset() {
    this.header.classList.remove('header--hidden', 'header--sticky');
  }
}
customElements.define('sticky-header', StickyHeader);

// Mobile Menu
class MobileMenu extends AngelHairElement {
  init() {
    this.toggle = this.querySelector('[data-menu-toggle]');
    this.menu = this.querySelector('[data-menu]');
    this.overlay = document.querySelector('[data-menu-overlay]');
    this.closeButton = this.querySelector('[data-menu-close]');

    if (this.toggle) {
      this.toggle.addEventListener('click', this.openMenu.bind(this));
    }

    if (this.closeButton) {
      this.closeButton.addEventListener('click', this.closeMenu.bind(this));
    }

    if (this.overlay) {
      this.overlay.addEventListener('click', this.closeMenu.bind(this));
    }

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeMenu();
    });
  }

  openMenu() {
    this.menu?.classList.add('is-open');
    this.overlay?.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  closeMenu() {
    this.menu?.classList.remove('is-open');
    this.overlay?.classList.remove('is-active');
    document.body.style.overflow = '';
  }
}
customElements.define('mobile-menu', MobileMenu);

// Quantity Selector
class QuantityInput extends AngelHairElement {
  init() {
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });

    this.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', this.onButtonClick.bind(this));
    });
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    const button = event.currentTarget;

    if (button.name === 'plus') {
      this.input.stepUp();
    } else {
      this.input.stepDown();
    }

    if (previousValue !== this.input.value) {
      this.input.dispatchEvent(this.changeEvent);
    }
  }
}
customElements.define('quantity-input', QuantityInput);

// Add to Cart Form
class ProductForm extends AngelHairElement {
  init() {
    this.form = this.querySelector('form');
    this.submitButton = this.querySelector('[type="submit"]');

    if (this.form) {
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    }
  }

  onSubmitHandler(event) {
    event.preventDefault();
    
    if (!this.submitButton || this.submitButton.disabled) return;

    const originalText = this.submitButton.innerHTML;
    this.submitButton.classList.add('button--loading');
    this.submitButton.disabled = true;
    this.submitButton.innerHTML = '<span>Adding...</span>';

    const formData = new FormData(this.form);
    
    // Convert FormData to URL encoded string for Shopify
    const body = new URLSearchParams();
    for (const [key, value] of formData) {
      body.append(key, value);
    }

    fetch(window.routes?.cart_add_url || '/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: body.toString()
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((response) => {
        if (response.status && response.status !== 200) {
          this.handleError(response.description || 'Error adding to cart');
          return;
        }
        this.handleSuccess(response);
      })
      .catch((error) => {
        console.error('Add to cart error:', error);
        this.handleError('Error adding to cart. Please try again.');
      })
      .finally(() => {
        this.submitButton.classList.remove('button--loading');
        this.submitButton.disabled = false;
        this.submitButton.innerHTML = originalText;
      });
  }

  handleSuccess(response) {
    // Update cart count
    this.updateCartCount();
    
    // Trigger Meta Pixel event
    if (typeof fbq !== 'undefined') {
      try {
        fbq('track', 'AddToCart', {
          content_ids: [response.variant_id || response.id],
          content_type: 'product',
          value: (response.price || response.final_price || 0) / 100,
          currency: 'USD'
        });
      } catch (e) {
        console.warn('Meta Pixel error:', e);
      }
    }

    // Add success state to button temporarily
    if (this.submitButton) {
      this.submitButton.classList.add('is-added');
      const originalText = this.submitButton.innerHTML;
      this.submitButton.innerHTML = '✓ Added!';
      setTimeout(() => {
        this.submitButton.classList.remove('is-added');
        this.submitButton.innerHTML = originalText;
      }, 1500);
    }
    
    // Open cart drawer - dispatch event for cart drawer to listen
    document.dispatchEvent(new CustomEvent('cart:add'));
    
    // Also try the global function
    if (typeof window.openCartDrawer === 'function') {
      window.openCartDrawer();
    }
  }

  handleError(message) {
    console.error('Cart error:', message);
    this.showNotification(message || 'Error adding to cart', 'error');
  }

  showNotification(message, type = 'success') {
    // Remove any existing notifications first
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="notification__close" onclick="this.parentElement.remove()">×</button>
    `;
    document.body.appendChild(notification);

    // Trigger animation
    requestAnimationFrame(() => {
      notification.classList.add('is-active');
    });

    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('is-active');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  updateCartCount() {
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        // Update all cart count elements
        const cartCounts = document.querySelectorAll('[data-cart-count]');
        cartCounts.forEach(el => {
          el.textContent = cart.item_count;
          el.classList.toggle('hidden', cart.item_count === 0);
        });
        
        // Update cart total if element exists
        const cartTotals = document.querySelectorAll('[data-cart-total]');
        cartTotals.forEach(el => {
          el.textContent = '$' + (cart.total_price / 100).toFixed(2);
        });
      })
      .catch(err => console.warn('Error updating cart count:', err));
  }
}
customElements.define('product-form', ProductForm);

// FAQ Accordion
class FaqAccordion extends AngelHairElement {
  init() {
    this.items = this.querySelectorAll('[data-accordion-item]');
    
    this.items.forEach(item => {
      const trigger = item.querySelector('[data-accordion-trigger]');
      trigger?.addEventListener('click', () => this.toggle(item));
    });
  }

  toggle(item) {
    const isOpen = item.classList.contains('is-open');
    
    // Close all items
    this.items.forEach(i => {
      i.classList.remove('is-open');
      const content = i.querySelector('[data-accordion-content]');
      if (content) content.style.maxHeight = null;
    });

    // Open clicked item if it was closed
    if (!isOpen) {
      item.classList.add('is-open');
      const content = item.querySelector('[data-accordion-content]');
      if (content) content.style.maxHeight = content.scrollHeight + 'px';
    }
  }
}
customElements.define('faq-accordion', FaqAccordion);

// Product Carousel (Swiper-like)
class ProductCarousel extends AngelHairElement {
  init() {
    this.track = this.querySelector('[data-carousel-track]');
    this.slides = this.querySelectorAll('[data-carousel-slide]');
    this.prevBtn = this.querySelector('[data-carousel-prev]');
    this.nextBtn = this.querySelector('[data-carousel-next]');
    this.dotsContainer = this.querySelector('[data-carousel-dots]');

    this.currentIndex = 0;
    this.slidesPerView = this.getSlidesPerView();
    this.totalSlides = this.slides.length;
    this.maxIndex = Math.max(0, this.totalSlides - this.slidesPerView);

    this.bindEvents();
    this.createDots();
    this.updateButtons();

    // Auto-play if enabled
    if (this.dataset.autoplay === 'true') {
      this.startAutoplay();
    }

    // Handle resize
    window.addEventListener('resize', debounce(() => {
      this.slidesPerView = this.getSlidesPerView();
      this.maxIndex = Math.max(0, this.totalSlides - this.slidesPerView);
      this.goTo(Math.min(this.currentIndex, this.maxIndex));
    }, 200));
  }

  getSlidesPerView() {
    const width = window.innerWidth;
    if (width < 576) return 1;
    if (width < 768) return 2;
    if (width < 1024) return 3;
    return parseInt(this.dataset.slidesPerView) || 4;
  }

  bindEvents() {
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());

    // Touch events
    let touchStartX = 0;
    let touchEndX = 0;

    this.track?.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.track?.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
    }, { passive: true });
  }

  handleSwipe(startX, endX) {
    const diff = startX - endX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  }

  prev() {
    this.goTo(this.currentIndex - 1);
  }

  next() {
    this.goTo(this.currentIndex + 1);
  }

  goTo(index) {
    this.currentIndex = Math.max(0, Math.min(index, this.maxIndex));
    const slideWidth = this.slides[0]?.offsetWidth || 0;
    const gap = parseInt(getComputedStyle(this.track).gap) || 0;
    const offset = this.currentIndex * (slideWidth + gap);
    
    this.track.style.transform = `translateX(-${offset}px)`;
    this.updateButtons();
    this.updateDots();
  }

  updateButtons() {
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentIndex === 0;
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentIndex >= this.maxIndex;
    }
  }

  createDots() {
    if (!this.dotsContainer || this.maxIndex < 1) return;

    for (let i = 0; i <= this.maxIndex; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => this.goTo(i));
      this.dotsContainer.appendChild(dot);
    }
    this.updateDots();
  }

  updateDots() {
    const dots = this.dotsContainer?.querySelectorAll('.carousel__dot');
    dots?.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === this.currentIndex);
    });
  }

  startAutoplay() {
    this.autoplayInterval = setInterval(() => {
      if (this.currentIndex >= this.maxIndex) {
        this.goTo(0);
      } else {
        this.next();
      }
    }, parseInt(this.dataset.autoplaySpeed) || 5000);

    // Pause on hover
    this.addEventListener('mouseenter', () => clearInterval(this.autoplayInterval));
    this.addEventListener('mouseleave', () => this.startAutoplay());
  }
}
customElements.define('product-carousel', ProductCarousel);

// Lazy Loading Images
class LazyImage extends AngelHairElement {
  init() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
            observer.unobserve(this);
          }
        });
      }, { rootMargin: '50px' });

      observer.observe(this);
    } else {
      this.loadImage();
    }
  }

  loadImage() {
    const img = this.querySelector('img');
    if (img && img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      img.classList.add('loaded');
    }
  }
}
customElements.define('lazy-image', LazyImage);

// Scroll Animations
const initScrollAnimations = () => {
  const elements = document.querySelectorAll('[data-animate]');
  const staggeredElements = document.querySelectorAll('[data-animate-stagger]');
  
  if ('IntersectionObserver' in window) {
    // Single element animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));

    // Staggered animations for groups
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          staggerObserver.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.15,
      rootMargin: '0px 0px -30px 0px'
    });

    staggeredElements.forEach(el => staggerObserver.observe(el));
  } else {
    elements.forEach(el => el.classList.add('is-visible'));
    staggeredElements.forEach(el => el.classList.add('is-visible'));
  }
};

// Smooth scroll for anchor links
const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
};

// Page load animations
const initPageLoadAnimations = () => {
  // Add loaded class to body for page transition
  document.body.classList.add('is-loaded');
  
  // Reveal hero content with stagger
  const heroElements = document.querySelectorAll('.hero-banner__content > *');
  heroElements.forEach((el, i) => {
    el.style.animationDelay = `${i * 0.1 + 0.3}s`;
    el.classList.add('animate-fade-up');
  });
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initSmoothScroll();
  
  // Small delay for page load animations
  requestAnimationFrame(() => {
    initPageLoadAnimations();
  });
});

// Cart Drawer (if using drawer cart)
class CartDrawer extends AngelHairElement {
  init() {
    this.overlay = document.querySelector('[data-cart-overlay]');
    
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-cart-toggle]')) {
        e.preventDefault();
        this.open();
      }
    });

    this.querySelector('[data-cart-close]')?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', () => this.close());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  open() {
    this.classList.add('is-open');
    this.overlay?.classList.add('is-active');
    document.body.style.overflow = 'hidden';
    this.fetchCart();
  }

  close() {
    this.classList.remove('is-open');
    this.overlay?.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  async fetchCart() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      this.renderCart(cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }

  renderCart(cart) {
    const cartContent = this.querySelector('[data-cart-content]');
    if (!cartContent) return;

    if (cart.item_count === 0) {
      cartContent.innerHTML = `
        <div class="empty-state">
          <p>Your cart is empty</p>
          <a href="/collections/all" class="button button--primary">Continue Shopping</a>
        </div>
      `;
      return;
    }

    // Render cart items
    cartContent.innerHTML = cart.items.map(item => `
      <div class="cart-item" data-key="${item.key}">
        <img src="${item.image}" alt="${item.title}" class="cart-item__image">
        <div class="cart-item__details">
          <h4 class="cart-item__title">${item.product_title}</h4>
          ${item.variant_title ? `<p class="cart-item__variant">${item.variant_title}</p>` : ''}
          <p class="cart-item__price">${this.formatMoney(item.final_line_price)}</p>
          <div class="cart-item__quantity">
            <quantity-input class="quantity-selector">
              <button type="button" name="minus">−</button>
              <input type="number" value="${item.quantity}" min="1" data-key="${item.key}">
              <button type="button" name="plus">+</button>
            </quantity-input>
          </div>
        </div>
        <button class="cart-item__remove" data-remove="${item.key}">×</button>
      </div>
    `).join('');

    // Add total
    const total = this.querySelector('[data-cart-total]');
    if (total) {
      total.textContent = this.formatMoney(cart.total_price);
    }
  }

  formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }
}
customElements.define('cart-drawer', CartDrawer);

// WhatsApp Button Click Tracking
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-whatsapp]')) {
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Contact', {
        content_name: 'WhatsApp Click'
      });
    }
  }
});

// Track View Content for products
if (document.body.classList.contains('template-product')) {
  const productData = document.querySelector('[data-product-json]');
  if (productData && typeof fbq !== 'undefined') {
    try {
      const product = JSON.parse(productData.textContent);
      fbq('track', 'ViewContent', {
        content_ids: [product.variants[0].id],
        content_type: 'product',
        content_name: product.title,
        value: product.price / 100,
        currency: 'USD'
      });
    } catch (e) {
      console.error('Error tracking ViewContent:', e);
    }
  }
}

