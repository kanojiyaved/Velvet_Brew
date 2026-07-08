const MENU_DATA_URL = './assets/data/menu-data.json';

async function fetchMenuData() {
  try {
    const response = await fetch(MENU_DATA_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load menu');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return {
      hero: {
        title: 'Crafted for every craving',
        description: 'Your menu is currently loading. Please refresh or check the Excel data file.'
      },
      categories: ['Beverages', 'Snacks'],
      items: []
    };
  }
}
