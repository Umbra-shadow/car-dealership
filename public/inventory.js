document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const WHATSAPP_NUMBER = "1234567890"; // Replace with your real WhatsApp number

    // --- ELEMENT SELECTORS ---
    const loader = document.getElementById('loader');
    const header = document.getElementById('header');
    const hamburgerButton = document.getElementById('hamburger-button');
    const closeButton = document.getElementById('close-button');
    const mobileNav = document.getElementById('mobile-nav');
    const carGallery = document.getElementById('car-gallery');
    const whatsappFloat = document.getElementById('whatsapp-float');
    const modalOverlay = document.getElementById('modal-overlay');
    const searchInput = document.getElementById('search-input');
    
    let allCars = [];

    function init() {
        setupEventListeners();
        AOS.init({ duration: 800, once: true, offset: 50 });
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

    function setupEventListeners() {
        window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));

        const toggleNav = (shouldOpen) => {
            mobileNav.classList.toggle('open', shouldOpen);
            document.body.classList.toggle('no-scroll', shouldOpen);
        };
        hamburgerButton.addEventListener('click', () => toggleNav(true));
        closeButton.addEventListener('click', () => toggleNav(false));
        document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', () => toggleNav(false)));

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
            if (e.target.closest('.btn-primary')) return; // Ignore clicks on WhatsApp button
            if (card && card.dataset.id) openModal(card.dataset.id);
        });
    }

    function setupFloatingWhatsApp() {
        if (!WHATSAPP_NUMBER || WHATSAPP_NUMBER === "1234567890") {
             console.warn("WhatsApp number not configured.");
             whatsappFloat.style.display = 'none';
             return;
        }
        const defaultMessage = "Hello! I have a question about your inventory.";
        whatsappFloat.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(defaultMessage)}`;
    }

    async function fetchAndDisplayCars() {
        try {
            const response = await fetch('/api/get-cars');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allCars = await response.json();
            populateCarGallery(allCars);
        } catch (error) {
            console.error("Failed to fetch cars:", error);
            carGallery.innerHTML = '<p class="error-text">Unable to display inventory. Please try again later.</p>';
        }
    }

    function populateCarGallery(cars, searchTerm = '') {
        carGallery.innerHTML = '';
        if (cars.length === 0) {
            const message = searchTerm ? `No vehicles found matching "${searchTerm}"` : 'No vehicles currently available.';
            carGallery.innerHTML = `<p class="no-results-text">${message}</p>`;
            return;
        }

        cars.forEach(car => {
            const card = document.createElement('div');
            card.className = 'car-card';
            card.setAttribute('data-aos', 'fade-up');
            card.dataset.id = car.id;
            
            const buttonsHTML = `
                <div class="car-card-buttons">
                    <button class="btn btn-outline btn-details">Details</button>
                    <a href="${generateWhatsAppLink(car)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                </div>
            `;
            const mobileButtonHTML = `
                 <div class="car-card-buttons">
                    <a href="${generateWhatsAppLink(car)}" class="btn btn-primary btn-inquire" target="_blank" rel="noopener noreferrer">Inquire</a>
                </div>
            `;

            card.innerHTML = `
                <div class="car-card-image-wrapper">
                    <img src="${car.image_url}" alt="${car.name} ${car.model}" class="car-card-image">
                    <div class="car-card-status ${car.status.toLowerCase()}">${car.status}</div>
                </div>
                <div class="car-info">
                    <div class="car-info-main">
                        <div class="car-info-header">
                            <h3>${car.name}</h3>
                            <span class="year">${car.year}</span>
                        </div>
                        <p class="price">$${parseFloat(car.price).toLocaleString()}</p>
                    </div>
                    ${window.innerWidth >= 768 ? buttonsHTML : mobileButtonHTML}
                </div>
            `;
            carGallery.appendChild(card);
        });
    }
    
    function openModal(carId) {
        const car = allCars.find(c => c.id === carId);
        if (!car) return;
        const modalContent = document.getElementById('modal-content');
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
        const modalOverlay = document.getElementById('modal-overlay');
        modalOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    function generateWhatsAppLink(car) {
        const message = `Hello, I'm interested in the ${car.name} ${car.model} (${car.year}).`;
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    }
    
    init();
});