/* =========================================
   booking.js - Booking & Payment Logic
   ========================================= */

const BOOKINGS_KEY = 'travelvista_bookings';

// --- Get all bookings ---
function getBookings() {
  return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
}

// --- Save bookings ---
function saveBookings(bookings) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

// --- Handle booking form submission ---
function handleBooking() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name     = document.getElementById('cust-name').value.trim();
    const email    = document.getElementById('cust-email').value.trim();
    const phone    = document.getElementById('cust-phone').value.trim();
    const travelers= document.getElementById('num-travelers').value;
    const date     = document.getElementById('travel-date').value;
    const pkgId    = document.getElementById('tour-package').value;

    // Basic validation
    if (!name || !email || !phone || !travelers || !date || !pkgId) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      showToast('Enter a valid 10-digit phone number.', 'error');
      return;
    }

    const pkg = getPackageById(pkgId);
    const totalAmount = pkg.price * parseInt(travelers);

    // Create booking object
    const booking = {
      id: 'BK' + Date.now(),
      customerName: name,
      email,
      phone,
      travelers: parseInt(travelers),
      travelDate: date,
      packageId: pkgId,
      packageName: pkg.name,
      amount: totalAmount,
      paymentStatus: 'Pending',
      bookedAt: new Date().toISOString(),
    };

    const bookings = getBookings();
    bookings.push(booking);
    saveBookings(bookings);

    showToast(`Booking confirmed for ${pkg.name}! Booking ID: ${booking.id}`, 'success');
    form.reset();
    // Pre-fill user details again
    prefillUserDetails();

    // Show payment options instead of success message
    showPaymentOptions(pkg, totalAmount, booking.id, date);
  });
}

// --- Pre-fill user details from session ---
function prefillUserDetails() {
  const session = getSession();
  if (!session) return;
  const nameEl = document.getElementById('cust-name');
  const emailEl = document.getElementById('cust-email');
  if (nameEl && !nameEl.value) nameEl.value = session.name;
  if (emailEl && !emailEl.value) emailEl.value = session.email;
}

// --- Enhanced Render payment tracking table ---
function renderPaymentTable() {
  const container = document.getElementById('payment-table-body');
  const emptyState = document.getElementById('payment-empty');
  const tableWrapper = document.getElementById('payment-table-wrapper');
  if (!container) return;

  const bookings = getBookings();
  container.innerHTML = '';

  // Update summary cards
  updatePaymentSummary(bookings);

  if (bookings.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (tableWrapper) tableWrapper.style.display = 'none';
    return;
  }
  if (emptyState) emptyState.style.display = 'none';
  if (tableWrapper) tableWrapper.style.display = 'block';

  bookings.forEach((b, idx) => {
    const statusBadge = b.paymentStatus === 'Paid'
      ? `<span class="badge-paid">✓ Paid</span>`
      : `<span class="badge-pending">⏳ Pending</span>`;

    const actionBtns = b.paymentStatus !== 'Paid'
      ? `<button class="btn-mark-paid" onclick="markAsPaid('${b.id}')">Mark Paid</button>
         <button class="btn-mark-paid" style="background:var(--danger);" onclick="deleteBooking('${b.id}')">Delete</button>`
      : `<button class="btn-mark-paid" style="background:var(--warning);" onclick="downloadReceipt('${b.id}')">Receipt</button>`;

    const travelDate = b.travelDate ? new Date(b.travelDate).toLocaleDateString('en-IN') : 'N/A';

    container.innerHTML += `
      <tr>
        <td><strong>${b.id}</strong></td>
        <td>${b.customerName}</td>
        <td>${b.packageName}</td>
        <td>${b.travelers} person${b.travelers > 1 ? 's' : ''}</td>
        <td>${travelDate}</td>
        <td><strong>₹${b.amount.toLocaleString('en-IN')}</strong></td>
        <td>${statusBadge}</td>
        <td>${actionBtns}</td>
      </tr>
    `;
  });

  // Setup search and filters
  setupPaymentFilters();
}

