import React, { useEffect, useState } from "react";
import { useHobbyFetching } from "../hooks/useHobbyFetching";
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
	const userId = localStorage.getItem("userId") || "";
	const authToken = localStorage.getItem("authToken") || "";

	// fetch hobbies
	const { isLoading, fetchedHobbies, error } = useHobbyFetching(
		userId,
		authToken
	);

	// group hobbies into categories
	const groupedHobbies = fetchedHobbies.reduce<Record<string, Hobby[]>>(
		(acc, hobby) => {
			let category = "Doing..."; // Default category

			if (hobby.hobbyType === "Movie" || hobby.hobbyType === "TV Show") {
				category = "Watching...";
			} else if (hobby.hobbyType === "Book") {
				category = "Reading...";
			}

			if (!acc[category]) acc[category] = []; // create array if category doesn't exist
			acc[category].push(hobby); // add hobby to correct category

			return acc;
		},
		{}
	);

	return (
		<div className="currently-container">
			<header>
				<h2 className="currently-title">Currently,</h2>
			</header>

			<div className="currently-section">
				{isLoading ? (
					// display spinner while loading
					<Spinner />
				) : error ? (
					// display error message if fetching fails
					<p>Error: {error}</p>
				) : (
					// display the grouped hobbies
					Object.entries(groupedHobbies).map(
						([category, hobbies]) => (
							<div key={category} className="category-row">
								<h3 className="category-title">{category}</h3>
								<ul className="hobby-list">
									{hobbies.map((hobby) => (
										<li key={hobby.id}>
											<img
												src={`${hobby.image}`} 
												alt={hobby.title}
												className="hobby-image"
											/>
											<div className="hobby-info">
												<p className="hobby-title">
													{hobby.title}
												</p>
												<p className="hobby-date">
													{hobby.date}
												</p>
												<p className="hobby-rating">
													{"⭐".repeat(
														Math.max(
															0,
															Math.min(
																5,
																hobby.rating
															)
														)
													)}{" "}
												</p>
											</div>
										</li>
									))}
								</ul>
							</div>
						)
					)
				)}
			</div>
		</div>
	);
};

export default Currently;
