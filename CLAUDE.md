# CLAUDE.md — Grocy Codebase Guide

## Project Overview

Grocy is a **self-hosted household management ERP system** (PHP/SQLite web app). It manages grocery inventory, shopping lists, recipes, chores, tasks, and equipment/battery tracking. Current version: **4.6.0** (March 2026).

Demo: https://demo.grocy.info

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | PHP 8.5, Slim Framework 4 |
| Database | SQLite 3.40+ via LessQL ORM |
| DI Container | PHP-DI 7 |
| Templating | Blade (via slim-blade-view) |
| Frontend | Bootstrap 4.5, jQuery 3.6, DataTables.net |
| Barcode scanning | ZXing.js (camera, client-side) |
| Charts | Chart.js 2.8 |
| PHP packages | Composer (PSR-4 autoloader) |
| JS packages | Yarn / npm |
| Code style | PHP-CS-Fixer |

Required PHP extensions: `fileinfo`, `pdo_sqlite`, `gd`, `ctype`, `intl`, `zlib`, `mbstring`

---

## Directory Structure

```
/
├── app.php                  # Bootstrap: DI container, middleware stack, routing
├── routes.php               # All 100+ route definitions
├── config-dist.php          # Default configuration template (copy to data/config.php)
├── version.json             # Current version (triggers migrations on change)
├── grocy.openapi.json       # Full REST API OpenAPI/Swagger spec
├── public/
│   ├── index.php            # Web entry point (validates PHP prereqs, loads app.php)
│   ├── css/                 # Compiled CSS and third-party stylesheets
│   ├── js/                  # Third-party JS libraries
│   └── viewjs/              # Feature-specific JS files (one per view)
├── controllers/
│   ├── BaseController.php   # Base for HTML controllers (view rendering, service access)
│   ├── BaseApiController.php # Base for API controllers (JSON, filtering, sanitization)
│   └── */                   # Feature controllers (Stock, Recipes, Chores, etc.)
├── services/
│   ├── BaseService.php      # Singleton base, provides access to other services
│   ├── StockService.php     # Core inventory logic (1800+ lines)
│   └── *.php                # Feature services
├── middleware/
│   ├── AuthMiddleware.php   # Abstract auth (session, reverse proxy, LDAP, API key)
│   ├── LocaleMiddleware.php # Sets locale from user settings
│   ├── CorsMiddleware.php   # CORS headers
│   └── JsonMiddleware.php   # JSON request parsing
├── helpers/
│   └── extensions.php       # Global utility functions, config loading
├── views/
│   ├── layout/              # Master Blade layout templates
│   ├── components/          # Reusable Blade components
│   └── */                   # Feature view templates
├── migrations/              # 252+ SQL/PHP migration files (0001.sql … 0252.sql)
├── localization/            # 35+ PO translation files
├── plugins/                 # Barcode lookup plugins
├── data/                    # Runtime directory (config, SQLite DB, cache)
│   └── settingoverrides/    # Per-setting override .txt files (highest priority)
└── .devtools/               # Development scripts (Windows .bat)
```

---

## Architecture

### Request Flow

```
HTTP Request
    → public/index.php
    → Slim App (app.php)
    → Middleware stack:
        LocaleMiddleware → AuthMiddleware → CorsMiddleware → JsonMiddleware
    → Router (routes.php)
    → Controller::method()
    → Service layer
    → LessQL ORM → SQLite
    → Response (HTML via Blade / JSON for API)
```

### Service Layer Pattern

All services extend `BaseService` and use the singleton pattern:

```php
// Access a service
$stockService = StockService::getInstance();

// Inside a service, access other services via BaseService helpers
$this->getStockService();
$this->getChoresService();
$this->getRecipesService();
$this->getUsersService();
$this->getDatabaseService();  // Returns LessQL connection
```

### Database Access

```php
// Get the LessQL connection
$db = DatabaseService::getInstance()->GetDbConnection();

// Query examples (LessQL ORM)
$products = $this->getDatabase()->products()
    ->where('active = 1')
    ->orderBy('name')
    ->fetchAll();

// Specific row by ID
$product = $this->getDatabase()->products($id);

// Joined query
$stockRows = $this->getDatabase()->stock()
    ->leftJoin('products ON stock.product_id = products.id')
    ->where('stock.open = 1');
```

### Controller Hierarchy

- **`BaseController`** — HTML views via Blade; `$this->renderPage('view-name', $args)`
- **`BaseApiController`** — JSON responses; `$this->renderSuccessfulApiResponse($data)` / `$this->renderErrorResponse()`
- Controllers access services through inherited `getXxxService()` methods

### Authentication Modes

Configured via `GROCY_AUTH_CLASS` setting:

| Mode | Class | Description |
|------|-------|-------------|
| `DefaultAuthMiddleware` | Session-based login | Default |
| `ReverseProxyAuthMiddleware` | Trust proxy headers | Reverse proxy setups |
| `LdapAuthMiddleware` | LDAP integration | Enterprise/self-hosted |

API requests use `ApiKeyAuthMiddleware` (header name configurable, default: `GROCY-API-KEY`).

---

## Coding Conventions

### PHP Style (enforced by PHP-CS-Fixer)

- **Indentation**: Tabs (not spaces)
- **Quotes**: Single quotes for strings
- **Arrays**: Short syntax `[]` not `array()`
- **Braces**: Opening brace on next line for classes/functions
- **Standard**: PSR-2 based with customizations in `.php-cs-fixer.php`

```php
// Correct style
class StockController extends BaseController
{
	public function Overview(Request $request, Response $response, array $args): Response
	{
		$items = $this->getStockService()->GetCurrentStock();
		return $this->renderPage($response, 'stock-overview', [
			'items' => $items,
		]);
	}
}
```

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Classes | PascalCase | `StockController`, `StockService` |
| Methods | PascalCase | `GetCurrentStock()`, `AddProduct()` |
| Helper functions | PascalCase | `FindObjectInArrayByPropertyValue()` |
| Routes | kebab-case | `/stock-overview`, `/shopping-list` |
| DB tables | snake_case | `stock_current`, `quantity_units` |
| DB columns | snake_case | `best_before_date`, `product_id` |
| Config constants | SCREAMING_SNAKE_CASE | `GROCY_CURRENCY`, `FEATURE_FLAG_STOCK` |
| JS files in viewjs/ | kebab-case | `stock-overview.js` |

### Namespaces (PSR-4)

```
Grocy\Controllers\   → controllers/
Grocy\Services\      → services/
Grocy\Middleware\    → middleware/
Grocy\Helpers\       → helpers/
```

---

## Configuration System

Configuration uses a cascading priority (highest to lowest):