// --- Update payment summary cards ---
function updatePaymentSummary(bookings) {
  const totalBookings = bookings.length;
  const paidBookings = bookings.filter(b => b.paymentStatus === 'Paid').length;
  const pendingBookings = bookings.filter(b => b.paymentStatus === 'Pending').length;
  const today = new Date();
  const upcomingTrips = bookings.filter(b => {
    const travelDate = new Date(b.travelDate);
    return travelDate >= today;
  }).length;

  document.getElementById('total-bookings').textContent = totalBookings;
  document.getElementById('paid-bookings').textContent = paidBookings;
  document.getElementById('pending-bookings').textContent = pendingBookings;
  document.getElementById('upcoming-trips').textContent = upcomingTrips;
}

// --- Setup payment filters and search ---
function setupPaymentFilters() {
  const searchInput = document.getElementById('payment-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  if (searchInput) {
    searchInput.addEventListener('input', filterTable);
  }
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      filterTable();
    });
  });
}

// --- Filter table based on search and status ---
function filterTable() {
  const searchInput = document.getElementById('payment-search');
  const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const rows = document.querySelectorAll('#payment-table-body tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    const statusCell = row.querySelector('td:nth-child(7)');
    const status = statusCell ? statusCell.textContent.trim() : '';
    
    const matchesSearch = text.includes(searchTerm);
    const matchesFilter = activeFilter === 'all' || 
                          (activeFilter === 'paid' && status.includes('Paid')) ||
                          (activeFilter === 'pending' && status.includes('Pending'));
    
    row.style.display = matchesSearch && matchesFilter ? '' : 'none';
  });
}

