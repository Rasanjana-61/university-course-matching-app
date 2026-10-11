# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Build an Android APK from PowerShell

The app directory is `Frontend` in both the filesystem and Git. Always enter it
with that exact casing: EAS derives its Linux build directory from the launch
path, so launching from `frontend` can make it look for a nonexistent directory.
The lowercase `name` in `package.json` does not control the app directory.

From anywhere inside this repository:

```powershell
$repoRoot = (git rev-parse --show-toplevel).Trim()
Set-Location -LiteralPath (Join-Path $repoRoot 'Frontend')
```

Inspect the upload before building. Keep the output outside the repository:

```powershell
$archiveOutput = Join-Path $env:TEMP ('university-eas-archive-' + [guid]::NewGuid().ToString('N'))
npx eas-cli@latest build:inspect --platform android --profile preview --stage archive --output "$archiveOutput"
if ($LASTEXITCODE -ne 0) { throw 'EAS archive inspection failed.' }
$archivedApp = Get-ChildItem -LiteralPath $archiveOutput -Directory | Where-Object { $_.Name -ceq 'Frontend' }
if (-not $archivedApp -or -not (Test-Path -LiteralPath (Join-Path $archivedApp.FullName 'package.json'))) {
    throw 'The archive must contain Frontend/package.json with this exact directory casing.'
}
```

The repository-root `.easignore` excludes backend files, Git history, local
environment files, signing files, and generated output. It keeps the app's
package manifests, Expo configuration, EAS configuration, source, and assets.

Build using the existing linked EAS project and signing credentials:

```powershell
npx eas-cli@latest build --platform android --profile preview --clear-cache
```

The `preview` profile uses internal distribution and explicitly produces an APK.
It also increments the Android `versionCode` using the existing EAS remote
version source when the build starts. Keep the same linked project and signing
credentials so the APK can update the installed app.
The API service uses `https://abc-self-psi.vercel.app/api` on every platform.

The installed launcher name is **CAREER MATCH**. Launcher assets reuse the
welcome screen's white Ionicons `school` glyph on `Brand.primary` (`#1A56DB`).
The 1024px adaptive foreground and themed monochrome icon have transparent
padding, with the cap inside Android's 66/108 safe circle. The adaptive
background uses the brand color directly, without the old Expo background
image. Asset provenance is documented in `assets/images/career-match-icons.md`.
There is no checked-in native Android project; EAS generates its launcher name
and icon resources from `app.json`.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
