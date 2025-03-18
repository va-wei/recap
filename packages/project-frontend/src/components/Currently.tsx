import React, { useEffect, useState } from "react";
import Spinner from "./Spinner";

interface Hobby {
	id: string;
	title: string;
	date: string;
	hobbyType: string;
	image: string;
	rating: number;
}

interface CurrentlyProps {
	hobbies: Hobby[];
}

const Currently: React.FC<CurrentlyProps> = ({ hobbies }) => {
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false);
		}, 3000);

		return () => clearTimeout(timer);
	}, []);

	// group hobbies into categories
	const groupedHobbies = hobbies.reduce<Record<string, Hobby[]>>((acc, hobby) => {
		let category = "Doing..."; // Default category

		if (hobby.hobbyType === "Movie" || hobby.hobbyType === "TV Show") {
			category = "Watching...";
		} else if (hobby.hobbyType === "Book") {
			category = "Reading...";
		}

		if (!acc[category]) acc[category] = []; // create array if category dne
		acc[category].push(hobby); // add hobby to correct category

		return acc;
	}, {});

	return (
		<div className="currently-container">
			<header>
				<h2 className="currently-title">Currently,</h2>
			</header>

			<div className="currently-section">
				{loading ? (
					<Spinner />
				) : (
					Object.entries(groupedHobbies).map(([category, hobbies]) => (
						<div key={category} className="category-row">
							<h3 className="category-title">{category}</h3>
							<ul className="hobby-list">
								{hobbies.map((hobby) => (
									<li key={hobby.id}>
										<img
											src={hobby.image}
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