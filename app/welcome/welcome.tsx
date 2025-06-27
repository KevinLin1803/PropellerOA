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
      <div className ="h-[75vh] w-[75vw]">
				<div
					className="grid grid-flow-col gap-0"
					// Gotta understand this style bit
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
				<button onClick={() => {setZoom(zoom => Math.min(zoom + 1, 3))}}>+</button>
				<button onClick={() => setZoom(zoom => Math.max(zoom - 1, 0))}>-</button>
      </div>
    );
}



  // My thinking
  // Default zoom is 0
  // If you increase zoom, then we refetch the tiles -> add a loading state
  // If you decrease zoom, then we also refetch the tiles -> adding a loading state

  // Question -> we can fetch all the tiles and stuff -> but where do we store them?
     // I think we can just store them in a map right? Like a HashMap
     // If our hashmap doesn't have the urls -> then we fetch the URLs. 

  // Noticed it took a while -> can I get it to run in the background while I load the first page?

  // Imma load in all the tiles first
  // const getTile = async () => {
  //   console.log("Fetching tile...");
	// 	for (let x = 0; x < 2 ** zoom; x++) {
	// 		for (let y = 0; y < 2 ** zoom; y++) {
	// 			const res = await fetch(`https://challenge-tiler.services.propelleraero.com/tiles/${zoom}/${x}/${y}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiaW50ZXJuIiwiaWF0IjoxNzQ3OTY5OTAyfQ._nFA8un2_IMz23difs56tX4ono-oXApWk8y8YSkGkAw`);
	// 			console.log(res);
	// 			const blob = await res.blob();
	// 			console.log(blob);
	// 			const update = new Map<number, string[]>(tiles);
	// 			const arr = update.get(zoom) || [];
	// 			arr.push(URL.createObjectURL(blob));
	// 			update.set(zoom,arr);
	// 			setTiles(update);
	// 		}
	// 	}
  // }

	// // The thing is once we've loaded all of them, we don't need zoom to get changed anymore
	// // So onclick of zoom -> we prompt the zoom/changing image
  // useEffect(() => {
  //   getTile();
  //   }, [zoom]);

