import json
import re
from pathlib import Path
import urllib.request
import mimetypes
import openpyxl

ROOT = Path(__file__).resolve().parent
WORKBOOK_PATH = ROOT / 'google-sheet-template' / 'QR Menu.xlsx'
OUTPUT_PATH = ROOT / 'assets' / 'data' / 'menu-data.json'
IMAGE_DIR = ROOT / 'assets' / 'images' / 'menu'


def read_table(sheet):
    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        return []

    headers = []
    for cell in rows[0]:
        headers.append('' if cell is None else str(cell).strip())

    data = []
    for row in rows[1:]:
        if not any(cell is not None and str(cell).strip() != '' for cell in row):
            continue

        record = {}
        for index, header in enumerate(headers):
            value = row[index] if index < len(row) else ''
            record[header] = value
        data.append(record)

    return data


def normalize_bool(value):
    if isinstance(value, bool):
        return 'Yes' if value else 'No'
    if value is None:
        return 'No'
    if isinstance(value, str):
        return 'Yes' if value.strip().lower() in {'yes', 'true', '1', 'y'} else 'No'
    return 'Yes' if value else 'No'


def normalize_image_url(value):
    if value is None:
        return ''

    text = str(value).strip()
    if not text:
        return ''

    if 'drive.google.com/file/d/' in text:
        match = re.search(r'/file/d/([^/]+)', text)
        if match:
            return f'https://drive.google.com/thumbnail?id={match.group(1)}'

    if 'drive.google.com/open' in text or 'drive.google.com/uc' in text:
        match = re.search(r'[?&]id=([^&]+)', text)
        if match:
            return f'https://drive.google.com/thumbnail?id={match.group(1)}'

    return text


def download_image(url, item_name, item_id):
    if not url:
        return ''

    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = re.sub(r'[^a-zA-Z0-9._-]+', '-', (item_name or f'item-{item_id}').strip().lower()).strip('-') or f'item-{item_id}'
    file_name = f'{safe_name}-{item_id}.jpg'
    target_path = IMAGE_DIR / file_name

    if target_path.exists():
        return f'./assets/images/menu/{file_name}'

    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=20) as response:
            content_type = response.headers.get('Content-Type', '')
            data = response.read()

        if not data:
            return ''

        if 'image/' in content_type:
            ext = mimetypes.guess_extension(content_type) or '.jpg'
            if ext != '.jpg' and ext != '.png' and ext != '.jpeg' and ext != '.webp':
                ext = '.jpg'
            target_path = IMAGE_DIR / f'{safe_name}-{item_id}{ext}'

        target_path.write_bytes(data)
        return f'./assets/images/menu/{target_path.name}'
    except Exception:
        return ''


if __name__ == '__main__':
    workbook = openpyxl.load_workbook(WORKBOOK_PATH, data_only=True)

    categories = read_table(workbook['Categories'])
    sub_categories = read_table(workbook['sub_categories'])
    menu_items = read_table(workbook['menu_items'])

    categories_by_id = {str(item.get('CategoryID', '')): item for item in categories if item.get('CategoryID') is not None}
    subcategories_by_id = {str(item.get('SubcategoryID', '')): item for item in sub_categories if item.get('SubcategoryID') is not None}

    normalized_items = []
    for index, item in enumerate(menu_items):
        category_id = str(item.get('CategoryID', ''))
        subcategory_id = str(item.get('SubcategoryID', ''))

        category_name = categories_by_id.get(category_id, {}).get('CategoryName', '') if category_id else ''
        subcategory_name = subcategories_by_id.get(subcategory_id, {}).get('SubcategoryName', '') if subcategory_id else ''

        image_url = normalize_image_url(item.get('Image', ''))
        local_image_path = download_image(image_url, item.get('Name', ''), item.get('ItemID', index + 1))

        normalized_items.append({
            'Category': category_name,
            'Subcategory': subcategory_name,
            'Name': item.get('Name', ''),
            'Description': item.get('Description', ''),
            'Price': item.get('Price', ''),
            'Veg': normalize_bool(item.get('Veg')),
            'Available': normalize_bool(item.get('Available')),
            'Popular': normalize_bool(item.get('Bestseller')),
            'ChefSpecial': 'No',
            'PrepTime': '',
            'Spice': 'Mild',
            'ImageURL': local_image_path or image_url
        })

    payload = {
        'hero': {
            'title': 'Crafted for every craving',
            'description': 'Discover our signature beverages, comfort plates, and sweet endings.'
        },
        'categories': [item.get('CategoryName', '') for item in categories if item.get('CategoryName')],
        'items': normalized_items
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2), encoding='utf-8')
    print(f'Generated {OUTPUT_PATH} with {len(normalized_items)} menu items')
