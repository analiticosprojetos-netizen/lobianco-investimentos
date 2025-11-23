# AI Development Rules for Lobianco Investimentos

This document provides guidelines for the AI developer to ensure consistency, maintainability, and adherence to the project's architecture.

## Tech Stack Overview

This is a classic web application built with a vanilla frontend and a Node.js backend.

*   **Frontend:** Plain HTML, CSS, and modern Vanilla JavaScript (ES6+). No frontend frameworks like React or Vue are used.
*   **Backend:** A Node.js server using the Express.js framework to create and manage the API.
*   **Database & Storage:** Supabase is used for both the PostgreSQL database and file storage (for images like logos, banners, and property photos).
*   **Styling:** Bootstrap 5 is the primary CSS framework for layout, components, and responsive design. Custom styles are applied via `frontend/style.css`.
*   **Icons:** The project uses both [Font Awesome](https://fontawesome.com/) and [Bootstrap Icons](https://icons.getbootstrap.com/), loaded via CDN.
*   **API Communication:** The frontend communicates with the backend using the native `fetch` API, wrapped in a helper function.
*   **Deployment:** The application is configured for deployment on Vercel.

## Library and Framework Usage Rules

### Styling & CSS

*   **Primary Tool:** Always use Bootstrap 5 classes for layout (Grid, Flexbox), components (Modals, Cards, Carousels, Navbar), and utility classes (spacing, colors, etc.).
*   **Custom Styles:** For branding-specific styles (like custom color schemes defined by the user) or minor adjustments that Bootstrap can't handle, add rules to `frontend/style.css`. Avoid overriding Bootstrap components extensively.
*   **Chatbot:** All styles related to the chatbot widget must be kept isolated in `frontend/chatbot.css`.

### Icons

*   **Choice:** You can use either Font Awesome or Bootstrap Icons, as both are available.
*   **Consistency:** Prefer Bootstrap Icons (`<i class="bi bi-...">`) to maintain consistency with the main framework, but using Font Awesome (`<i class="fas fa-...">`) is acceptable if a specific icon is not available in the Bootstrap set.

### Backend (Node.js / Express)

*   **API Routes:** All API endpoints must be defined in `backend/api.js`.
*   **Database Operations:** All interactions with the database (queries, inserts, updates, deletes) and file storage **must** go through the official `@supabase/supabase-js` client instance already configured in `api.js`. Do not attempt to connect to the database with any other library.

### Frontend (JavaScript)

*   **Core:** Write all frontend logic in plain, modern Vanilla JavaScript. **Do not introduce jQuery or other DOM manipulation libraries.**
*   **File Structure:**
    *   Main application logic (loading properties, handling modals, forms) belongs in `frontend/script.js`.
    *   Chatbot-specific logic belongs in `frontend/chatbot.js`.
*   **API Calls:** All requests to the backend API must use the `fetch` API. Utilize the existing `apiCall()` helper function in `script.js` for error handling and consistency.

### Package Management

*   **Frontend:** Keep third-party libraries (like Bootstrap, Font Awesome) loaded via CDN as defined in `frontend/index.html`. Do not add frontend packages to `package.json`.
*   **Backend:** Before adding a new Node.js dependency, verify that its functionality cannot be achieved with the existing packages (Express, Supabase client, etc.). Keep the backend lean.