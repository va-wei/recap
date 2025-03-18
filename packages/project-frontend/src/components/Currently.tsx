import React, { useEffect, useState } from "react";
import { useHobbyFetching } from "../useHobbyFetching";
import Spinner from "./Spinner";

interface Hobby {
	id: string;
	title: string;
	date: string;
	hobbyType: string;
	image: string;
	rating: number;
}

const Currently: React.FC = () => {
	// Assuming you get userId and authToken from localStorage or other methods
	const userId = localStorage.getItem("userId") || ""; 
	const authToken = localStorage.getItem("authToken") || "";

	// Fetch hobbies using the custom hook
	const { isLoading, fetchedHobbies, error } = useHobbyFetching(userId, authToken);

	// group hobbies into categories
	const groupedHobbies = fetchedHobbies.reduce<Record<string, Hobby[]>>((acc, hobby) => {
		let category = "Doing..."; // Default category

		if (hobby.hobbyType === "Movie" || hobby.hobbyType === "TV Show") {
			category = "Watching...";
		} else if (hobby.hobbyType === "Book") {
			category = "Reading...";
		}

		if (!acc[category]) acc[category] = []; // create array if category doesn't exist
		acc[category].push(hobby); // add hobby to correct category

		return acc;
	}, {});

	return (
		<div className="currently-container">
			<header>
				<h2 className="currently-title">Currently,</h2>
			</header>

			<div className="currently-section">
				{isLoading ? (
					// Display spinner while loading
					<Spinner />
				) : error ? (
					// Display error message if fetching fails
					<p>Error: {error}</p>
				) : (
					// Display the grouped hobbies
					Object.entries(groupedHobbies).map(([category, hobbies]) => (
						<div key={category} className="category-row">
							<h3 className="category-title">{category}</h3>
							<ul className="hobby-list">
								{hobbies.map((hobby) => (
									<li key={hobby.id}>
										<img
											src={`http://localhost:3000${hobby.image}`} // Assuming relative path
											alt={hobby.title}
											className="hobby-image"
										/>
										<div className="hobby-info">
											<p className="hobby-title">{hobby.title}</p>
											<p className="hobby-date">{hobby.date}</p>
											<p className="hobby-rating">
												{"⭐".repeat(hobby.rating)}
											</p>
										</div>
									</li>
								))}
							</ul>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default Currently;
