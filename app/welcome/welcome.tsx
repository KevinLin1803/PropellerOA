import { useState, useEffect, useRef, useLayoutEffect } from "react";
import './welcome.css'

export function Welcome() {
  const [zoom, setZoom] = useState<number>(1);
	const gridRef = useRef<HTMLDivElement|null>(null);
  const [tiles, setTiles] = useState<Map<number, string[]>>(new Map());
	const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiaW50ZXJuIiwiaWF0IjoxNzQ3OTY5OTAyfQ._nFA8un2_IMz23difs56tX4ono-oXApWk8y8YSkGkAw`;
	
	// Client view centre x-coordinate and y-coordinate
	const viewRef = useRef<HTMLDivElement|null>(null);
	const [scrollX, setScrollX] = useState<number>(0);
	const [scrollY, setScrollY] = useState<number>(0);


	// Save the scroll position and restore it afterwards. 

	async function triggerZoom(zoomIn: boolean) {
		if (zoomIn && zoom >= 3) return;
		if (!zoomIn && zoom <= 0) return;

		const zoomFactor = zoomIn? 2: 1/2;

		// Saving the current client content centre
		const gridContainer = viewRef.current;
		if (!gridContainer) return;
		const cx = gridContainer.scrollLeft  + gridContainer.clientWidth  / 2
		const cy = gridContainer.scrollTop   + gridContainer.clientHeight / 2;

		// Applying the zoom animation effect
		const grid = gridRef.current;
		if (!grid) return;
		grid.style.transition = "transform 3000ms ease-out";
  	await new Promise(r => requestAnimationFrame(r)); // Allows React time to render the new transition   
		grid.style.transform = `scale(${zoomFactor})`;
		grid.style.transformOrigin = `${cx}px ${cy}px`;

		// Saving the current scroll position
		setScrollX(cx * zoomFactor - gridContainer.clientWidth / 2);
		setScrollY(cy * zoomFactor - gridContainer.clientHeight / 2);

		console.log(cx * zoomFactor - gridContainer.clientWidth / 2);
		console.log(cy * zoomFactor - gridContainer.clientHeight / 2);

		// Criticisms: Style (event listener), potentially add another event listener
		grid.addEventListener(
			"transitionend",
			() => {
				grid.style.transition = "";                    
				grid.style.transform  = "scale(1)";     
				setZoom(prev => zoomIn ? prev + 1 : prev - 1);
			},
			{ once: true }
		);
	}

	// I don't understand the two react components here ngl
	useLayoutEffect (()=> {
		if (!tiles.has(zoom)) return;          // tiles not fetched yet

		requestAnimationFrame(() => {
			const gridContainer = viewRef.current;
			if (!gridContainer) return;

			gridContainer.scrollLeft = scrollX;
			gridContainer.scrollTop  = scrollY;
			console.log("restored", gridContainer.scrollLeft, gridContainer.scrollTop);
		});

	}, [zoom, tiles])
		// I think I want to try implement a scale
		// And a from point a to point b -> measuring distances kinda thing :)

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

		console.log('exiting useffect')
	}, [zoom]);

    return (
      <div 
				className ="display flex flex-col items-center justify-center h-screen bg-gray-600"
			>
				<div 
					// I don't knwo what to do wtih this guy -> smallest guy on zoom out also has some weird behaviour :3
					// Then add comments -> tests -> improve style/robustness then submit items
						// Prepare behavioural and followup technical questions :)
						// If time try to add the mouse scrolling as well :)
							// mouse zoom -> affects scale in up to 2/scale out by 1/2
							// And buggy zoom out behaviour :/ -> lock in tonight. It's not over yet. Go to bed at 11 (This is damn important. Stop taking it so chill)
							// You can play the Mario kart tomorrow night :)
					className=" overflow-auto"
					ref={viewRef}
					>
					<div
						ref={gridRef}
						className="grid grid-flow-col gap-0 w-100 h-100"
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
						<button className = "flex items-center justify-center bg-gray-100 w-[50px] h-[50px] text-[40px] rounded mb-2 cursor-pointer"onClick={() => triggerZoom(true)} >+</button>
						<button className = "flex items-center justify-center bg-gray-100 w-[50px] h-[50px] text-[40px] rounded cursor-pointer" onClick={() => triggerZoom(false)} >-</button>
					</div>

      </div>
    );

}


// <button className = "flex items-center justify-center bg-gray-100 w-[50px] h-[50px] text-[40px] rounded mb-2 cursor-pointer"onClick={() => {setZoom(zoom => Math.min(zoom + 1, 3))}} >+</button>
// <button className = "flex items-center justify-center bg-gray-100 w-[50px] h-[50px] text-[40px] rounded cursor-pointer" onClick={() => setZoom(zoom => Math.max(zoom - 1, 0))} >-</button>


// Come back tomorrow and look for ways to improve/optimse/add features ect..
// Understand the design decisions you made and why you made them :)
// Just try to do it the exact same way as you would a real one
 // took me around 2 and a half hours to do this. With an extra hour or so just fiddlingaround with it
 // did have to use AI

 // Probs figure out how to scroll in and out + drag it around -> goal: make it feel like google maps (mebe what we have now is okay)

 // Learnings
 // - How maps zoom in and out ig
 // - Robustness and maintainability -> probs move some of the stuff away/separate components

 // - the framing is also a little off/weird
 // - fetching images -> fetching blobs?
 // - don't add anything into token access codes
 // - tailwind css uise -[xx px] for pixel values :)
 // - Reminder, don't use AI to get the answer. Use it for learning? Ask it questions, so that overtime you can do it by yourself
 // - And then overall just editing it so that it's clean and easy to understand (has comments, is readable/maintable/comprehensible) -> like a uni assignment

 // - Anything you can implement on the backend (work frontend for a while -> train backend in my own time) -> become full-stack!!

 // additional learnings -> how to test frontend code. -> Add in smooth/graduaal zooming with mouse wheel/scroll
