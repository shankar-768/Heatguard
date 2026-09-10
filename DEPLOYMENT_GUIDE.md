# HeatGuard AI - Complete Deployment Guide

This guide explains how to deploy **HeatGuard AI** to the cloud so anyone in the public or judging panel can access it online.

---

## Architecture Overview
HeatGuard AI is a full-stack application composed of:
1. **Frontend:** React 19 + TypeScript + Tailwind CSS built with Vite (compiled to `/dist`).
2. **Backend:** Express.js (`/server/index.js`) providing:
   - Live Weather Telemetry (`/api/weather`)
   - Reverse Geocoding & City Search (`/api/geocode/*`)
   - Authentication & Session Gateway (`/api/auth/*`)
   - User Profile Management (`/api/user/*`)
   - Static Asset Serving: In production, Express automatically serves the frontend `/dist` bundle with client-side SPA routing fallback.

---

## Option 1: Google Cloud Run (Recommended Container Deployment)

Google Cloud Run runs your container in Google Cloud's serverless infrastructure with auto-scaling and a free HTTPS domain.

### Step 1: Install Google Cloud SDK & Authenticate
If not already installed, install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install), then run:
```bash
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
```

### Step 2: Deploy directly from Source Code
Navigate to the `Heat Guard AI` folder and deploy:
```bash
cd "Heat Guard AI"
gcloud run deploy heat-guard-ai \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars WEATHER_API_KEY="YOUR_KEY_HERE",WEATHER_API_PROVIDER="weatherapi"
```

Cloud Run will automatically:
1. Build the multi-stage [Dockerfile](file:///./Dockerfile)
2. Bundle the Vite frontend & Express backend
3. Provide an instant, public HTTPS URL (e.g., `https://heat-guard-ai-xyz-uc.a.run.app`).

---

## Option 2: Render.com (Fastest 1-Click Zero-CLI Deployment)

[Render](https://render.com) offers free web services that auto-deploy from GitHub.

### Step 1: Push Code to GitHub
1. Create a repository on GitHub (e.g. `heat-guard-ai`).
2. Push your project code:
```bash
git init
git add .
git commit -m "Initial commit for HeatGuard AI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/heat-guard-ai.git
git push -u origin main
```

### Step 2: Create Web Service on Render
1. Go to [dashboard.render.com](https://dashboard.render.com/) and click **New + > Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Root Directory:** `Heat Guard AI` (if inside subfolder) or leave blank if repo root.
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Under **Environment Variables**, add:
   - `WEATHER_API_KEY`: *(Your WeatherAPI key)*
   - `WEATHER_API_PROVIDER`: `weatherapi`
   - `NODE_ENV`: `production`
5. Click **Create Web Service**. Your live URL will be ready at `https://heatguard-ai.onrender.com`.

---

## Option 3: Vercel

HeatGuard AI includes [vercel.json](file:///./vercel.json) and [api/index.js](file:///./api/index.js) ready for Vercel.

### Step 1: Install Vercel CLI (or connect GitHub)
Via npm:
```bash
npm install -g vercel
```
Or via [vercel.com](https://vercel.com): Import your GitHub repository.

### Step 2: Deploy
Run inside the `Heat Guard AI` folder:
```bash
vercel
```
Set the Environment Variables in the Vercel Dashboard:
- `WEATHER_API_KEY`: *(Your key)*
- `WEATHER_API_PROVIDER`: `weatherapi`

---

## Option 4: Railway.app

1. Go to [railway.app](https://railway.app) and click **New Project > Deploy from GitHub repo**.
2. Select your repository.
3. Railway automatically detects the [Dockerfile](file:///./Dockerfile) and starts the container on the allocated port.
4. Add environment variables in Railway's **Variables** tab.

---

## Environment Variables Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Listening port for Express | `5000` (Local) / `8080` (Cloud Run) |
| `WEATHER_API_PROVIDER` | Active weather provider | `weatherapi` or `openmeteo` |
| `WEATHER_API_KEY` | WeatherAPI.com API token | Paste your token |
| `NODE_ENV` | Environment mode | `production` |
