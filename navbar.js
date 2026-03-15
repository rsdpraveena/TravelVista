/* =========================================
   navbar.js - Shared Navbar Injection
   ========================================= */

// Inject the shared navbar into #navbar-placeholder
function injectNavbar(activePage) {
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  placeholder.innerHTML = `
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid px-4">
        <!-- Brand Logo -->
        <a class="navbar-brand" href="index.html">
          <i class="bi bi-airplane-fill"></i> TravelVista
        </a>

        <!-- Mobile Toggle -->
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Nav Links -->
        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav mx-auto gap-1">
            <li class="nav-item">
              <a class="nav-link ${activePage==='index'?'active':''}" href="index.html" data-page="index.html">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link ${activePage==='packages'?'active':''}" href="packages.html" data-page="packages.html">Packages</a>
            </li>
            <li class="nav-item">
              <a class="nav-link ${activePage==='booking'?'active':''}" href="booking.html" data-page="booking.html">Booking</a>
            </li>
            <li class="nav-item">
              <a class="nav-link ${activePage==='payment'?'active':''}" href="payment.html" data-page="payment.html">Payment</a>
            </li>
            <li class="nav-item">
              <a class="nav-link ${activePage==='schedule'?'active':''}" href="schedule.html" data-page="schedule.html">Schedule</a>
            </li>
          </ul>

          <!-- User Greeting & Logout -->
          <div class="d-flex align-items-center gap-3">
            <span class="navbar-greeting" id="nav-greeting"></span>
            <button class="btn-logout" id="nav-logout">
              <i class="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  `;
}
