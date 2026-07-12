# Contributing to DRIVE

We welcome contributions from developers, designers, and AI agents. Please adhere to the following rules to maintain the integrity of the DRIVE platform.

## 1. Zero Paid AI Policy
This is a non-negotiable rule. Do **not** submit PRs that integrate third-party paid AI APIs (e.g., OpenAI, Anthropic, Google Gemini). 
All smart features must be built using deterministic algorithms, local device capabilities (Vision, CoreML), or Supabase Edge Functions.

## 2. GitHub Workflow & Branching
We follow a strict Git workflow:
- **`main`**: The stable, production-ready branch. Never commit directly to `main`.
- **`develop`**: The active integration branch.
- **`feature/*`**: For new capabilities.
- **`fix/*`**: For bug resolution.
- **`refactor/*`**: For code cleanup without behavior changes.

## 3. Commit Message Standards
We use **Conventional Commits**.
Format: `type(scope): subject`

Allowed types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

Example: `feat(composer): add smart draft one-tap rendering`

## 4. Product Manager Hat
Before you write code, put on your Product Manager hat. Ask yourself:
*"Does this feature help users create more beautiful, shareable memories of their road trips?"*
If no, open a discussion issue before writing any code.