1. Files in `data/settingoverrides/<SETTING_NAME>.txt`
2. Environment variables prefixed with `GROCY_` (e.g., `GROCY_CURRENCY=USD`)
3. Values in `data/config.php` (user's copy of `config-dist.php`)
4. Defaults in `config-dist.php`

Access via the global `Setting()` helper:
```php
$currency = Setting('GROCY_CURRENCY');
$baseUrl = Setting('BASE_URL');
```

### Key Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `GROCY_MODE` | `production` | `production`, `dev`, `demo`, `prerelease` |
| `GROCY_AUTH_CLASS` | `DefaultAuthMiddleware` | Auth method |
| `BASE_URL` | `/` | Base URL (for subdirectory installs) |
| `FEATURE_FLAG_STOCK` | `true` | Enable stock management |
| `FEATURE_FLAG_SHOPPINGLIST` | `true` | Enable shopping list |
| `FEATURE_FLAG_RECIPES` | `true` | Enable recipes |
| `FEATURE_FLAG_CHORES` | `true` | Enable chores |
| `FEATURE_FLAG_TASKS` | `true` | Enable tasks |
| `FEATURE_FLAG_BATTERIES` | `true` | Enable battery tracking |

---

## Database Migrations

Migrations live in `/migrations/` as numbered files (`0001.sql` through `0252+.sql`, some `.php` for complex logic).

**Auto-execution**: Migrations run automatically when `version.json` changes or when `BASE_URL`/`BASE_PATH` configuration changes. They are triggered on the root route (`/`) access.

**Important**: Migrations only guarantee correctness between official releases, not between arbitrary commits.

When adding a new migration:
1. Create the next numbered file: `migrations/XXXX.sql` (or `.php` if PHP logic is needed)
2. Do not modify existing migration files
3. Increment the version in `version.json`

---

## REST API

- Full OpenAPI spec in `grocy.openapi.json`
- All API routes prefixed with `/api/`
- Authentication: `GROCY-API-KEY` header (default name; configurable)
- Response format: JSON

### Query Filtering (GET endpoints)

```
GET /api/objects/products?query[]=name=Rice&query[]=active=1
```

Operators: `=`, `!=`, `~` (LIKE), `!~` (NOT LIKE), `<`, `>`, `<=`, `>=`, `§` (REGEXP)

Pagination: `?limit=25&offset=0`
Sorting: `?order=name:asc`

### HTML Sanitization

All request body content is sanitized via HTMLPurifier in `BaseApiController`. Do not add redundant sanitization in individual controllers.

---

## Localization

- 35+ languages via Transifex
- PO file format in `/localization/`
- In PHP: `__t('Key')` for singular, `__n('Key', $count)` for plurals
- In Blade views: `{{ __t('Key') }}`
- Transifex tools in `.devtools/` (Windows batch files)

---

## Feature Flags in Views

All feature flags are automatically injected into Blade views. Use them for conditional rendering:

```blade
@if($FEATURE_FLAG_STOCK)
    {{-- Stock-related UI --}}
@endif
```

---

## Helpers Reference (`helpers/extensions.php`)

```php
// Array utilities
FindObjectInArrayByPropertyValue($array, $property, $value)
FindAllObjectsInArrayByPropertyValue($array, $property, $value)
SumArrayValue($array, $key)

// String utilities
string_starts_with($haystack, $needle)
string_ends_with($haystack, $needle)
IsJsonString($string)
RandomString($length)

// Type conversion
BoolToString($bool)   // "true" / "false"
BoolToInt($bool)      // 1 / 0

// Settings & config
Setting($key)         // Get config value with cascade
DefaultUserSetting($key)  // Get user setting default

// User info
GetUserDisplayName($userId)
GetClassConstants($class)

// Filesystem
EmptyFolder($path)
```

---

## User Permissions

Permissions are checked in controllers using the `User` model:

```php
User::checkPermission($request, User::PERMISSION_STOCK_PURCHASE);
User::checkPermission($request, User::PERMISSION_ADMIN);
```

Permission constants are defined in `controllers/Users/User.php`. In `dev`, `demo`, and `prerelease` modes, auth is disabled and user ID 1 is always used.

---

## Special Modes

| Mode | Behavior |
|------|---------|
| `production` | Full auth, no demo data |
| `dev` | Auth disabled, user ID 1 |
| `demo` | Auth disabled, demo data generated on migration |
| `prerelease` | Like demo, for preview releases |
| Embedded | `embedded.txt` present → alt data dir, auth off (used by Grocy Desktop) |

---

## Development Workflow

### Install Dependencies

```bash
composer install
yarn install   # or: npm install
```

### Code Style

```bash
vendor/bin/php-cs-fixer fix   # Auto-fix PHP style issues
```

The project uses tab indentation — ensure your editor is configured accordingly.

### Running Locally

Grocy requires a web server with PHP. For development:

```bash
php -S localhost:8080 -t public/
```

Or configure Apache/Nginx pointing `public/` as document root.

### Adding a New Feature

1. **Migration**: Add `migrations/XXXX.sql` with schema changes
2. **Service**: Add/extend a service in `services/` extending `BaseService`
3. **Controller**: Add controller in `controllers/` extending `BaseController` (web) or `BaseApiController` (API)
4. **Routes**: Register routes in `routes.php`
5. **View**: Add Blade template in `views/`
6. **JS**: Add `public/viewjs/<feature>.js` for view-specific JavaScript
7. **API spec**: Update `grocy.openapi.json` for new API endpoints
8. **Localization**: Add translation keys (strings handled via Transifex)

### Adding a New API Endpoint

1. Add route to `routes.php` under the `/api/` prefix
2. Add method to the relevant `*ApiController` (or create new one extending `BaseApiController`)
3. Use `$this->renderSuccessfulApiResponse($data)` for success
4. Use `$this->renderErrorResponse('message', 400)` for errors
5. Document in `grocy.openapi.json`

---

## Key Files Quick Reference

| File | Purpose |
|------|---------|
| `public/index.php` | Entry point, PHP prereq validation |
| `app.php` | DI setup, middleware registration |
| `routes.php` | All route definitions |
| `config-dist.php` | Configuration reference (all settings documented) |
| `version.json` | Version string |
| `controllers/BaseController.php` | Base for web controllers |
| `controllers/BaseApiController.php` | Base for API controllers |
| `services/BaseService.php` | Singleton base for services |
| `services/StockService.php` | Core inventory logic |
| `helpers/extensions.php` | Global utility functions |
| `grocy.openapi.json` | REST API specification |
| `.php-cs-fixer.php` | Code style configuration |

---

## Common Pitfalls

- **Tab vs spaces**: The project uses **tabs**. PHP-CS-Fixer will reject spaces.
- **Method casing**: Methods use PascalCase even for CRUD operations (`GetProducts()`, not `getProducts()`).
- **Singleton services**: Do not use `new XxxService()`. Always use `XxxService::getInstance()`.
- **No direct DB access in controllers**: Use services for all business logic and data access.
- **Migrations are append-only**: Never modify existing migration files; always add new ones.
- **HTML sanitization**: Already handled in `BaseApiController` — do not add redundant sanitization.
- **Settings must use `Setting()`**: Do not read `$_ENV` or `getenv()` directly; use the `Setting()` helper for the cascade to work.
