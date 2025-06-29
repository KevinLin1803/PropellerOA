import { useState, useEffect, useRef, useLayoutEffect } from "react";
import './welcome.css'

export function Welcome() {
  const [zoom, setZoom] = useState<number>(1);
	const gridRef = useRef<HTMLDivElement|null>(null);
  const [tiles, setTiles] = useState<Map<number, string[]>>(new Map());
	const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiaW50ZXJuIiwiaWF0IjoxNzQ3OTY5OTAyfQ._nFA8un2_IMz23difs56tX4ono-oXApWk8y8YSkGkAw`;
	
	// Client view centre x-coordinate and y-coordinate
	const viewRef = useRef<HTMLDivElement|null>(null);

	// Keeping track of centre -> Using the stuff they said in the blog (LRU cache?)
	const [scrollX, setScrollX] = useState<number>(0);
	const [scrollY, setScrollY] = useState<number>(0);


	// Save the scroll position and restore it afterwards. 
	async function triggerZoom(zoomIn: boolean) {
		if ((zoomIn && zoom >= 3) || (!zoomIn && zoom <= 0)) return;

		const nextZoom = zoomIn ? zoom + 1 : zoom - 1;
		const zoomFactor = 2 ** (nextZoom - zoom); // will be 2 for zoomIn, 0.5 for zoomOut

		const container = viewRef.current;
		if (!container) return;

		const cx = container.scrollLeft + container.clientWidth / 2;
		const cy = container.scrollTop + container.clientHeight / 2;

		// Convert current viewport center to logical map coordinate (world pixel at zoom 0)
		const worldX = cx / (2 ** zoom);
		const worldY = cy / (2 ** zoom);

		// Animate CSS zoom-out just for visual effect
		const grid = gridRef.current;
		if (!grid) return;
		grid.style.transition = "transform 3000ms ease-out";
		grid.style.transformOrigin = `${cx}px ${cy}px`;
		await new Promise((r) => requestAnimationFrame(r));
		grid.style.transform = `scale(${zoomFactor})`;

		grid.addEventListener(
			"transitionend",
			() => {
				grid.style.transition = "";
				grid.style.transform = "scale(1)";
				setZoom(nextZoom); // 🔄 actually trigger new tiles
			},
			{ once: true }
		);

		// 🔁 After tiles load (in useLayoutEffect), restore scroll based on worldX/worldY
		setScrollX(worldX * 2 ** nextZoom - container.clientWidth / 2);
		setScrollY(worldY * 2 ** nextZoom - container.clientHeight / 2);
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

		useEffect(() => {
		const container = viewRef.current;
		if (!container) return;

		let dragging = false;
		let startX = 0;
		let startY = 0;
		let scrollStartX = 0;
		let scrollStartY = 0;

		/*— grab —*/
		const onMouseDown = (e: MouseEvent) => {
			dragging = true;
			startX = e.clientX;
			startY = e.clientY;
			scrollStartX = container.scrollLeft;
			scrollStartY = container.scrollTop;

			// UX: change cursor and prevent accidental text selection
			container.style.cursor = "grabbing";
			container.style.userSelect = "none";
		};

		/*— drag —*/
		const onMouseMove = (e: MouseEvent) => {
			if (!dragging) return;
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;
			container.scrollLeft = scrollStartX - dx;
			container.scrollTop  = scrollStartY  - dy;
		};

		/*— drop —*/
		const stopDrag = () => {
			if (!dragging) return;
			dragging = false;
			container.style.cursor = "grab";
			container.style.removeProperty("user-select");
		};

		container.addEventListener("mousedown", onMouseDown);
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup",    stopDrag);
		container.addEventListener("mouseleave", stopDrag);

		return () => {
			container.removeEventListener("mousedown", onMouseDown);
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup",    stopDrag);
			container.removeEventListener("mouseleave", stopDrag);
		};
	}, []);          // ← no deps: attaches once


	// Zoom works half the time -> defs works on loaded images, sussy when computer is running slow :3
		// What do I do with this small iamge though?

	// I still wanna implement my feature hehe -> adding the dots and measuring the distance and having the scale ect..
    return (
      <div 
		className ="display flex flex-col items-center justify-center h-screen bg-gray-600"
		>
				<div 
					className="max-h-[80vh] max-w-[80vw] overflow-auto p-0 cursor-grab"
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
								// Also unsure why this has to be 256 256px for stuff to work? Does this even do anyhting?
								<img 
									key={tileURL} 
									src={tileURL} 
									alt ="Tile"
									width={256}
									height={256}
									draggable={false}
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

// On the tinial load it lowkey poops itself sometimes

// <button className = "flex items-center justify-center bg-gray-100 w-[50px] h-[50px] text-[40px] rounded mb-2 cursor-pointer"onClick={() => {setZoom(zoom => Math.min(zoom + 1, 3))}} >+</button>
// <button className = "flex items-center justify-center bg-gray-100 w-[50px] h-[50px] text-[40px] rounded cursor-pointer" onClick={() => setZoom(zoom => Math.max(zoom - 1, 0))} >-</button>


// Come back tomorrow and look for ways to improve/optimse/add features ect..
// Understand the design decisions you made and why you made them :)
// Just try to do it the exact same way as you would a real one
//  took me around 2 and a half hours to do this. With an extra hour or so just fiddlingaround with it
//  did have to use AI

//  Probs figure out how to scroll in and out + drag it around -> goal: make it feel like google maps (mebe what we have now is okay)

//  Learnings
//  - How maps zoom in and out ig
//  - Robustness and maintainability -> probs move some of the stuff away/separate components

//  - the framing is also a little off/weird
//  - fetching images -> fetching blobs?
//  - don't add anything into token access codes
//  - tailwind css uise -[xx px] for pixel values :)
//  - Reminder, don't use AI to get the answer. Use it for learning? Ask it questions, so that overtime you can do it by yourself
//  - And then overall just editing it so that it's clean and easy to understand (has comments, is readable/maintable/comprehensible) -> like a uni assignment

//  - Anything you can implement on the backend (work frontend for a while -> train backend in my own time) -> become full-stack!!

//  additional learnings -> how to test frontend code. -> Add in smooth/graduaal zooming with mouse wheel/scroll
