# Propeller Front-end Coding Challenge 🥳!

**Implemented Features**
- Allow zooming using +/- buttons
- Allow scrolling when the content doesn't fit in the browser viewport.
- allow panning of the tiles rather than scrolling

Attempted gradual zooming between tiles but ran out of time. Currently works zooming in/out between zoom levels 1-3. However, doesn't work when:
- zooming out at viewport edges
- zooming in from/out to zoom level 0

**Files**

Relevant files found in app -> welcome. TileMap.tsx, TileGrid.tsx, usePanning.tsx, useZoom.tsx.

### Installation

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

