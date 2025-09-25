# CLAUDE.md

## Architecture

This is an Electron application with three main processes:

- **Main Process** (`src/main/`): Electron main process handling app lifecycle, window management, and native APIs
- **Preload** (`src/preload/`): Bridge between main and renderer processes with IPC handlers
- **Renderer** (`src/renderer/`): React frontend with TypeScript

## Code Quality Standards & Architecture Principles

### DRY + KISS Principles

**CRITICAL**: Always follow DRY (Don't Repeat Yourself) and KISS (Keep It Simple, Stupid) principles.

**Feature-Based DRY Architecture with Re-exports:**

- **Co-locate types with features**: Place types in `src/renderer/src/features/[feature]/types/`
- **Use feature re-exports**: Features export types through their main index file for cross-layer access
- **Single source of truth**: Never duplicate type definitions or constants

### Minimal Changes Rule

- **Before adding complexity**: Ask if a simpler solution exists
- **Avoid premature sharing**: Don't create "shared" types until truly used by multiple features
- **Keep existing structure**: Only change what's necessary for DRY compliance
