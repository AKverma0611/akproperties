import './style.css'
import { db } from './firebase-config.js';
import { collection, getDocs } from "firebase/firestore";

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// Add scroll reveal animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
        }
    });
}, observerOptions);

document.querySelectorAll('section, .glitch-separator').forEach(el => {
    el.classList.add('reveal-hidden');
    observer.observe(el);
});

// Smooth Scroll for "Discover Portfolio" and Nav Links
document.querySelectorAll('a[href^="#"], #discover-btn').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href') || '#listings';
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});


// State to hold fetched properties
let allProperties = [];

// Fetch Properties from Firestore
async function loadProperties() {
    const listingsContainer = document.getElementById('dynamic-listings');
    if (!listingsContainer) return;

    try {
        const querySnapshot = await getDocs(collection(db, "properties"));
        allProperties = [];
        listingsContainer.innerHTML = '';

        if (querySnapshot.empty) {
            listingsContainer.innerHTML = '<p class="no-listings">Portfolio is currently being curated. Check back soon.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            allProperties.push({ id: doc.id, ...doc.data() });
        });

        renderProperties(allProperties);

    } catch (error) {
        console.error("Error loading properties:", error);
        listingsContainer.innerHTML = '<p class="error-msg">Unable to load listings at this time.</p>';
    }
}

function renderProperties(properties) {
    const listingsContainer = document.getElementById('dynamic-listings');
    if (!listingsContainer) return;

    listingsContainer.innerHTML = '';

    properties.forEach(prop => {
        const card = document.createElement('div');
        card.className = 'property-card';
        card.innerHTML = `
            <div class="card-image">
                <img src="${prop.imageUrl}" alt="${prop.title}">
                <span class="card-badge">${prop.type}</span>
            </div>
            <div class="card-content">
                <h3>${prop.title}</h3>
                <p class="card-location">${prop.location}</p>
                <p class="card-desc">${prop.description || ''}</p>
                <div class="card-footer">
                    <span class="card-price">${prop.price}</span>
                    <button class="btn-arrow">↗</button>
                </div>
            </div>
        `;
        listingsContainer.appendChild(card);
    });
}

// Initial Load
loadProperties();


// Search Logic
const searchBtn = document.getElementById('search-btn');
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const type = document.getElementById('prop-type').value;
        const location = document.getElementById('prop-location').value;
        const price = document.getElementById('prop-price').value;

        searchBtn.innerHTML = 'Searching...';
        searchBtn.disabled = true;

        // Simulate search delay for effect
        setTimeout(() => {
            // Flexible filtering logic for manual inputs
            const results = allProperties.filter(p => {
                const searchType = (type || '').toLowerCase().trim();
                const searchLoc = (location || '').toLowerCase().trim();

                // Get property fields safely
                const pType = (p.type || '').toLowerCase();
                const pTitle = (p.title || '').toLowerCase();
                const pLocation = (p.location || '').toLowerCase();

                // Check matches
                // For Type input, we search both 'type' and 'title' to be helpful
                const matchType = searchType === '' || pType.includes(searchType) || pTitle.includes(searchType);

                const matchLoc = searchLoc === '' || pLocation.includes(searchLoc);

                return matchType && matchLoc;
            });

            const resultsContainer = document.getElementById('results-container');
            if (resultsContainer) {
                if (results.length > 0) {
                    // Render ALL results
                    const resultsHTML = results.map(p => `
                        <div class="results-card">
                            <img src="${p.imageUrl}" alt="${p.title}" class="result-image">
                            <div class="result-info">
                                <h3>${p.title}</h3>
                                <p>${p.location}</p>
                                <span class="result-price">${p.price}</span>
                                <div class="result-features">
                                    <span>${p.type}</span>
                                </div>
                                <div class="result-actions">
                                    <button class="btn-small btn-view">View Listing</button>
                                    <button class="btn-small btn-contact">Enquire</button>
                                </div>
                            </div>
                        </div>
                    `).join('');

                    resultsContainer.innerHTML = resultsHTML;
                } else {
                    resultsContainer.innerHTML = `
                        <div class="ui-card" style="text-align: center; padding: 2rem;">
                            <p>No exclusive properties found matching your criteria.</p>
                        </div>
                    `;
                }
            }

            searchBtn.innerHTML = 'Search Estates';
            searchBtn.disabled = false;
        }, 1000);
    });
}

// Newsletter Logic
const newsletterBtn = document.getElementById('newsletter-btn');
const newsletterInput = document.getElementById('newsletter-email');
const newsletterMsg = document.getElementById('newsletter-msg');

if (newsletterBtn) {
    newsletterBtn.addEventListener('click', () => {
        const email = newsletterInput.value;
        if (email && email.includes('@')) {
            newsletterMsg.textContent = 'Thank you for subscribing to our elite listings.';
            newsletterMsg.style.color = '#c5a059';
            newsletterMsg.style.display = 'block';
            newsletterInput.value = '';
        } else {
            newsletterMsg.textContent = 'Please enter a valid email address.';
            newsletterMsg.style.color = '#ff4d4d';
            newsletterMsg.style.display = 'block';
        }

        setTimeout(() => {
            newsletterMsg.style.display = 'none';
        }, 4000);
    });
}
