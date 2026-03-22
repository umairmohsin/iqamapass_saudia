# IqamaPass MVP

Privacy-first Next.js MVP for Pakistani expats in Saudi Arabia to track Iqama, passport, re-entry visa, family profiles, and travel compliance.

## Privacy model
- All user data is stored in the browser with `localStorage`
- No Supabase, database, or remote API is required for the MVP
- Nothing is uploaded to a server unless you later add your own backend

## Current tradeoffs
- Data is tied to one browser/device
- Clearing browser storage removes the account and all tracked data
- Email alerts are disabled in local-only mode; reminders appear in-app based on document urgency

## Setup
1. Install dependencies: `npm install`
2. Run locally: `npm run dev`
3. Open the app and create a local account on your device

## Notes
- Government ID numbers are never stored
- Trip calculations and document alerts run entirely on-device
- Family members are also stored only on the current device