// --- Export payment data ---
function exportPaymentData() {
  const bookings = getBookings();
  let csv = 'Booking ID,Customer Name,Package,Travelers,Travel Date,Amount,Payment Status\n';
  
  bookings.forEach(b => {
    csv += `${b.id},${b.customerName},${b.packageName},${b.travelers},${b.travelDate},${b.amount},${b.paymentStatus}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payment_data_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  
  showToast('Payment data exported successfully!', 'success');
}

// --- Delete booking ---
function deleteBooking(bookingId) {
  if (confirm('Are you sure you want to delete this booking?')) {
    const bookings = getBookings();
    const filteredBookings = bookings.filter(b => b.id !== bookingId);
    saveBookings(filteredBookings);
    renderPaymentTable();
    showToast('Booking deleted successfully!', 'success');
  }
}

// --- Download receipt ---
function downloadReceipt(bookingId) {
  const bookings = getBookings();
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return;
  
  let receipt = `PAYMENT RECEIPT\n`;
  receipt += `=================\n\n`;
  receipt += `Booking ID: ${booking.id}\n`;
  receipt += `Customer Name: ${booking.customerName}\n`;
  receipt += `Email: ${booking.email}\n`;
  receipt += `Phone: ${booking.phone}\n\n`;
  receipt += `Package Details:\n`;
  receipt += `Package: ${booking.packageName}\n`;
  receipt += `Travelers: ${booking.travelers}\n`;
  receipt += `Travel Date: ${booking.travelDate}\n\n`;
  receipt += `Payment Details:\n`;
  receipt += `Amount: ₹${booking.amount.toLocaleString('en-IN')}\n`;
  receipt += `Status: ${booking.paymentStatus}\n`;
  receipt += `Payment Date: ${new Date(booking.bookedAt).toLocaleDateString('en-IN')}\n\n`;
  receipt += `Thank you for choosing TravelVista!`;
  
  const blob = new Blob([receipt], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt_${booking.id}.txt`;
  a.click();
  
  showToast('Receipt downloaded successfully!', 'success');
}

// --- Mark booking as paid ---
function markAsPaid(bookingId) {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.id === bookingId);
  if (idx !== -1) {
    bookings[idx].paymentStatus = 'Paid';
    saveBookings(bookings);
    renderPaymentTable();
    showToast('Payment status updated to Paid!', 'success');
  }
}

// --- Render schedule page ---
const SCHEDULES = {
  goa: {
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    days: [
      { title: 'Arrival & North Goa', desc: 'Airport pickup, check-in, visit Calangute & Baga Beach, evening at Tito\'s Lane.' },
      { title: 'Old Goa Heritage', desc: 'Visit Basilica of Bom Jesus, Se Cathedral, Fort Aguada, lunch at local Goan restaurant.' },
      { title: 'South Goa & Water Sports', desc: 'Palolem Beach, kayaking, jet skiing, sunset cruise on Sal River.' },
      { title: 'Departure', desc: 'Morning spice plantation visit, souvenir shopping, airport drop.' },
    ]
  },
  kerala: {
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80',
    days: [
      { title: 'Cochin Arrival', desc: 'Airport pickup, Fort Kochi tour, Chinese fishing nets, Jewish synagogue.' },
      { title: 'Munnar Tea Gardens', desc: 'Drive to Munnar, visit tea plantations, Eravikulam National Park.' },
      { title: 'Munnar to Alleppey', desc: 'Drive to Alleppey, board houseboat, backwater cruise.' },
      { title: 'Houseboat Day', desc: 'Cruise through backwaters, village visits, Ayurvedic massage.' },
      { title: 'Departure', desc: 'Return to Cochin, shopping, airport transfer.' },
    ]
  },
  manali: {
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    days: [
      { title: 'Arrival in Manali', desc: 'Check-in, Hadimba Temple, Old Manali market walk, Mall Road.' },
      { title: 'Solang Valley', desc: 'Skiing / zorbing at Solang, snow activities, river walk.' },
      { title: 'Rohtang Pass', desc: 'Drive to Rohtang Pass (subject to permits), snow point visit.' },
      { title: 'Adventure Sports', desc: 'River rafting on Beas, paragliding at Dobhi, zip-lining.' },
      { title: 'Departure', desc: 'Local shopping, spiti apple orchard visit, departure.' },
    ]
  },
  kashmir: {
    image: 'https://images.unsplash.com/photo-1541332538925-a0d3db34e093?w=800&q=80',
    days: [
      { title: 'Arrival in Srinagar', desc: 'Airport pickup, Dal Lake shikara ride, houseboat check-in.' },
      { title: 'Srinagar Sightseeing', desc: 'Mughal Gardens: Nishat & Shalimar Bagh, Shankaracharya Temple.' },
      { title: 'Gulmarg Day Trip', desc: 'Drive to Gulmarg, Gondola ride (Phase 1 & 2), snow activities.' },
      { title: 'Pahalgam Excursion', desc: 'Drive through apple orchards, Betaab Valley, Aru Valley, Chandanwari.' },
      { title: 'Local Srinagar', desc: 'Old City tour, Jamia Masjid, Lal Chowk shopping, traditional Wazwan dinner.' },
      { title: 'Departure', desc: 'Morning shikara ride, souvenir shopping, airport transfer.' },
    ]
  },
};

function renderSchedules() {
  const container = document.getElementById('schedules-container');
  if (!container) return;
  container.innerHTML = '';

  TOUR_PACKAGES.forEach(pkg => {
    const schedule = SCHEDULES[pkg.id];
    if (!schedule) return;

    const daysHtml = schedule.days.map((day, i) => `
      <div class="day-item">
        <div class="day-dot"><i class="bi bi-geo-alt-fill"></i></div>
        <div class="day-content">
          <div class="day-label">Day ${i + 1}</div>
          <div class="day-title">${day.title}</div>
          <div class="day-desc">${day.desc}</div>
        </div>
      </div>
    `).join('');

    container.innerHTML += `
      <div class="schedule-card" id="${pkg.id}">
        <div class="schedule-header" style="background-image:url('${schedule.image}')">
          <div class="schedule-header-content">
            <h3>${pkg.name}</h3>
            <span><i class="bi bi-calendar3"></i> ${pkg.duration}</span>
          </div>
        </div>
        <div class="schedule-body">${daysHtml}</div>
      </div>
    `;
  });
}

// --- Payment Functions ---
let currentPaymentMethod = '';
let currentBookingData = null;

function showPaymentOptions(pkg, amount, bookingId, travelDateValue) {
  console.log('Date passed to showPaymentOptions:', travelDateValue); // Debug
  
  currentBookingData = { pkg, amount, bookingId, travelDate: travelDateValue };
  
  // Hide booking form and show payment options
  document.querySelector('.booking-section').style.display = 'none';
  document.getElementById('payment-options').style.display = 'block';
  
  // Update payment summary
  document.getElementById('payment-package-name').textContent = pkg.name;
  document.getElementById('payment-travelers').textContent = document.getElementById('num-travelers').value;
  
  // Format date properly
  const formattedDate = travelDateValue ? new Date(travelDateValue).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Date not selected';
  
  console.log('Formatted date:', formattedDate); // Debug
  document.getElementById('payment-date').textContent = formattedDate;
  document.getElementById('payment-amount').textContent = `₹${amount.toLocaleString('en-IN')}`;
  
  // Scroll to payment section
  document.getElementById('payment-options').scrollIntoView({ behavior: 'smooth' });
}

function selectPaymentMethod(method) {
  currentPaymentMethod = method;
  
  // Update active state
  document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('active'));
  event.currentTarget.classList.add('active');
  
  // Show corresponding payment form
  document.querySelectorAll('.payment-form-content').forEach(el => el.style.display = 'none');
  document.getElementById(`${method}-payment`).style.display = 'block';
}

