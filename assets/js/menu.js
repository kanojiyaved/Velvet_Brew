const state = {
  items: [],
  categories: [],
  activeCategory: 'All',
  searchTerm: '',
  filters: new Set(),
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
    const matchesSearch = `${item.Name} ${item.Description} ${item.Category}`.toLowerCase().includes(state.searchTerm.toLowerCase());

    let matchesFilters = true;
    if (state.filters.has('veg') && item.Veg !== 'Yes') matchesFilters = false;
    if (state.filters.has('nonveg') && item.Veg === 'Yes') matchesFilters = false;
    if (state.filters.has('available') && item.Available !== 'Yes') matchesFilters = false;
    if (state.filters.has('popular') && item.Popular !== 'Yes') matchesFilters = false;
    if (state.filters.has('chef') && item.ChefSpecial !== 'Yes') matchesFilters = false;

    return matchesCategory && matchesSearch && matchesFilters;
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

function renderMenu() {
  const items = getFilteredItems();
  elements.menuGrid.innerHTML = items
    .map((item) => {
      const availabilityClass = item.Available === 'Yes' ? 'availability' : 'unavailable';
      const availabilityText = item.Available === 'Yes' ? 'Available' : 'Out of Stock';
      const vegBadge = item.Veg === 'Yes' ? 'Veg' : 'Non-Veg';
      const spiceIndicator = item.Spice || 'Mild';
      const imageUrl = item.ImageURL || './assets/images/hero-bg.svg';

      return `
        <article class="menu-card">
          <img class="menu-card__image" src="${imageUrl}" alt="${item.Name}" loading="lazy" />
          <div class="card-head">
            <h3 class="card-title">${item.Name}</h3>
            <span class="badge">${item.Category}</span>
          </div>
          <p>${item.Description}</p>
          <div class="badge-row">
            <span class="badge">${vegBadge}</span>
            <span class="badge">${spiceIndicator}</span>
            <span class="badge ${availabilityClass}">${availabilityText}</span>
            ${item.Popular === 'Yes' ? '<span class="badge">Popular</span>' : ''}
            ${item.ChefSpecial === 'Yes' ? '<span class="badge">Chef’s Special</span>' : ''}
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
    const filter = button.dataset.filter;
    button.classList.toggle('active');
    if (state.filters.has(filter)) state.filters.delete(filter); else state.filters.add(filter);
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
