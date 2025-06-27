import { useState, useEffect } from "react";
import './welcome.css'

export function Welcome() {
  const [zoom, setZoom] = useState<number>(0);

	// Load the smallest screen first and cache/store the results effectively :)
  const [tiles, setTiles] = useState<Map<number, string[]>>(new Map());
	const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiaW50ZXJuIiwiaWF0IjoxNzQ3OTY5OTAyfQ._nFA8un2_IMz23difs56tX4ono-oXApWk8y8YSkGkAw`;

	useEffect(() => {
		if (tiles.has(zoom)) return;

		async function fetchTiles() {
			const urls: string[] = [];

			for (let x = 0; x < 2 ** zoom; x++) {
				for (let y = 0; y < 2 ** zoom; y++) {
					const res = await fetch(`https://challenge-tiler.services.propelleraero.com/tiles/${zoom}/${x}/${y}?token=${token}`);
					const blob = await res.blob();
					urls.push(URL.createObjectURL(blob));
				}
			}

			const newMap = new Map(tiles).set(zoom, urls);
			setTiles(newMap);
		}

		fetchTiles().catch((error) => {
			console.error("Error fetching tiles:", error);
		});

	}, [zoom]);   // ← zoom drives refetching


    return (
      <div className ="display flex flex-col items-center justify-center h-screen bg-gray-600">
				<div className="max-h-[85vh] max-w-[75vh] overflow-auto">
					<div
						className="grid grid-flow-col gap-0"
						style={{
							gridTemplateRows: `repeat(${2 ** zoom}, 256px)`,
							gridTemplateColumns: `repeat(${2 ** zoom}, 256px)`,
						}}
					>
						{tiles.get(zoom)? (
							<>          
							{tiles.get(zoom)?.map((tileURL) => (
								<img 
									key={tileURL} 
									src={tileURL} 
									alt ="Tile" 
								/>
							))}
							</>
						): (
							<p>Loading tile...</p>
						)}
					</div>
					</div>

					<div className="display flex flex-col absolute right-[20%] bottom-[20%]">
						<button className = "flex items-center justify-center bg-gray-100 w-[50px] h-[50px] text-[40px] rounded mb-2"onClick={() => {setZoom(zoom => Math.min(zoom + 1, 3))}} >+</button>
						<button className = "flex items-center justify-center bg-gray-100 w-[50px] h-[50px] text-[40px] rounded" onClick={() => setZoom(zoom => Math.max(zoom - 1, 0))} >-</button>
					</div>

      </div>
    );
}
