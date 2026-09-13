# Hackathon Radar

An AI agent built for the Anakin Forge Hackathon that reads live hackathon platforms, 
reasons about which ones fit your profile, and registers you automatically.

## What it does

- **Browse**: Reads live listings from Unstop, Devfolio, Devpost, and MLH using Anakin's 
  web-reading API
- **Reason**: Uses Gemini to extract structured hackathon data and score relevance 
  against your profile
- **Act**: Fills registration forms via Playwright browser automation, with a 
  human-in-the-loop confirmation step before anything is submitted

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js, Express, MongoDB
- APIs: Anakin (web reading), Google Gemini (reasoning)
- Automation: Playwright

## Live Demo

Frontend: https://hackathon-radar-frontend.vercel.app/
Backend: https://hackathon-radar-backend.onrender.com

## Safety Design

Registration actions go through a self-hosted mock form rather than real hackathon 
platforms, to avoid ToS violations and unwanted automated submissions on live sites. 
Every action requires explicit user confirmation before submitting.
