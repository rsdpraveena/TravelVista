/* =========================================
   packages.js - Tour Package Data & Rendering
   ========================================= */

// --- All tour packages data ---
const TOUR_PACKAGES = [
  {
    id: 'goa',
    name: 'Goa Beach Tour',
    duration: '4 Days / 3 Nights',
    price: 15999,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    description: 'Experience the sun-kissed beaches, vibrant nightlife, and Portuguese heritage of Goa. Includes beach hopping, water sports, and local cuisine tour.',
    highlights: ['Calangute & Baga Beach', 'Old Goa Heritage sites', 'Water Sports', 'Local Cuisine Tour'],
  },
  {
    id: 'kerala',
    name: 'Kerala Backwaters',
    duration: '5 Days / 4 Nights',
    price: 22999,
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80',
    description: "Cruise through serene backwaters on a traditional houseboat, explore tea plantations in Munnar, and relax with Ayurvedic treatments.",
    highlights: ['Houseboat Cruise', 'Munnar Tea Gardens', 'Ayurvedic Spa', 'Chinese Fishing Nets'],
  },
  {
    id: 'manali',
    name: 'Manali Adventure',
    duration: '5 Days / 4 Nights',
    price: 18499,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    description: 'Thrilling adventure in the Himalayas with trekking, paragliding, river rafting, and visits to snow-capped peaks and ancient temples.',
    highlights: ['Rohtang Pass', 'River Rafting', 'Paragliding', 'Solang Valley'],
  },
  {
    id: 'kashmir',
    name: 'Kashmir Trip',
    duration: '6 Days / 5 Nights',
    price: 27999,
    image: 'https://images.unsplash.com/photo-1541332538925-a0d3db34e093?w=600&q=80',
    description: "Discover the paradise on earth — Dal Lake shikaras, Mughal gardens, Gulmarg gondola, and the stunning Pahalgam valley.",
    highlights: ['Dal Lake Shikara', 'Gulmarg Gondola', 'Mughal Gardens', 'Pahalgam Valley'],
  },
];

// --- Render packages on packages page (list layout) ---
function renderPackagesList() {
  const container = document.getElementById('packages-list');
  if (!container) return;
  container.innerHTML = '';

  TOUR_PACKAGES.forEach(pkg => {
    container.innerHTML += `
      <div class="col-12 col-lg-6">
        <div class="package-list-card">
          <div class="pkg-img">
            <img src="${pkg.image}" alt="${pkg.name}" loading="lazy">
          </div>
          <div class="pkg-body">
            <div>
              <h3 class="pkg-title">${pkg.name}</h3>
              <div class="pkg-meta">
                <span><i class="bi bi-clock"></i> ${pkg.duration}</span>
                <span><i class="bi bi-currency-rupee"></i> ${pkg.price.toLocaleString('en-IN')}</span>
              </div>
              <p class="pkg-desc">${pkg.description}</p>
              <div class="d-flex flex-wrap gap-1 mb-3">
                ${pkg.highlights.map(h => `<span class="badge" style="background:var(--primary-light);color:var(--primary);font-weight:500;font-size:0.75rem;">${h}</span>`).join('')}
              </div>
            </div>
            <div class="pkg-actions">
              <button class="btn-primary-custom" onclick="bookPackage('${pkg.id}')">
                <i class="bi bi-calendar-check"></i> Book Now
              </button>
              <button class="btn-outline-custom" onclick="viewSchedule('${pkg.id}')">View Schedule</button>
              <span class="price ms-auto">₹${pkg.price.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

// --- Render popular packages on home page (card layout) ---
function renderHomePackages() {
  const container = document.getElementById('home-packages');
  if (!container) return;
  container.innerHTML = '';

  TOUR_PACKAGES.forEach(pkg => {
    container.innerHTML += `
      <div class="col-6 col-md-3">
        <div class="package-card">
          <div class="card-img-wrapper">
            <img src="${pkg.image}" alt="${pkg.name}" loading="lazy">
          </div>
          <div class="card-body">
            <h5 class="card-title">${pkg.name}</h5>
            <p class="duration"><i class="bi bi-clock me-1"></i>${pkg.duration}</p>
            <p class="price">₹${pkg.price.toLocaleString('en-IN')}</p>
          </div>
          <div class="card-footer">
            <button class="btn-primary-custom w-100" onclick="bookPackage('${pkg.id}')">
              <i class="bi bi-calendar-check"></i> Book Now
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

// --- Navigate to booking with pre-selected package ---
function bookPackage(pkgId) {
  window.location.href = `booking.html?package=${pkgId}`;
}

// --- Navigate to schedule for a specific package ---
function viewSchedule(pkgId) {
  window.location.href = `schedule.html#${pkgId}`;
}

// --- Populate package select in booking form ---
function populatePackageSelect() {
  const sel = document.getElementById('tour-package');
  if (!sel) return;
  sel.innerHTML = '<option value="">Select a package</option>';
  TOUR_PACKAGES.forEach(pkg => {
    sel.innerHTML += `<option value="${pkg.id}">${pkg.name} - ₹${pkg.price.toLocaleString('en-IN')}</option>`;
  });
  // Pre-select from URL param
  const urlParams = new URLSearchParams(window.location.search);
  const pkgParam = urlParams.get('package');
  if (pkgParam) sel.value = pkgParam;
}

// --- Get package by id ---
function getPackageById(id) {
  return TOUR_PACKAGES.find(p => p.id === id);
}
