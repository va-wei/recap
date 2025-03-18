import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { nanoid } from "nanoid";

import captainAmericaPoster from "./assets/captain-america.png";
import theFirstFrostPoster from "./assets/the-first-frost.png";
import divineRivalsCover from "./assets/divine-rivals.png";
import moonlightMystiquePoster from "./assets/moonlight-mystique.png";


const DATA = [
	{
		id: nanoid(),
		title: "Captain America: The Winter Soldier",
		hobbyType: "Movie",
		date: "2024-02-01",
		image: captainAmericaPoster,
		rating: 5,
	},
	{
		id: nanoid(),
		title: "The First Frost",
		date: "2024-02-14",
		hobbyType: "TV Show",
		image: theFirstFrostPoster,
		rating: 5,
	},
	{
		id: nanoid(),
		title: "Divine Rivals",
		date: "2024-02-21",
		hobbyType: "Book",
		image: divineRivalsCover,
		rating: 4,
	},
	{
		id: nanoid(),
		title: "Moonlight Mystique",
		date: "2024-02-24",
		hobbyType: "TV show",
		image: moonlightMystiquePoster,
		rating: 3,
	},
];

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <App hobbies={DATA} />
  </StrictMode>
);
