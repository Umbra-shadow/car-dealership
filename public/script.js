document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const WHATSAPP_NUMBER = "1234567890"; // Replace with your real WhatsApp number
    const DESKTOP_BREAKPOINT = 768; // The pixel width to switch between mobile and desktop views

    // --- ELEMENT SELECTORS ---
    const loader = document.getElementById('loader');
    const header = document.getElementById('header');
    const hamburgerButton = document.getElementById('hamburger-button');
    const closeButton = document.getElementById('close-button');
    const mobileNav = document.getElementById('mobile-nav');
    const carGalleryContainer = document.getElementById('car-gallery-container');
    const carGallery = document.getElementById('car-gallery');
    const featuredCarsWrapper = document.getElementById('featured-cars-wrapper');
    const whatsappFloat = document.getElementById('whatsapp-float');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const searchInput = document.getElementById('search-input');
    const searchToggleButton = document.getElementById('search-toggle-btn');
    
    // --- STATE ---
    let allCars = [];
    let inventorySwiper = null;

    // --- INITIALIZATION ---
    function init() {
        setupEventListeners();
        initAOS();
        fetchAndDisplayCars();
        setupFloatingWhatsApp();
        hideLoader();
        handleResize(); // Initial check
    }

    function hideLoader() {
        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.classList.add('loaded');
        }, 500);
    }
    
    function initAOS() {
        AOS.init({ duration: 800, once: true, offset: 50 });
    }

    function setupEventListeners() {
        window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));
        window.addEventListener('resize', handleResize);

        const toggleNav = (shouldOpen) => {
            mobileNav.classList.toggle('open', shouldOpen);
            document.body.classList.toggle('no-scroll', shouldOpen);
        };
        hamburgerButton.addEventListener('click', () => toggleNav(true));
        closeButton.addEventListener('click', () => toggleNav(false));
        document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', () => toggleNav(false)));

        searchToggleButton.addEventListener('click', () => {
            header.classList.toggle('search-active');
            if (header.classList.contains('search-active')) searchInput.focus();
        });

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredCars = allCars.filter(car => 
                car.name.toLowerCase().includes(searchTerm) ||
                car.model.toLowerCase().includes(searchTerm)
            );
            populateCarGallery(filteredCars, searchTerm);
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
        
        carGallery.addEventListener('click', (e) => {
            const card = e.target.closest('.car-card');
            if (e.target.closest('a.btn-inquire')) return;
            if (card && card.dataset.id) openModal(card.dataset.id);
        });
    }

    function setupFloatingWhatsApp() {
        if (!WHATSAPP_NUMBER || WHATSAPP_NUMBER === "1234567890") {
             console.warn("WhatsApp number is not configured in script.js.");
             whatsappFloat.style.display = 'none';
             return;
        }
        const defaultMessage = "Hello! I would like to inquire about your cars.";
        whatsappFloat.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(defaultMessage)}`;
    }

    // ### RESPONSIVE LOGIC FOR INVENTORY ###
    function handleResize() {
        const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
        if (isDesktop) {
            if (inventorySwiper) {
                inventorySwiper.destroy(true, true);
                inventorySwiper = null;
            }
            carGalleryContainer.classList.add('is-grid');
            carGalleryContainer.classList.remove('is-swiper');
            // Re-wrap cards for grid if they were swiper-slides
            carGallery.querySelectorAll('.car-card').forEach(card => card.classList.remove('swiper-slide'));
            carGallery.classList.remove('swiper-wrapper');

        } else {
            carGalleryContainer.classList.remove('is-grid');
            carGalleryContainer.classList.add('is-swiper');
            if (!inventorySwiper) {
                populateCarGallery(allCars); // Repopulate to ensure correct structure
            }
        }
    }

    async function fetchAndDisplayCars() {
        try {
            const response = await fetch('/api/get-cars');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allCars = await response.json();
            populateCarGallery(allCars);
            const featured = allCars.filter(car => car.featured === true || car.featured === 'true');
            populateFeaturedCarousel(featured);
        } catch (error) {
            console.error("Failed to fetch cars:", error);
            carGallery.innerHTML = '<p class="error-text">Unable to display inventory. Please try again later.</p>';
        }
    }

    function populateCarGallery(cars, searchTerm = '') {
        const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
        carGallery.innerHTML = '';

        if (cars.length === 0) {
            const message = searchTerm ? `No vehicles found matching "${searchTerm}"` : 'No vehicles currently available.';
            carGallery.innerHTML = `<p class="no-results-text">${message}</p>`;
            return;
        }

        cars.forEach(car => {
            const card = document.createElement('div');
            card.className = 'car-card';
            if (!isDesktop) card.classList.add('swiper-slide'); // Add swiper class only on mobile
            card.setAttribute('data-aos', 'fade-up');
            card.dataset.id = car.id;
            card.innerHTML = `
                <img src="${car.image_url}" alt="${car.name} ${car.model}" class="car-card-image">
                <div class="car-card-status ${car.status.toLowerCase()}">${car.status}</div>
                <div class="car-info">
                    <h3>${car.name} ${car.model}</h3>
                    <p class="year">${car.year}</p>
                    <p class="price">$${parseFloat(car.price).toLocaleString()}</p>
                    <div class="car-card-buttons">
                        <!-- ### ADAPTIVE BUTTONS ### -->
                        <button class="btn btn-secondary btn-details">Details</button>
                        <a href="${generateWhatsAppLink(car, 'inquire')}" class="btn btn-primary btn-inquire" target="_blank" rel="noopener noreferrer">Inquire</a>
                    </div>
                </div>
            `;
            carGallery.appendChild(card);
        });

        if (!isDesktop) {
            carGallery.classList.add('swiper-wrapper');
            if (inventorySwiper) inventorySwiper.update();
            else initInventorySwiper();
        } else {
            carGallery.classList.remove('swiper-wrapper');
        }
    }

    function initInventorySwiper() {
        if (inventorySwiper) return;
        inventorySwiper = new Swiper('#car-gallery', {
            slidesPerView: 'auto',
            spaceBetween: 16,
            grabCursor: true,
            freeMode: true,
        });
    }
    
    function populateFeaturedCarousel(featuredCars) {
        featuredCarsWrapper.innerHTML = '';
        featuredCars.forEach(car => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.style.backgroundImage = `url(${car.image_url})`;
            featuredCarsWrapper.appendChild(slide);
        });
        new Swiper('.featured-swiper', {
            effect: 'coverflow', grabCursor: true, centeredSlides: true, slidesPerView: 'auto',
            loop: featuredCars.length > 2, autoplay: { delay: 3000, disableOnInteraction: false },
            coverflowEffect: { rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: false },
            pagination: { el: '.swiper-pagination', clickable: true },
        });
    }
    
    function openModal(carId) {
        const car = allCars.find(c => c.id === carId);
        if (!car) return;
        modalContent.innerHTML = `
            <button class="modal-close-btn" id="modal-close-btn">&times;</button>
            <div class="modal-body">
                <img src="${car.image_url}" alt="${car.name} ${car.model}" class="modal-image">
                <div class="modal-details">
                    <h2>${car.name} ${car.model}</h2>
                    <p class="price">$${parseFloat(car.price).toLocaleString()}</p>
                    <p><strong>Year:</strong> ${car.year}</p>
                    <p><strong>Status:</strong> ${car.status}</p>
                    <p>${car.description || 'No additional details available.'}</p>
                    <a href="${generateWhatsAppLink(car, 'details')}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Contact via WhatsApp</a>
                </div>
            </div>
        `;
        modalOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
        document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    }
    
    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    function generateWhatsAppLink(car, context) {
        const message = `Hello, I'm interested in the ${car.name} ${car.model} (${car.year}).`;
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    }
    
    init();
});