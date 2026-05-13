# Food Rescue Platform — Full-Stack Laravel 11 + React

A complete single-project full-stack app: **Laravel 11** backend serves both
the API **and** the React SPA (built with **Vite + Tailwind**). One codebase,
one server (`php artisan serve`), one MySQL database. Ready for Laragon / XAMPP.

## Stack
- **PHP 8.3 / Laravel 11** — API + Blade shell + Vite integration
- **Laravel Sanctum** — Bearer-token API auth
- **MySQL 8** — phpMyAdmin friendly
- **React 18 + React Router 6** — bundled by Vite from `resources/js/`
- **Tailwind CSS 3**
- **lucide-react** + **sonner** (toasts)

## Folder layout
```
food-rescue/
├── app/
│   ├── Models/                    User, Food, FoodRequest, Delivery, SystemAnalytic
│   ├── Http/
│   │   ├── Controllers/Api/       Auth, Food, Request, Delivery, Admin
│   │   ├── Middleware/            RoleMiddleware (registered as 'role')
│   │   └── Resources/             User/Food/Request/Delivery (no envelope wrapping)
│   └── Providers/                 AppServiceProvider (disables JsonResource wrapping)
├── bootstrap/                     Laravel 11 minimal kernel
├── config/                        app, auth, database, sanctum, cors
├── database/
│   ├── migrations/                users, sanctum, foods, requests, deliveries, system_analytics
│   └── seeders/                   DatabaseSeeder (admin + 3 demo users + sample listings)
├── public/                        index.php, .htaccess  (Laragon root)
├── resources/
│   ├── css/app.css                Tailwind + Outfit/Tajawal fonts + RTL
│   ├── js/                        REACT FRONTEND
│   │   ├── app.jsx                Vite entry + Router
│   │   ├── lib/api.js             Axios + Bearer token interceptor
│   │   ├── context/               AuthContext, LangContext (AR/EN + RTL)
│   │   ├── components/            Layout (Topbar/Sidebar), Status, Protected
│   │   └── pages/                 Landing, Login, Register, Browse, FoodDetails,
│   │                              MyRequests, Restaurant/Volunteer/Admin Dashboards
│   └── views/app.blade.php        SPA shell (loads Vite assets, mounts <div id="root">)
├── routes/
│   ├── api.php                    All /api/* endpoints
│   ├── web.php                    Catch-all → app.blade.php (SPA)
│   └── console.php
├── food_rescue.sql                Raw SQL for phpMyAdmin (optional)
├── package.json                   Vite + React + Tailwind
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── composer.json
├── artisan
├── .env.example
└── README.md  ← you are here
```

## Setup on Laragon (or XAMPP / plain PHP+MySQL)

```bash
# 1. PHP dependencies
composer install

# 2. JS dependencies
npm install

# 3. Environment
cp .env.example .env
php artisan key:generate

# 4. Edit .env so DB_* matches your MySQL/phpMyAdmin (default: db `food_rescue`, root, no password)
#    Create the DB in phpMyAdmin or:
mysql -u root -e "CREATE DATABASE food_rescue CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. Migrations + seeders (creates admin + 3 demo users + 4 listings)
php artisan migrate --seed

# 6. Build the React frontend ONCE (or run the dev server in step 7)
npm run build

# 7a. Production-style: just run Laravel — it serves the prebuilt SPA + API
php artisan serve            # http://localhost:8000

# 7b. Dev with hot reload: TWO terminals
# Terminal 1
npm run dev                  # Vite HMR on resources/js
# Terminal 2
php artisan serve            # http://localhost:8000
```

Visit **http://localhost:8000** → React landing page. All pages route through the same Laravel app.

> Laragon users: drop the project folder into `C:\laragon\www\food-rescue`,
> visit `http://food-rescue.test` (auto-virtual-host), then run the migrate /
> npm install / npm run build steps from the Laragon terminal.

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | **admin@gmail.com** | **admin** |
| Restaurant | restaurant@rescue.com | password123 |
| Beneficiary | beneficiary@rescue.com | password123 |
| Volunteer | volunteer@rescue.com | password123 |

