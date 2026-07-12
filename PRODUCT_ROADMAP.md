# Product Roadmap

## Completed (Sprint 1-10)
- **Foundation:** React Native + Supabase integration.
- **Location & Telemetry:** Background GPS tracking, high-frequency telemetry recording (G-Force, Gyro) mapped to PostGIS.
- **Social Shift:** Transitioned from a raw dashboard to a visual "Journey Composer".
- **Theme Engine:** Created the JSON Theme Registry with 20 aesthetic templates.
- **Multi-format Rendering:** Integrated ViewShot for generating 9:16, 4:5, and 16:9 exports.
- **Interactions:** Implemented non-standard reactions (`Inspired Me`, `Want to Drive`, `Wishlist`).
- **Storytelling Expansion:** Added multi-photo galleries (`drive_media`) and descriptive fields (`favorite_moment`, `advice`) to Journeys.
- **Discovery Engine:** Created dynamic, deterministic algorithms to populate the Explore screen based on a local `quality_score`.

## Current MVP Freeze & Refinement (Sprint 11)
- **Repository Setup:** GitHub standards, strict branching, documentation (Single Source of Truth).
- **Technical Debt Triage:** Identifying over-engineered UI components (hiding raw telemetry).
- **One-Tap UX Planning:** Designing the "Smart Draft" mechanism.

## Backlog / Future Sprints
- **Smart Draft UX:** Auto-generating a complete Journey layout the moment a drive ends.
- **Theme Discovery:** Move 17 themes to a "Marketplace/Discovery" tab and only recommend the top 3 contextual themes in the composer.
- **Journey Replay:** Using hidden 10Hz telemetry data to generate 3D MapLibre replays.
- **Push Notification Triggers:** Alerting users when their "Saved / Wishlisted" routes are driven by others.