function processPayment() {
  if (!currentPaymentMethod) {
    showToast('Please select a payment method', 'error');
    return;
  }
  
  // Get form values for validation
  let isValid = true;
  let paymentDetails = {};
  
  if (currentPaymentMethod === 'card') {
    const cardNumber = document.querySelector('#card-payment input[placeholder="1234 5678 9012 3456"]').value;
    const cvv = document.querySelector('#card-payment input[placeholder="123"]').value;
    const expiry = document.querySelector('#card-payment input[placeholder="MM/YY"]').value;
    const cardholder = document.querySelector('#card-payment input[placeholder="John Doe"]').value;
    
    if (!cardNumber || !cvv || !expiry || !cardholder) {
      showToast('Please fill all card details', 'error');
      return;
    }
    paymentDetails = { cardNumber: cardNumber.slice(-4), cvv, expiry, cardholder };
  } else if (currentPaymentMethod === 'upi') {
    const upiId = document.querySelector('#upi-payment input[placeholder="yourname@upi"]').value;
    if (!upiId) {
      showToast('Please enter UPI ID', 'error');
      return;
    }
    paymentDetails = { upiId };
  } else if (currentPaymentMethod === 'netbanking') {
    const bank = document.querySelector('#netbanking-payment select').value;
    if (bank === 'Choose your bank') {
      showToast('Please select your bank', 'error');
      return;
    }
    paymentDetails = { bank };
  } else if (currentPaymentMethod === 'wallet') {
    const walletNumber = document.querySelector('#wallet-payment input[placeholder="Enter wallet number"]').value;
    if (!walletNumber) {
      showToast('Please enter wallet number', 'error');
      return;
    }
    paymentDetails = { walletNumber };
  }
  
  // Start payment processing based on method
  if (currentPaymentMethod === 'upi') {
    processUPIPayment(paymentDetails);
  } else {
    processOtherPayment(paymentDetails);
  }
}

function processUPIPayment(paymentDetails) {
  // Show UPI-specific flow
  showToast('Sending payment request to your UPI app...', 'info');
  
  setTimeout(() => {
    showToast('Waiting for payment approval...', 'info');
    
    setTimeout(() => {
      // Update booking status to paid
      const bookings = getBookings();
      const bookingIndex = bookings.findIndex(b => b.id === currentBookingData.bookingId);
      if (bookingIndex !== -1) {
        bookings[bookingIndex].paymentStatus = 'Paid';
        bookings[bookingIndex].paymentMethod = 'UPI';
        bookings[bookingIndex].paymentDetails = paymentDetails;
        saveBookings(bookings);
      }
      
      // Show payment success
      showPaymentSuccess();
      
      // Redirect to payment tracking page after 3 seconds
      setTimeout(() => {
        window.location.href = 'payment.html';
      }, 3000);
    }, 3000);
  }, 2000);
}

