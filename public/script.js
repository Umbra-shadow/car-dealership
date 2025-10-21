document.addEventListener('DOMContentLoaded', () => {
    const carGallery = document.getElementById('car-gallery');
    const header = document.querySelector('.header');
    
    // Change header background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Function to fetch car data from our serverless function
    async function fetchAndDisplayCars() {
        try {
            // The '/api/get-cars' URL works because Vercel automatically routes
            // requests from the frontend to the serverless function in the /api folder.
            const response = await fetch('/api/get-cars');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const cars = await response.json();

            // Clear the "Loading..." message
            carGallery.innerHTML = '';

            if (cars.length === 0) {
                carGallery.innerHTML = '<p>No cars currently available. Please check back later!</p>';
                return;
            }

            // Dynamically create a card for each car
            cars.forEach(car => {
                const whatsappNumber = "1234567890"; // Replace with your WhatsApp number or use env variable
                const message = `Hello, I'm interested in the ${car.name} ${car.model} priced at $${car.price}.`;
                const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

                const carCard = document.createElement('div');
                carCard.className = 'car-card';
                carCard.innerHTML = `
                    <img src="${car.image_url}" alt="${car.name} ${car.model}">
                    <div class="car-info">
                        <h3>${car.name} ${car.model}</h3>
                        <p class="year">${car.year}</p>
                        <p class="price">$${parseFloat(car.price).toLocaleString()}</p>
                        <a href="${whatsappLink}" class="btn" target="_blank" rel="noopener noreferrer">Contact via WhatsApp</a>
                    </div>
                `;
                carGallery.appendChild(carCard);
            });

        } catch (error) {
            console.error("Failed to fetch cars:", error);
            carGallery.innerHTML = '<p class="error-text">Sorry, we couldn\'t load the inventory. Please try again later.</p>';
        }
    }

    // Initial call to load the cars
    fetchAndDisplayCars();
});