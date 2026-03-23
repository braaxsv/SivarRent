// App State
const state = {
  currentView: 'home',
  vehicles: [],
  reservations: [],
  selectedVehicleId: null,
  isDark: false,
  activeFilter: 'Todos'
};

// Initialize app
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  lucide.createIcons();
  
  await loadData();
  renderFeaturedCars();
  renderSearchResults();
  
  // Load existing mock reservations from LocalStorage
  const savedReservas = localStorage.getItem('sivarRent_reservas');
  if (savedReservas) {
    state.reservations = JSON.parse(savedReservas);
  } else {
    state.reservations = [];
  }
});

// Load Mock Data
async function loadData() {
  try {
    const res = await fetch('data/mock.json');
    const data = await res.json();
    state.vehicles = data.Vehiculos;
  } catch(e) {
    console.error("Failed to load mock.json", e);
  }
}

// Router / View Manager
function renderView(viewId) {
  state.currentView = viewId;
  document.querySelectorAll('.view-section').forEach(el => {
    el.classList.remove('active');
  });
  document.getElementById(`view-${viewId}`).classList.add('active');
  
  // Extra logic for specific views
  if(viewId === 'search') {
    renderSearchResults();
  }
  
  // Reset scroll
  window.scrollTo(0, 0);
}

// Render Featured Cars (Home)
function renderFeaturedCars() {
  const container = document.getElementById('featured-cars-container');
  if(!container) return;
  
  // Using 3 most recent or interesting cars for the grid
  container.innerHTML = state.vehicles.slice(0, 3).map(car => `
    <div class="bg-white dark:bg-ios-cardDark rounded-ios overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer active:scale-95 border border-gray-100 dark:border-gray-800 group h-full flex flex-col" onclick="goToDetail('${car.id_auto}')">
      <div class="h-64 bg-gray-200 relative overflow-hidden">
        <img src="${car.fotos[0]}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="${car.modelo}">
        <div class="absolute top-4 right-4 bg-white/95 dark:bg-black/95 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-black text-ios-blue shadow-lg">
          $${car.precio_dia}/día
        </div>
      </div>
      <div class="p-8 flex-1 flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start mb-3">
            <h4 class="text-2xl font-extrabold tracking-tight">${car.marca} ${car.modelo}</h4>
            <span class="text-sm font-bold text-ios-textMuted bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">${car.anio}</span>
          </div>
          <p class="text-sm text-ios-textMuted flex items-center gap-2 font-bold mb-6">
            <i data-lucide="map-pin" class="w-4 h-4 text-ios-blue"></i> ${car.ubicacion}
          </p>
        </div>
        <div class="flex gap-3">
           <span class="text-[10px] px-3 py-1.5 bg-ios-blue/10 text-ios-blue rounded-full font-black uppercase tracking-widest">${car.transmision}</span>
           <span class="text-[10px] px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full font-black uppercase tracking-widest text-ios-textMuted">${car.cilindrada}</span>
        </div>
      </div>
    </div>
  `).join('');
  
  lucide.createIcons();
}

// Render Search Results
function renderSearchResults(filter = 'Todos') {
  state.activeFilter = filter;
  const container = document.getElementById('search-results-container');
  if(!container) return;
  
  let filteredVehicles = state.vehicles;
  if(filter !== 'Todos') {
    if(filter === 'Automático' || filter === 'Estándar') {
      filteredVehicles = state.vehicles.filter(v => v.transmision === filter);
    } else if (filter === 'SUV' || filter === 'Pick-up' || filter === 'Sedán') {
        const query = filter.toLowerCase();
        filteredVehicles = state.vehicles.filter(v => v.marca.toLowerCase().includes(query) || v.modelo.toLowerCase().includes(query) || v.modelo.toLowerCase().includes('4x4'));
    }
  }

  if (filteredVehicles.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-500 mt-8">No se encontraron vehículos.</p>';
    return;
  }
  
  container.innerHTML = filteredVehicles.map(car => `
    <div class="bg-white dark:bg-ios-cardDark rounded-ios overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer active:scale-95 border border-gray-100 dark:border-gray-800 group h-full flex flex-col" onclick="goToDetail('${car.id_auto}')">
      <div class="h-60 bg-gray-200 relative overflow-hidden">
         <img src="${car.fotos[0]}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="${car.modelo}">
         <div class="absolute top-4 right-4 bg-white/95 dark:bg-black/95 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-black text-ios-blue shadow-lg">
          $${car.precio_dia}/día
        </div>
      </div>
      <div class="p-6 flex-1 flex flex-col justify-between">
         <div>
           <div class="flex justify-between items-start mb-3">
             <h4 class="font-extrabold text-xl tracking-tight">${car.marca} ${car.modelo}</h4>
             <button class="text-gray-300 hover:text-red-500 transition scale-110"><i data-lucide="heart" class="w-6 h-6"></i></button>
           </div>
           <p class="text-sm text-ios-textMuted flex items-center gap-2 font-bold mb-6">
             <i data-lucide="map-pin" class="w-4 h-4 text-ios-blue"></i> ${car.ubicacion}
           </p>
           <div class="grid grid-cols-2 gap-2">
             <span class="text-[9px] px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-md font-black uppercase tracking-tighter text-ios-textMuted text-center">${car.transmision}</span>
             <span class="text-[9px] px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-md font-black uppercase tracking-tighter text-ios-textMuted text-center">${car.anio}</span>
           </div>
         </div>
         <button class="mt-6 w-full py-3 bg-ios-blue/10 text-ios-blue font-black text-xs uppercase tracking-widest rounded-ios-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
           Ver Detalles
         </button>
      </div>
    </div>
  `).join('');
  
  // Highlight active filter pill
  document.querySelectorAll('.filter-pill').forEach(btn => {
    if(btn.innerText.includes(filter)) {
      btn.classList.add('bg-ios-blue', 'text-white', 'shadow-blue-500/30');
      btn.classList.remove('bg-white', 'dark:bg-ios-cardDark', 'text-black', 'dark:text-white');
    } else {
      btn.classList.remove('bg-ios-blue', 'text-white', 'shadow-blue-500/30');
      btn.classList.add('bg-white', 'dark:bg-ios-cardDark');
    }
  });

  lucide.createIcons();
}

