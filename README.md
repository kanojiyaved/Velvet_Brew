# Velvet Brew QR Menu

A premium, responsive QR menu website for a café built with HTML, CSS, JavaScript, Bootstrap, GSAP, Google Sheets, and Google Apps Script.

## Features
- Premium landing page with glassmorphism and GSAP animation
- Dynamic digital menu loaded from Google Sheets
- Instant search and category filters
- Responsive layout for mobile and desktop
- Single-QR-code flow for café customers

## Project Files
- [index.html](index.html) – landing page
- [menu.html](menu.html) – interactive menu experience
- [assets/css](assets/css) – stylesheets
- [assets/js](assets/js) – frontend behavior and data fetching
- [appscript/Code.gs](appscript/Code.gs) – Apps Script backend

## Google Sheets Setup
1. Create a new Google Sheet with headers:
   - ID
   - Category
   - Name
   - Description
   - Price
   - ImageURL
   - Veg
   - Available
   - Popular
   - ChefSpecial
   - PrepTime
   - Spice
2. Add sample rows for menu items.
3. Copy the spreadsheet ID from the URL and replace it in [appscript/Code.gs](appscript/Code.gs).
4. Deploy the script as a web app and replace the URL in [assets/js/api.js](assets/js/api.js).

## Apps Script Deployment
1. Open Google Apps Script.
2. Create a new project.
3. Paste the contents of [appscript/Code.gs](appscript/Code.gs).
4. Add [appscript/appsscript.json](appscript/appsscript.json) as project settings.
5. Deploy as a web app with access set to Anyone.
6. Copy the web app URL and replace the placeholder in [assets/js/api.js](assets/js/api.js).

## Local Preview
Open [index.html](index.html) in a browser or use a simple static server.

## Deploy to GitHub Pages or Netlify
- GitHub Pages: push the project to a repository and enable Pages from the root folder.
- Netlify: drag and drop the project folder into Netlify or connect a Git repository.

## Generate a QR Code
Use any QR generator and point it to your deployed website URL.