function processOtherPayment(paymentDetails) {
  // Show generic payment processing
  showToast('Processing payment...', 'info');
  
  setTimeout(() => {
    // Update booking status to paid
    const bookings = getBookings();
    const bookingIndex = bookings.findIndex(b => b.id === currentBookingData.bookingId);
    if (bookingIndex !== -1) {
      bookings[bookingIndex].paymentStatus = 'Paid';
      bookings[bookingIndex].paymentMethod = currentPaymentMethod.charAt(0).toUpperCase() + currentPaymentMethod.slice(1);
      bookings[bookingIndex].paymentDetails = paymentDetails;
      saveBookings(bookings);
    }
    
    // Show payment success
    showPaymentSuccess();
    
    // Redirect to payment tracking page after 2 seconds
    setTimeout(() => {
      window.location.href = 'payment.html';
    }, 2000);
  }, 1500);
}

function cancelPayment() {
  // Reset payment form
  currentPaymentMethod = '';
  document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.payment-form-content').forEach(el => el.style.display = 'none');
  
  // Show booking form again
  document.getElementById('payment-options').style.display = 'none';
  document.querySelector('.booking-section').style.display = 'block';
  
  showToast('Payment cancelled', 'info');
}

function showPaymentSuccess() {
  const paymentCard = document.querySelector('.payment-card');
  
  console.log('Current booking data:', currentBookingData); // Debug
  
  let travelDate = 'Date not available';
  if (currentBookingData && currentBookingData.travelDate) {
    try {
      const dateObj = new Date(currentBookingData.travelDate);
      if (!isNaN(dateObj.getTime())) {
        travelDate = dateObj.toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('Date parsing error:', error);
    }
  }
  
  console.log('Final travel date:', travelDate); // Debug
  
  paymentCard.innerHTML = `
    <div style="text-align:center;padding:2rem;">
      <div style="font-size:3rem;margin-bottom:1rem;">🎉</div>
      <h3 style="color:var(--success);margin-bottom:1rem;">Payment Successful!</h3>
      
      <div style="background:var(--bg-light);padding:1.5rem;border-radius:var(--radius);margin:1.5rem 0;text-align:left;">
        <h4 style="color:var(--dark);margin-bottom:1rem;text-align:center;">Booking Confirmation</h4>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
          <div>
            <strong style="color:var(--text-muted);font-size:0.9rem;">Destination</strong>
            <p style="margin:0.25rem 0;color:var(--dark);font-weight:500;">${currentBookingData.pkg.name}</p>
          </div>
          <div>
            <strong style="color:var(--text-muted);font-size:0.9rem;">Travel Date</strong>
            <p style="margin:0.25rem 0;color:var(--dark);font-weight:500;">${travelDate}</p>
          </div>
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
          <div>
            <strong style="color:var(--text-muted);font-size:0.9rem;">Number of Travelers</strong>
            <p style="margin:0.25rem 0;color:var(--dark);font-weight:500;">${document.getElementById('payment-travelers').textContent} person(s)</p>
          </div>
          <div>
            <strong style="color:var(--text-muted);font-size:0.9rem;">Booking ID</strong>
            <p style="margin:0.25rem 0;color:var(--dark);font-weight:500;">${currentBookingData.bookingId}</p>
          </div>
        </div>
        
        <div style="text-align:center;padding:1rem;background:#d1fae5;border-radius:var(--radius-sm);">
          <strong style="color:var(--success);font-size:1.1rem;">Payment Status: Successful</strong>
        </div>
      </div>
      
      <div style="background:var(--success);color:white;padding:1rem;border-radius:var(--radius);margin-top:1rem;">
        <i class="bi bi-check-circle-fill me-2"></i>
        Your booking is confirmed and payment received! Check your email for details.
      </div>
      
      <div style="margin-top:1.5rem;font-size:0.9rem;color:var(--text-muted);">
        <p>Redirecting to payment tracking page in <span id="countdown">3</span> seconds...</p>
      </div>
    </div>
  `;
  
  // Add countdown timer
  let countdown = 3;
  const countdownInterval = setInterval(() => {
    countdown--;
    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
      countdownEl.textContent = countdown;
    }
    if (countdown <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
}
