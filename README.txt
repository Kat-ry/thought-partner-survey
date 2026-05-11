# Thought Partner Survey

## Setup (first time)

1. Create a folder called `thought-partner-survey`
2. Put all four files inside it: `index.html`, `server.js`, `package.json`, `README.md`
3. Open the folder in VS Code
4. Open the VS Code terminal (`Ctrl+`` ` or Terminal → New Terminal)

## Run locally

```bash
node server.js
```

Open http://localhost:3000 in your browser — the survey is live.

## Share with your team (using ngrok)

1. Install ngrok: https://ngrok.com/download (free account needed)
2. In a **second terminal** tab, run:

```bash
ngrok http 3000
```

3. Ngrok gives you a public URL like `https://abc123.ngrok.io`
4. **Before sharing**, open `index.html` and update this line near the top of the `<script>`:

```js
const API = 'https://abc123.ngrok.io'; // ← paste your ngrok URL here
```

5. Save the file, restart the server (`Ctrl+C` then `node server.js`), and share the ngrok URL with your team.

## View results

- Open the survey URL in your browser
- Click **"View results →"** at the bottom of the intro screen
- Password: `thoughtpartner2025`

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial survey"
git remote add origin https://github.com/YOUR_USERNAME/thought-partner-survey.git
git push -u origin main
```

## Deploy permanently (free on Render)

1. Push to GitHub (above)
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Set:
   - **Build command:** (leave empty)
   - **Start command:** `node server.js`
5. Deploy — Render gives you a permanent URL like `https://thought-partner-survey.onrender.com`
6. Update the `const API = '...'` line in `index.html` with that URL
7. Push the change to GitHub — Render redeploys automatically

## Change the admin password

In `index.html`, find this line and update it:

```js
const ADMIN_PW = 'thoughtpartner2025';
```
