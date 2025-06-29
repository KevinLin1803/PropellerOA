import { useRef, useLayoutEffect } from "react";
import { usePanning } from "./usePanning";
import { getTiles}  from "./getTiles"
import { useZoom } from "./useZoom";
import TileGrid from "./TileGrid";

export function TileMap() {
	const gridRef = useRef<HTMLDivElement|null>(null);
	const viewRef = useRef<HTMLDivElement|null>(null);

	// Update zoom level and map center point
	const { zoom, center, triggerZoom } = useZoom(viewRef, gridRef);

	// Implement panning across map tiles
	usePanning(viewRef);

	// Retrieve map tiles
	const tiles = getTiles(zoom);

	// Restores scroll position to keep the same center point after zooming in/out
	useLayoutEffect (()=> {
		if (!tiles.has(zoom)) return;

		requestAnimationFrame(() => {
			const gridContainer = viewRef.current;
			if (!gridContainer) return;

			gridContainer.scrollLeft = center.x;
			gridContainer.scrollTop  = center.y;
		});

	}, [zoom, tiles])
		
    return (
		<div className ="display flex flex-col items-center justify-center h-screen bg-gray-600">
			<div 
				className="max-h-[80vh] max-w-[80vw] overflow-auto p-0 cursor-grab"
				ref={viewRef}
			>
				<TileGrid
					ref={gridRef}
					zoom={zoom}
					tiles={tiles}
				/>
			</div>
			<div className="display flex flex-col absolute right-[20%] bottom-[20%]">
				<button className = {`${zoombtn} mb-2`} onClick={() => triggerZoom(true)} >+</button>
				<button className = {zoombtn} onClick={() => triggerZoom(false)} >-</button>
			</div>
		</div>
    );
}

const zoombtn = "flex items-center justify-center bg-gray-100 w-[50px] h-[50px] text-[40px] rounded cursor-pointer"