// Handle Reservation
function handleReserva() {
  const btn = document.getElementById('btn-solicitar');
  const originalText = btn.innerText;
  
  btn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Procesando...';
  lucide.createIcons();
  
  setTimeout(() => {
    // Save to reservations
    const newReserva = {
      id_reserva: 'r_' + Date.now(),
      id_auto: state.selectedVehicleId,
      fecha_creacion: new Date().toISOString(),
      estado_reserva: 'Confirmada'
    };
    state.reservations.push(newReserva);
    localStorage.setItem('sivarRent_reservas', JSON.stringify(state.reservations));
    
    // Show success & redirect
    btn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i> ¡Reserva Confirmada!';
    btn.classList.remove('bg-ios-blue');
    btn.classList.add('bg-ios-green');
    lucide.createIcons();
    
    setTimeout(() => {
       btn.innerText = originalText;
       btn.classList.add('bg-ios-blue');
       btn.classList.remove('bg-ios-green');
       renderView('dashboard');
    }, 1500);
    
  }, 1000);
}

// Go To Detail
function goToDetail(id) {
  const car = state.vehicles.find(v => v.id_auto === id);
  if(!car) return;
  
  state.selectedVehicleId = id;
  
  document.getElementById('detail-img').src = car.fotos[0];
  document.getElementById('detail-title').innerText = `${car.marca} ${car.modelo}`;
  document.getElementById('detail-location').innerText = car.ubicacion;
  document.getElementById('detail-price').innerText = `$${car.precio_dia}`;
  document.getElementById('detail-transmision').innerText = car.transmision;
  document.getElementById('detail-cilindrada').innerText = car.cilindrada;
  document.getElementById('detail-anio').innerText = car.anio;
  
  // Set ID to button for logic
  const btnReserva = document.querySelector('#view-detail button.bg-ios-blue');
  if(btnReserva) {
    btnReserva.id = 'btn-solicitar';
    btnReserva.onclick = handleReserva;
  }

  // Extras
  const extrasContainer = document.getElementById('extras-container');
  if(car.extras_disponibles && car.extras_disponibles.length > 0) {
    extrasContainer.innerHTML = car.extras_disponibles.map((extra, idx) => `
      <div class="p-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
        <p class="font-semibold text-[15px]">${extra}</p>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" value="" class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-ios-blue"></div>
        </label>
      </div>
    `).join('');
  } else {
    extrasContainer.innerHTML = '';
  }
  
  renderView('detail');
}

// Render Dashboard Reservations
function renderReservations() {
  const container = document.getElementById('reservas-list-container');
  if(!container) return;
  
  if(state.reservations.length === 0) {
    container.innerHTML = '<div class="p-8 text-center text-ios-textMuted font-medium">No tienes viajes planeados aún.</div>';
    return;
  }
  
  container.innerHTML = state.reservations.map(res => {
    const car = state.vehicles.find(v => v.id_auto === res.id_auto);
    const dateStr = new Date(res.fecha_creacion).toLocaleDateString();
    return `
      <div class="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
         <div class="flex items-center gap-3">
           <div class="p-2 bg-blue-100 dark:bg-blue-900/30 text-ios-blue rounded-lg">
             <i data-lucide="calendar-check" class="w-5 h-5"></i>
           </div>
           <div>
             <p class="font-semibold text-[15px]">${car ? car.marca + ' ' + car.modelo : 'Vehículo desconocido'}</p>
             <p class="text-xs text-ios-textMuted font-medium mt-0.5">${dateStr} (${res.estado_reserva})</p>
           </div>
         </div>
         <i data-lucide="chevron-right" class="text-gray-400 w-5 h-5"></i>
      </div>
    `;
  }).join('');
  
  lucide.createIcons();
}

// Theme Toggle logic
function initTheme() {
  const themeToggle = document.getElementById('btn-theme-toggle');
  const iconTheme = document.getElementById('icon-theme');
  
  // check local storage
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    state.isDark = true;
  } else {
    document.documentElement.classList.remove('dark');
    state.isDark = false;
  }
  updateThemeIcon();

  themeToggle.addEventListener('click', () => {
    state.isDark = !state.isDark;
    if(state.isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
    updateThemeIcon();
  });
}

function updateThemeIcon() {
  const iconTheme = document.getElementById('icon-theme');
  if(state.isDark) {
    iconTheme.setAttribute('data-lucide', 'sun');
  } else {
    iconTheme.setAttribute('data-lucide', 'moon');
  }
  lucide.createIcons();
}
