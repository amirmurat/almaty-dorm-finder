# DormEase - Student Dormitory Booking Platform

Front-end only MVP with map view and demo payment system.

## Project info

**URL**: https://lovable.dev/projects/c05fbddd-f6de-422d-9d14-fcc95fe178fb

## Features

- Search and filter dorms by university, price, distance, gender policy
- Interactive static map view with pan/zoom controls
- Demo payment checkout (no real transactions)
- Request submission and tracking
- Fully responsive design

## Data Structure

### Dorm Locations
All dorms include `mapX`, `mapY` coordinates (0-1024 range) for static map positioning and `geo` coordinates for future integration.

### LocalStorage Keys
- `dormRequests` - User submitted requests
- `eventLog` - Analytics events
- `demoPayments` - Demo payment records (no card data stored)

## How to Reset State

Clear browser localStorage:
```javascript
localStorage.removeItem('dormRequests');
localStorage.removeItem('eventLog');
localStorage.removeItem('demoPayments');
```

## Tracked Events

Map: `toggle_map_list`, `open_map`, `map_pan`, `map_zoom`, `map_marker_click`, `map_open_request`, `map_view_details`

Payment: `start_checkout_demo`, `submit_checkout_demo`, `mock_pay_success`, `mock_pay_decline`, `view_demo_receipt`

## Accessibility

- Keyboard navigation: Tab cycles through markers, Enter/Space activates
- All interactive elements have aria-labels
- Focus visible on all controls

## Demo Limitations

- Static basemap (no live tiles)
- No real payment processing
- Card details immediately discarded (never stored)
- All data stored locally in browser

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c05fbddd-f6de-422d-9d14-fcc95fe178fb) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c05fbddd-f6de-422d-9d14-fcc95fe178fb) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
