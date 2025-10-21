document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const WHATSAPP_NUMBER = "+254714239855"; // IMPORTANT: Replace with your WhatsApp number

    // --- ELEMENT SELECTORS ---
    const loader = document.getElementById('loader');
    const header = document.getElementById('header');
    const hamburgerButton = document.getElementById('hamburger-button');
    const closeButton = document.getElementById('close-button');
    const mobileNav = document.getElementById('mobile-nav');
    const carGallery = document.getElementById('car-gallery');
    const featuredCarsWrapper = document.getElementById('featured-cars-wrapper');
    const whatsappFloat = document.getElementById('whatsapp-float');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    
    // --- DATA ---
    let allCars = [];

    // --- INITIALIZATION ---
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
        }, 500); // Delay to ensure content is ready
    }
    
    function initAOS() {
        AOS.init({
            duration: 800,
            once: true,
            offset: 50,
        });
    }

    function setupEventListeners() {
        // Header scroll effect
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });

        // Mobile navigation toggle
        const toggleNav = () => mobileNav.classList.toggle('open');
        hamburgerButton.addEventListener('click', toggleNav);
        closeButton.addEventListener('click', toggleNav);
        document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', toggleNav));

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Modal close event
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    function setupFloatingWhatsApp() {
        const defaultMessage = "Hello! I would like to inquire about your cars.";
        whatsappFloat.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(defaultMessage)}`;
    }

    // --- API & DATA HANDLING ---
    async function fetchAndDisplayCars() {
        try {
            const response = await fetch('/api/get-cars');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allCars = await response.json();

            populateCarGallery(allCars);
            populateFeaturedCarousel(allCars.filter(car => car.featured));
        } catch (error) {
            console.error("Failed to fetch cars:", error);
            carGallery.innerHTML = '<p class="error-text">We are currently unable to display our inventory. Please try again later.</p>';
        }
    }

    // --- UI RENDERING ---
    function populateCarGallery(cars) {
        carGallery.innerHTML = ''; // Clear loading message
        if (cars.length === 0) {
            carGallery.innerHTML = '<p class="loading-text">No vehicles currently available. Please check back soon.</p>';
            return;
        }

        cars.forEach(car => {
            const carCard = document.createElement('div');
            carCard.className = 'car-card';
            carCard.setAttribute('data-aos', 'fade-up');
            carCard.innerHTML = `
                <img src="${car.image_url}" alt="${car.name} ${car.model}" class="car-card-image">
                <div class="car-card-status ${car.status.toLowerCase()}">${car.status}</div>
                <div class="car-info">
                    <h3>${car.name} ${car.model}</h3>
                    <p class="year">${car.year}</p>
                    <p class="price">$${parseFloat(car.price).toLocaleString()}</p>
                    <div class="car-card-buttons">
                        <button class="btn btn-secondary details-btn" data-id="${car.id}">Details</button>
                        <a href="${generateWhatsAppLink(car)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    </div>
                </div>
            `;
            carGallery.appendChild(carCard);
        });
        
        // Add event listeners to the new "Details" buttons
        carGallery.querySelectorAll('.details-btn').forEach(button => {
            button.addEventListener('click', () => openModal(button.dataset.id));
        });
    }
    
    function populateFeaturedCarousel(featuredCars) {
        featuredCarsWrapper.innerHTML = '';
        featuredCars.forEach(car => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.style.backgroundImage = `url(${car.image_url})`;
            // You can add content inside the slide if needed
            featuredCarsWrapper.appendChild(slide);
        });

        // Initialize SwiperJS
        new Swiper('.featured-swiper', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            loop: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            coverflowEffect: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: false,
            },
            pagination: {
                el: '.swiper-pagination',
            },
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
                    <a href="${generateWhatsAppLink(car)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Contact via WhatsApp</a>
                </div>
            </div>
        `;
        modalOverlay.classList.add('active');
        document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    }
    
    function closeModal() {
        modalOverlay.classList.remove('active');
    }

    // --- HELPERS ---
    function generateWhatsAppLink(car) {
        const message = `Hello, I'm interested in the ${car.name} ${car.model} (${car.year}) priced at $${parseFloat(car.price).toLocaleString()}.`;
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    }
    
    // --- START THE APP ---
    init();
});