# Backend deployment

The mobile app calls `https://abc-self-psi.vercel.app/api`. Its announcements
use `GET` and `POST /api/notifications`, plus `PUT` and `DELETE
/api/notifications/:id`. These routes are registered in `index.js` before the
404 handler. Personal inbox routes use `/api/student-notifications`.

If the hosted API returns `Route not found: /api/notifications` while
`/api/health` works, check that the hosted project deploys this backend's latest
source. Changing the mobile app URL path or rebuilding the APK does not add
missing routes to a deployed backend.

## Vercel

1. Open the existing Vercel project serving `abc-self-psi.vercel.app`.
2. Verify its Git repository and production branch contain the current backend.
3. Set **Root Directory** to `Backend` when deploying this repository. Use the
   **Express** framework preset and its default build settings.
4. Ensure the existing production `DATABASE_URL` environment variable is set.
5. Deploy the latest source to production. Redeploying an older deployment
   rebuilds that older source and will still omit the announcement routes.

Alternatively, deploy the local backend with the Vercel CLI from PowerShell:

```powershell
Set-Location -LiteralPath (Join-Path (git rev-parse --show-toplevel).Trim() 'Backend')
npx vercel@latest login
npx vercel@latest link
# Select the existing project serving abc-self-psi.vercel.app.
npx vercel@latest --prod
```

`index.js` exports the complete Express application, following
[Vercel's Express deployment support](https://vercel.com/docs/frameworks/backend/express).
Vercel imports it without starting a local listener or running the database seed
job. `npm start` and `npm run dev` still start the local server and initialize
the database. Notification routes create their tables on first use.

After deployment, verify the hosted endpoints:

```powershell
npm run verify-api
Invoke-RestMethod 'https://abc-self-psi.vercel.app/api/health'
Invoke-RestMethod 'https://abc-self-psi.vercel.app/api/notifications'
Invoke-RestMethod 'https://abc-self-psi.vercel.app/api/notifications/unread-count'
```

The notifications list should return `success: true` and a `data` array. Then
post an announcement from the admin screen and check the student announcements
tab. The APK already uses the correct URL, so this backend deployment does not
require an APK rebuild.

`npm run verify-api` checks the health, announcement list/count, personal inbox
count, and announcement POST validation without publishing an announcement. It
exits with a failure if any required route is missing.

For local development, set `EXPO_PUBLIC_API_URL=http://localhost:5000/api` in
`Frontend/.env.local` and reload the app. A physical phone needs your computer's
LAN address instead of `localhost`. Leave this variable unset to use the hosted
HTTPS backend in web and APK builds. Expo embeds this value when bundling.

After changing the frontend, create a new installable Android APK with
`npx eas-cli@latest build --platform android --profile preview` from `Frontend`.
The installed APK needs a rebuild to include frontend layout changes; deploying
missing backend routes fixes the existing APK's API error.
