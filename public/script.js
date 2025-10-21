document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const WHATSAPP_NUMBER = "1234567890";
    const MOBILE_BREAKPOINT = 768;

    // --- ELEMENT SELECTORS ---
    const loader = document.getElementById('loader');
    const header = document.getElementById('header');
    const hamburgerButton = document.getElementById('hamburger-button');
    const closeButton = document.getElementById('close-button');
    const mobileNav = document.getElementById('mobile-nav');
    const inventoryContainer = document.getElementById('car-inventory-container');
    const carGallery = document.getElementById('car-gallery');
    const featuredCarsWrapper = document.getElementById('featured-cars-wrapper');
    const whatsappFloat = document.getElementById('whatsapp-float');
    const modalOverlay = document.getElementById('modal-overlay');
    const searchInput = document.getElementById('search-input');
    const searchToggleButton = document.getElementById('search-toggle-btn');
    
    let allCars = [];
    let inventorySwiper = null;

    function init() {
        setupEventListeners();
        initAOS();
        fetchAndDisplayCars();
        setupFloatingWhatsApp();
        hideLoader();
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

        searchInput.addEventListener('input', handleSearch);
        modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
        carGallery.addEventListener('click', handleCardClick);
    }
    
    function handleResize() {
        // Debounce resize event for performance
        clearTimeout(window.resizedFinished);
        window.resizedFinished = setTimeout(() => {
            initInventoryView(allCars);
        }, 250);
    }

    function handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredCars = allCars.filter(car => 
            car.name.toLowerCase().includes(searchTerm) ||
            car.model.toLowerCase().includes(searchTerm) ||
            car.year.toString().includes(searchTerm)
        );
        populateCarGallery(filteredCars, searchTerm);
    }

    function handleCardClick(e) {
        const card = e.target.closest('.car-card');
        const isWhatsAppButton = e.target.closest('a');
        if (isWhatsAppButton) return;
        if (card && card.dataset.id) openModal(card.dataset.id);
    }
    
    async function fetchAndDisplayCars() {
        try {
            const response = await fetch('/api/get-cars');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allCars = await response.json();
            initInventoryView(allCars);
            const featured = allCars.filter(car => car.featured === true || car.featured === 'true');
            populateFeaturedCarousel(featured);
        } catch (error) {
            console.error("Failed to fetch cars:", error);
            carGallery.innerHTML = '<p class="error-text">Unable to display our inventory.</p>';
        }
    }

    function initInventoryView(cars) {
        if (window.innerWidth < MOBILE_BREAKPOINT) {
            inventoryContainer.classList.add('swiper');
            if (!inventorySwiper) {
                 inventorySwiper = new Swiper('.car-inventory-container', {
                    slidesPerView: 'auto',
                    spaceBetween: 15,
                    centeredSlides: true,
                    loop: cars.length > 2,
                    pagination: { el: '#inventory-swiper-pagination', clickable: true },
                });
            }
        } else {
            inventoryContainer.classList.remove('swiper');
            if (inventorySwiper) {
                inventorySwiper.destroy(true, true);
                inventorySwiper = null;
            }
        }
        populateCarGallery(cars);
    }

    function populateCarGallery(cars, searchTerm = '') {
        carGallery.innerHTML = '';
        if (cars.length === 0) {
            carGallery.innerHTML = `<p class="no-results-text">No vehicles found matching "${searchTerm}"</p>`;
            return;
        }
        cars.forEach(car => {
            const cardWrapper = document.createElement('div');
            // On mobile, each card needs to be a swiper-slide
            cardWrapper.className = inventorySwiper ? 'swiper-slide' : '';
            
            cardWrapper.innerHTML = `
                <div class="car-card" data-aos="fade-up" data-id="${car.id}">
                    <img src="${car.image_url}" alt="${car.name} ${car.model}" class="car-card-image">
                    <div class="car-card-status ${car.status.toLowerCase()}">${car.status}</div>
                    <div class="car-info">
                        <h3>${car.name} ${car.model}</h3>
                        <p class="year">${car.year}</p>
                        <p class="price">$${parseFloat(car.price).toLocaleString()}</p>
                        <div class="car-card-buttons">
                             <!-- CONDITIONAL BUTTONS: Controlled by CSS -->
                            <button class="btn btn-primary btn-details">Details</button>
                            <a href="${generateWhatsAppLink(car)}" class="btn btn-primary btn-inquire" target="_blank" rel="noopener noreferrer">
                                <i class="fab fa-whatsapp"></i> Inquire
                            </a>
                        </div>
                    </div>
                </div>
            `;
            carGallery.appendChild(cardWrapper);
        });

        if (inventorySwiper) {
            inventorySwiper.update();
        }
    }
    
    function populateFeaturedCarousel(featuredCars) {
        // ... (this function remains the same as previous version)
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
        // ... (this function remains the same as previous version)
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
                    <a href="${generateWhatsAppLink(car)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Contact via WhatsApp</a>
                </div>
            </div>
        `;
        modalOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
        document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    }
    
    function closeModal() {
        // ... (this function remains the same as previous version)
        modalOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    function generateWhatsAppLink(car) {
        const message = `Hello, I'm interested in the ${car.name} ${car.model} (${car.year}).`;
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    }
    
    function setupFloatingWhatsApp() {
        // ... (this function remains the same as previous version)
        if (!WHATSAPP_NUMBER || WHATSAPP_NUMBER === "1234567890") {
             console.warn("WhatsApp number is not configured in script.js.");
             whatsappFloat.style.display = 'none';
             return;
        }
        const defaultMessage = "Hello! I would like to inquire about your cars.";
        whatsappFloat.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(defaultMessage)}`;
    }
    
    init();
});