# System Architecture

DRIVE is built on a modern, mobile-first, serverless architecture that prioritizes performance, local rendering, and spatial data querying.

## 1. High-Level Architecture
- **Mobile Client:** React Native (Expo). Handles all UI, sensor data collection, and local image rendering.
- **Backend:** Supabase (PostgreSQL + PostGIS). Handles user authentication, data persistence, and geospatial queries.
- **Rendering Engine:** Local off-screen canvas using `react-native-view-shot` for zero-cost, high-quality image exports.

## 2. Directory Structure
```
drive-mobile/
├── src/
│   ├── components/
│   │   └── ui/         # Reusable UI components (Text, Button, Cards)
│   ├── lib/
│   │   ├── supabase.ts # Supabase client and edge function wrappers
│   │   └── themeEngine.ts # JSON-based theme registry
│   ├── screens/        # Main application screens (Home, Composer, Detail, Explore)
│   └── theme/          # Global design tokens (colors, spacing, typography)
├── supabase/
│   └── migrations/     # Database schema and RLS policies
```

## 3. Database Schema (Supabase)
Our database utilizes PostgreSQL with the **PostGIS** extension for geographic data.
- `profiles`: User data, avatars, bio, followers.
- `vehicles`: User's garage (Make, Model, Specs).
- `drives` (Journeys): The core entity. Contains geographic `LineString` for the route, metrics, and storytelling metadata.
- `drive_media`: Photo gallery associated with a Journey.
- `journey_interactions`: Social reactions (Inspired, Want to Drive, Wishlist).

### Data Privacy & RLS
We strictly enforce Row Level Security (RLS) on all tables. Users can only edit their own data. Public reads are restricted based on the user's visibility settings.

## 4. The JSON Theme Engine
Instead of hardcoding styles into components, DRIVE uses a custom `ThemeEngine` (`src/lib/themeEngine.ts`). 
Themes are purely data (JSON objects) defining colors, map styles, overlays, typography scales, and visual effects. This allows us to scale to hundreds of themes without bloating the React codebase.

## 5. Zero AI Commitment
All features typically outsourced to AI (e.g., journey summarization, quality scoring, cover photo selection) are handled via local deterministic algorithms and database triggers (e.g., `update_drive_quality_score` in PostgreSQL). No data leaves the ecosystem.
