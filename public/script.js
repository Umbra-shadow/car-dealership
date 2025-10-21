document.addEventListener('DOMContentLoaded', () => {
    const carGallery = document.getElementById('car-gallery');
    const header = document.querySelector('.header');
    const hamburgerButton = document.getElementById('hamburger-button');
    const closeButton = document.getElementById('close-button');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-link');
    const whatsappFloat = document.getElementById('whatsapp-float');
    
    // --- Header Scroll Effect ---
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // --- Mobile Navigation ---
    const toggleNav = () => mobileNav.classList.toggle('open');
    hamburgerButton.addEventListener('click', toggleNav);
    closeButton.addEventListener('click', toggleNav);
    mobileNavLinks.forEach(link => link.addEventListener('click', toggleNav));

    // --- Smooth Scrolling for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // --- Set WhatsApp Link ---
    const whatsappNumber = "1234567890"; // IMPORTANT: Replace with your actual WhatsApp number
    const defaultMessage = "Hello! I'm interested in learning more about your collection.";
    whatsappFloat.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

    // --- Intersection Observer for Scroll Animations ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Optional: Stop observing after it's visible
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    // Observe all elements with the class 'animate-on-scroll'
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // --- Fetch and Display Cars ---
    async function fetchAndDisplayCars() {
        try {
            const response = await fetch('/api/get-cars');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const cars = await response.json();
            carGallery.innerHTML = ''; // Clear loading message

            if (cars.length === 0) {
                carGallery.innerHTML = '<p class="loading-text">No vehicles currently available. Please check back soon.</p>';
                return;
            }

            cars.forEach(car => {
                const message = `Hello, I'm interested in the ${car.name} ${car.model} priced at $${parseFloat(car.price).toLocaleString()}.`;
                const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

                const carCard = document.createElement('div');
                carCard.className = 'car-card animate-on-scroll'; // Add animation class
                carCard.innerHTML = `
                    <img src="${car.image_url}" alt="${car.name} ${car.model}">
                    <div class="car-info">
                        <h3>${car.name} ${car.model}</h3>
                        <p class="year">${car.year}</p>
                        <p class="price">$${parseFloat(car.price).toLocaleString()}</p>
                        <a href="${whatsappLink}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Inquire on WhatsApp</a>
                    </div>
                `;
                carGallery.appendChild(carCard);
                observer.observe(carCard); // Make the new card animatable
            });

        } catch (error) {
            console.error("Failed to fetch cars:", error);
            carGallery.innerHTML = '<p class="error-text">We are currently unable to display our inventory. Please try again later.</p>';
        }
    }

    fetchAndDisplayCars();
});