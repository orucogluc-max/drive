# DRIVE

> **Transform your road trips into beautiful stories worth sharing.**

DRIVE is a social platform for automotive enthusiasts. It allows users to record their driving journeys, overlay stunning local telemetry data on their photos, and export them into highly aesthetic, magazine-quality visual formats for social media sharing. 

## Core Principles
- **Aesthetic Excellence:** Every output looks like a Porsche advertisement.
- **Zero Paid AI:** 100% on-device rendering, phone sensors, and custom deterministic algorithms. We respect your privacy.
- **Social First:** Kilometers don't matter as much as the memories made. 

## Technology Stack
- **Frontend / Mobile:** React Native (Expo)
- **Mapping:** MapLibre GL
- **Backend / Database:** Supabase, PostgreSQL, PostGIS
- **Rendering:** Local ViewShot Canvas rendering
- **Styling:** Custom JSON Theme Engine

## Quick Start
1. Clone the repository: `git clone https://github.com/orucogluc-max/drive.git`
2. Install dependencies: `cd drive-mobile && npm install`
3. Start Expo: `npx expo start`
4. Setup Supabase: Run the migrations found in `drive-mobile/supabase/migrations/`.

## Documentation
For more detailed information, please read:
- [PRODUCT_VISION.md](./PRODUCT_VISION.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
