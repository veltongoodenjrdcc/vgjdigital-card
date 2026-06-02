# VGJ Digital Card Site

Standalone static site for `card.vgjdigital.com`.

## Routes

- `/velton/`
- `/judith/`
- `/neko/`

Each route includes its own `.vcf` file and uses the shared assets in `/assets/`.

## Deploy

Use the deployment script so only public static assets are uploaded to Cloudflare Pages:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-pages.ps1
```

Do not deploy the repository root directly with `wrangler pages deploy .`; that can include local tool folders.