> The admin login is **hardcoded** in `AuthController::login()` —
> `admin@gmail.com / admin` always authenticates as admin. Admin role is
> **never** registerable from the signup page (validation rule rejects it).

## API surface

All routes are under `/api/...`. The React frontend uses
`localStorage.token` + `Authorization: Bearer <token>`.

### Public
- `POST /auth/register`              role ∈ {restaurant, beneficiary, volunteer}
- `POST /auth/login`                 admin shortcut: `admin@gmail.com / admin`
- `GET  /food` · `GET /food/{id}`

### Authenticated
- `GET  /auth/me` · `POST /auth/logout`

### Restaurant
- `GET /food/mine` · `POST /food` · `PUT /food/{id}` · `DELETE /food/{id}`
- `GET /stats/restaurant`
- `GET /requests/restaurant` · `PATCH /requests/{id}/accept|reject`

### Beneficiary
- `POST /requests` · `GET /requests/mine`

### Volunteer
- `GET /deliveries/available` · `GET /deliveries/mine`
- `POST  /deliveries/{requestId}/accept`
- `PATCH /deliveries/{deliveryId}/status`   `{ status: on_the_way|picked_up|delivered }`

### Admin
- `GET    /admin/stats/overview`
- `GET    /admin/users` · `DELETE /admin/users/{id}`  (soft delete)
- `GET    /admin/foods` · `GET /admin/requests` · `GET /admin/deliveries`
- `GET    /admin/analytics`                        7-day series

## Database schema (matches the spec exactly)

```
users               id, full_name, email, password, phone, role,
                    is_deleted, deleted_at, created_at, updated_at

foods               id, user_id (FK users), title, description, quantity,
                    price, location, image_url, status (available|reserved|completed),
                    created_at, updated_at

requests            id, food_id (FK foods, UNIQUE), beneficiary_id (FK users),
                    type (pickup|delivery), notes, delivery_address,
                    status (pending|accepted|rejected|in_progress|completed),
                    created_at, updated_at

deliveries          id, request_id (FK requests, UNIQUE), volunteer_id (FK users),
                    status (on_the_way|picked_up|delivered),
                    created_at, updated_at

system_analytics    id, date (UNIQUE), meals_saved, active_deliveries,
                    success_rate, waste_reduction_rate
```

Relationships:
```
User (restaurant) hasMany   Foods
Food              hasOne    Request
User (beneficiary) hasMany  Requests
Request           hasOne    Delivery
User (volunteer)  hasMany   Deliveries
```

## Frontend pages (React)

| Route | Component | Roles |
|---|---|---|
| `/` | Landing | public |
| `/login` · `/register` | Auth + role selector (no admin in selector) | public |
| `/browse` · `/food/:id` · `/my-requests` | Browse / Details / Requests tracker | beneficiary |
| `/restaurant{,/listings,/requests}` | Add/Edit/Delete food, accept/reject requests, stats | restaurant |
| `/volunteer{,/mine}` | Available deliveries + status updates | volunteer |
| `/admin{,/users,/foods,/requests,/deliveries,/analytics}` | Read-only oversight + soft-delete users | admin |

UI is bilingual (EN/عربي) with full RTL — toggle in the topbar.

## Auth flow (Sanctum + Bearer tokens)

```
POST /api/auth/login  { email, password }
→ 200 { user: {...}, token: "1|abcd..." }

axios.defaults.headers.Authorization = "Bearer 1|abcd..."   // automatic
```

The token is persisted in `localStorage.token` by `AuthContext`.
On 401 responses or `logout()`, it is cleared.

## Troubleshooting

- **`could not find driver`** → enable `pdo_mysql` in `php.ini`.
- **`Vite manifest not found`** → run `npm run build` (or `npm run dev`).
- **CORS** → same-origin (Laravel serves both); CORS only kicks in if you point
  the React app at a different host via `VITE_API_URL`.
- **Laragon SSL** → use the plain `http://` host until you import a cert; set
  `APP_URL=http://food-rescue.test` to match.
- **Reset everything** → `php artisan migrate:fresh --seed`.

## License
MIT
