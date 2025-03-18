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

	return (
		<div className="currently-container">
			<header>
				<h2 className="currently-title">Currently,</h2>
			</header>
			<div className="currently-section">
				<ul>
					{loading ? (
						<li>
							<Spinner />
						</li>
					) : (
						hobbies.map((hobby) => (
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
						))
					)}
				</ul>
			</div>
		</div>
	);
};

export default Currently;
