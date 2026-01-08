import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { uploadImageToCloudinary } from './cloudinary-service.js';

const loginForm = document.getElementById('login-form');
const dashboard = document.getElementById('dashboard');
const authSection = document.getElementById('auth-section');
const propertyForm = document.getElementById('property-form');
const propertyList = document.getElementById('property-list');

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        authSection.style.display = 'none';
        dashboard.style.display = 'block';
        fetchProperties();
    } else {
        authSection.style.display = 'flex';
        dashboard.style.display = 'none';
        // Auto-fill for demo purposes if needed, or remove for prod
    }
});

// Login Handler
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });
}

// Logout Handler
window.logout = () => {
    signOut(auth);
};

// Toggle Custom Category Input
const typeSelect = document.getElementById('prop-type');
const customTypeInput = document.getElementById('prop-type-custom');
if (typeSelect && customTypeInput) {
    typeSelect.addEventListener('change', () => {
        if (typeSelect.value === 'Other') {
            customTypeInput.style.display = 'block';
            customTypeInput.required = true;
        } else {
            customTypeInput.style.display = 'none';
            customTypeInput.required = false;
        }
    });
}

// Add Property Handler
if (propertyForm) {
    propertyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = propertyForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading Images...';

        try {
            const title = document.getElementById('prop-title').value;
            const location = document.getElementById('prop-location').value;
            const price = document.getElementById('prop-price').value;
            const typeSelect = document.getElementById('prop-type');
            const customTypeInput = document.getElementById('prop-type-custom');
            let type = typeSelect.value;

            if (type === 'Other') {
                type = customTypeInput.value;
                if (!type) throw new Error("Please enter a custom category");
            }

            const description = document.getElementById('prop-desc').value;
            const imageFiles = document.getElementById('prop-image').files;

            if (imageFiles.length === 0) throw new Error("Please select at least one image");

            // Upload Multiple Images
            const uploadPromises = Array.from(imageFiles).map(file => uploadImageToCloudinary(file));
            const imageUrls = await Promise.all(uploadPromises);

            // Backward compatibility: use the first image as the main one
            const mainImageUrl = imageUrls[0];

            // Save to Firestore
            await addDoc(collection(db, "properties"), {
                title,
                location,
                price,
                type,
                description,
                imageUrls, // Store all URLs
                imageUrl: mainImageUrl, // Keep for backward compatibility
                createdAt: serverTimestamp()
            });

            alert('Property added successfully!');
            propertyForm.reset();
            fetchProperties(); // Refresh list

        } catch (error) {
            console.error(error);
            alert('Error adding property: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Listing';
        }
    });
}

// Fetch and Display Properties
async function fetchProperties() {
    propertyList.innerHTML = '<p>Loading properties...</p>';

    try {
        const querySnapshot = await getDocs(collection(db, "properties"));
        propertyList.innerHTML = '';

        if (querySnapshot.empty) {
            propertyList.innerHTML = '<p>No properties found.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const prop = doc.data();
            const el = document.createElement('div');
            el.className = 'admin-prop-card';
            el.innerHTML = `
                <img src="${prop.imageUrl}" alt="${prop.title}">
                <div class="prop-info">
                    <h4>${prop.title}</h4>
                    <p>${prop.location} - ${prop.price}</p>
                    <span class="prop-type">${prop.type}</span>
                </div>
                <button onclick="deleteProperty('${doc.id}')" class="btn-delete">DELETE</button>
            `;
            propertyList.appendChild(el);
        });

    } catch (error) {
        console.error("Error fetching properties: ", error);
        propertyList.innerHTML = '<p>Error loading properties.</p>';
    }
}

// Delete Property
window.deleteProperty = async (id) => {
    if (confirm('Are you sure you want to delete this property?')) {
        try {
            await deleteDoc(doc(db, "properties", id));
            fetchProperties();
        } catch (error) {
            alert('Error deleting: ' + error.message);
        }
    }
};
