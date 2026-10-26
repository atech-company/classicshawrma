# Classic Shawarma frontend

Bilingual (Arabic / English) ordering website and admin dashboard built with Next.js. This repository contains **only the frontend**. The Laravel API lives in the sibling `backend/` folder and must be deployed separately.

## Local development

Requirements: Node.js 20+.

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to the Laravel API, normally `http://localhost:8000/api`. The restaurant UUID is already set in `.env.example`.

## Deploy the frontend to Vercel

Import this frontend-only GitHub repository into Vercel. The repository root is the Next.js project root, so use the detected Next.js framework settings and the default install/build commands.

Set these Vercel production environment variables before deploying:

| Variable | Production value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://classicshwarma.atechleb.com/api` |
| `NEXT_PUBLIC_RESTAURANT_UUID` | `54ac0973-bcbf-467a-a7f9-6e29127167c7` |
| `NEXT_PUBLIC_SITE_URL` | `https://classicshwarma.vercel.app` |

After deployment, confirm the `classicshwarma.vercel.app` domain is assigned to the Vercel project and redeploy if environment variables were added after the first build.

## Deploy the Laravel API to shared hosting

Deploy the sibling `backend/` Laravel project separately; it is intentionally excluded from this GitHub repository. Configure `classicshwarma.atechleb.com` as an HTTPS subdomain whose document root points to `backend/public`. Keep `.env`, `vendor/`, and the rest of the Laravel project outside the public web root. If the host cannot point a subdomain directly to `backend/public`, follow the host's Laravel deployment method rather than exposing the project root.

Confirm the plan supports PHP 8.3, Composer, Laravel rewrite rules, and MySQL. Create a production database and set the backend environment values:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://classicshwarma.atechleb.com
DB_CONNECTION=mysql
DB_HOST=<host-provided database host>
DB_DATABASE=<production database name>
DB_USERNAME=<production database user>
DB_PASSWORD=<strong production database password>
FILESYSTEM_DISK=public
CORS_ALLOWED_ORIGINS=https://classicshwarma.vercel.app
RESTAURANT_PUBLIC_UUID=54ac0973-bcbf-467a-a7f9-6e29127167c7
ADMIN_EMAIL=<admin email>
ADMIN_PASSWORD=<unique strong admin password>
```

Generate a production-only `APP_KEY`; do not copy local credentials or commit `.env`. Install Composer dependencies for production, run migrations with `--force`, seed the restaurant and admin account as needed, and create Laravel's public storage link. Enable HTTPS for the subdomain. The backend must return uploaded images under `https://classicshwarma.atechleb.com/storage/...`; that host is allowed by the frontend image configuration.

Once both deployments are live, verify the public menu and image uploads from the Vercel site, then sign in at `/admin/login` and check that item management and order updates can reach the API.
