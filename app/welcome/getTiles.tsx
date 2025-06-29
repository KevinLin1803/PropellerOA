import { useEffect, useState } from "react";
import { TOKEN } from "./config";

export function getTiles(zoom : number) {
    const [tiles, setTiles] = useState<Map<number, string[]>>(new Map());

    useEffect(() => {
        // Only load new tiles
        if (tiles.has(zoom)) return;

        async function fetchTiles() {
            const urls: string[] = [];

            for (let x = 0; x < 2 ** zoom; x++) {
                for (let y = 0; y < 2 ** zoom; y++) {
                    const res = await fetch(`https://challenge-tiler.services.propelleraero.com/tiles/${zoom}/${x}/${y}?token=${TOKEN}`);
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

    }, [zoom]);

    return tiles;
}
