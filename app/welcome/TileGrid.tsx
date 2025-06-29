import React from "react";

type Props = {
  zoom: number;
  tiles: Map<number, string[]> | null;
  tileSize?: number;
};

const TileGrid = React.memo(
  React.forwardRef<HTMLDivElement, Props>(function TileGrid(
    { zoom, tiles, tileSize = 256 },
    ref
  ) {
    return (
      <div
        ref={ref}
        className="grid grid-flow-col gap-0 w-100 h-100"
        style={{
          gridTemplateRows: `repeat(${2 ** zoom}, ${tileSize}px)`,
          gridTemplateColumns: `repeat(${2 ** zoom}, ${tileSize}px)`,
        }}
      >
        {tiles?.has(zoom) ? (
          tiles.get(zoom)?.map((src) => (
            <img
              key={src}
              src={src}
              width={tileSize}
              height={tileSize}
              draggable={false}
              alt="Tile"
            />
          ))
        ) : (
          <p >Loading tiles…</p>
        )}
      </div>
    );
  })
);

export default TileGrid;
