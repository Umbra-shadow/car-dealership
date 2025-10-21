Static Car Dealership Website with a Serverless API
This project is a modern, fast, and secure car dealership website built with HTML, CSS, and JavaScript. It features a "static" frontend that dynamically loads its car inventory from a serverless API, which in turn connects to a Neon PostgreSQL database.
This architecture is highly scalable, secure, and requires zero server maintenance. The car inventory is managed directly through the Neon database dashboard.
Live Demo: https://car-dealership-omega-ten.vercel.app/
Features
Dynamic Inventory: Car listings are fetched in real-time from a PostgreSQL database.
Serverless API: A Vercel Function acts as a secure middleman between the frontend and the database.
No-Backend Maintenance: No need to manage a traditional server or admin panel.
Fast & Secure: Static site hosting on Vercel's edge network ensures speed, while database credentials are never exposed to the browser.
Easy Content Management: Inventory is managed by running simple SQL commands in the Neon dashboard.
Responsive Design: A clean, modern UI that works perfectly on desktop and mobile devices.
Tech Stack
Frontend: HTML, CSS, Vanilla JavaScript
Database: Neon (Serverless PostgreSQL)
Hosting & Serverless Functions: Vercel
🚀 Setup and Deployment Guide
Follow these steps to set up and deploy your own version of this website.
Part 1: Neon Database Setup
This is where your car data will live.
Create a Neon Project:
Go to Neon, sign up, and create a new project.
Get Your Connection String:
On your project dashboard, find the Connection Details panel.
Copy the Connection String that starts with postgres://. Save this securely.
Create the cars Table:
Navigate to the SQL Editor in your Neon dashboard.
Copy the entire SQL command below, paste it into the editor, and click Run. This creates the necessary table with all the correct columns.
code
SQL
CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'Available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- This column is essential for sorting
);
(Optional) Add Sample Cars:
To test your site with some data, run this command in the SQL Editor:
code
SQL
INSERT INTO cars (name, model, year, price, description, image_url) VALUES
('Porsche', '911 GT3', 2023, 250000.00, 'A track-focused masterpiece.', 'https://i.imgur.com/qL4l11t.jpeg'),
('Ferrari', 'F8 Tributo', 2022, 350000.00, 'The pinnacle of Italian engineering.', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1964&auto=format&fit=crop');
Part 2: Deploying to Vercel
Push Code to GitHub:
Create a new repository on GitHub.
Upload the entire project folder (api/, public/, package.json) to this repository.
Import Project on Vercel:
Log in to Vercel with your GitHub account.
Click Add New... > Project.
Import your newly created GitHub repository. Vercel will automatically detect the correct settings.
Configure Environment Variables:
Before deploying, expand the Environment Variables section. This is the most important step for connecting to your database.
Add the following two variables:
Name	Value
DATABASE_URL	Paste the Neon connection string you saved from Part 1.
NEXT_PUBLIC_WHATSAPP_NUMBER	Your WhatsApp number (e.g., 1234567890).
Deploy:
Click the Deploy button. Vercel will build and deploy your website and serverless function.
Once complete, visit your new Vercel URL to see your live website!
🔧 How to Manage Your Car Inventory
There is no admin website. You manage your cars directly in the Neon SQL Editor.
How to Add a New Car
Upload Your Image:
Go to a free image host like Imgur.
Upload your car's photo.
Right-click on the uploaded image and select "Copy Image Address". You need the direct link that ends in .jpg, .png, etc.
Run the INSERT Command:
In the Neon SQL Editor, use the following template. Modify the values for your car and paste your direct image link.
code
SQL
INSERT INTO cars (name, model, year, price, description, image_url) VALUES
('Audi', 'R8', 2023, 185000.00, 'A stunning V10 supercar.', 'PASTE_YOUR_DIRECT_IMAGE_LINK_HERE');
Click Run. Your new car will appear on your website after you refresh.
How to Update a Car's Price
Use the UPDATE command. The WHERE clause is crucial to specify which car to change.
code
SQL
UPDATE cars 
SET price = 182500.00 
WHERE name = 'Audi' AND model = 'R8';
How to Remove a Car from the Website (Mark as Sold)
Instead of deleting the record, it's better to change its status. The website is configured to only show cars with a status of 'Available'.
code
SQL
UPDATE cars 
SET status = 'Sold' 
WHERE name = 'Audi' AND model = 'R8';```
The car will now be hidden from your live site.