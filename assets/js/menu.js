const state = {
  items: [],
  categories: [],
  activeCategory: 'All',
  searchTerm: '',
  dietFilter: 'all',
};

const elements = {
  categoryNav: document.getElementById('categoryNav'),
  filterChips: document.getElementById('filterChips'),
  menuGrid: document.getElementById('menuGrid'),
  heroTitle: document.getElementById('heroTitle'),
  heroDescription: document.getElementById('heroDescription'),
  searchInput: document.getElementById('searchInput'),
  emptyState: document.getElementById('emptyState'),
  themeToggle: document.getElementById('themeToggle'),
};

function camelToTitle(value) {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

function getFilteredItems() {
  return state.items.filter((item) => {
    const matchesCategory = state.activeCategory === 'All' || item.Category === state.activeCategory;
    const matchesSearch = `${item.Name} ${item.Description} ${item.Category} ${item.Subcategory || ''}`.toLowerCase().includes(state.searchTerm.toLowerCase());

    let matchesDiet = true;
    if (state.dietFilter === 'veg' && item.Veg !== 'Yes') matchesDiet = false;
    if (state.dietFilter === 'nonveg' && item.Veg === 'Yes') matchesDiet = false;

    return matchesCategory && matchesSearch && matchesDiet;
  });
}

function buildCategoryButtons() {
  const categories = ['All', ...state.categories];
  elements.categoryNav.innerHTML = categories
    .map((category) => {
      const active = category === state.activeCategory ? 'active' : '';
      return `<button class="category-btn ${active}" data-category="${category}">${category}</button>`;
    })
    .join('');
}

function resolveImageUrl(rawUrl) {
  const fallback = './assets/images/hero-bg.svg';
  if (!rawUrl) return fallback;

  const text = String(rawUrl).trim();
  if (!text) return fallback;

  const driveMatch = text.match(/drive\.google\.com\/(?:file\/d\/|uc\?id=)([^/&?]+)/i);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }

  return text;
}

function renderMenu() {
  const items = getFilteredItems();
  elements.menuGrid.innerHTML = items
    .map((item) => {
      const availabilityClass = item.Available === 'Yes' ? 'availability' : 'unavailable';
      const availabilityText = item.Available === 'Yes' ? 'Available' : 'Out of Stock';
      const vegBadge = item.Veg === 'Yes' ? 'Veg' : 'Non-Veg';
      const spiceIndicator = item.Spice || 'Mild';
      const imageUrl = resolveImageUrl(item.ImageURL);

      return `
        <article class="menu-card">
          <img class="menu-card__image" src="${imageUrl}" alt="${item.Name}" loading="lazy" onerror="this.onerror=null;this.src='./assets/images/hero-bg.svg';" />
          <div class="card-head">
            <h3 class="card-title">${item.Name}</h3>
            <span class="badge">${item.Category}</span>
          </div>
          ${item.Subcategory ? `<p class="text-muted small mb-2">${item.Subcategory}</p>` : ''}
          <p>${item.Description}</p>
          <div class="badge-row">
            <span class="badge">${vegBadge}</span>
            <span class="badge">${spiceIndicator}</span>
            <span class="badge ${availabilityClass}">${availabilityText}</span>
          </div>
          <div class="price-row">
            <span>⏱ ${item.PrepTime || '10 min'}</span>
            <span>₹${item.Price}</span>
          </div>
        </article>
      `;
    })
    .join('');

  elements.emptyState.classList.toggle('d-none', items.length > 0);
}

function bindEvents() {
  elements.categoryNav.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.activeCategory = button.dataset.category;
    buildCategoryButtons();
    renderMenu();
  });

  elements.filterChips.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;

    const buttons = Array.from(elements.filterChips.querySelectorAll('[data-filter]'));
    buttons.forEach((chip) => chip.classList.remove('active'));

    button.classList.add('active');
    state.dietFilter = button.dataset.filter;
    renderMenu();
  });

  elements.searchInput.addEventListener('input', (event) => {
    state.searchTerm = event.target.value;
    renderMenu();
  });

  elements.themeToggle.addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    elements.themeToggle.innerHTML = next === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  });
}

async function initializeMenu() {
  const data = await fetchMenuData();
  state.items = data.items || [];
  state.categories = [...new Set(state.items.map((item) => item.Category).filter(Boolean))];
  elements.heroTitle.textContent = data.hero?.title || 'Crafted for every craving';
  elements.heroDescription.textContent = data.hero?.description || 'Discover our signature beverages, comfort plates, and sweet endings.';
  buildCategoryButtons();
  renderMenu();
  bindEvents();

  gsap.from('.menu-card', {
    y: 24,
    opacity: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: 'power3.out'
  });
}

document.addEventListener('DOMContentLoaded', initializeMenu);
