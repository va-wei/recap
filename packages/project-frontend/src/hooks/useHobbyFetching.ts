import { useEffect, useState } from "react";

interface Hobby {
    id: string;
    title: string;
    date: string;
    hobbyType: string;
    image: string;
    rating: number;
  }

/**
 * Fetches hobbies from the backend. Returns an object with two properties: isLoading and fetchedHobbies, which will be
 * an array of Hobby data.
 *
 * @param userId {string} the user ID to fetch hobbies for, or empty string for all hobbies
 * @param delay {number} the number of milliseconds fetching will take (optional)
 * @returns {{isLoading: boolean, fetchedHobbies: Hobby[]}} fetch state and data
 */
export function useHobbyFetching(userId: string, authToken: string, delay = 1000) {
	const [isLoading, setIsLoading] = useState(true);
	const [fetchedHobbies, setFetchedHobbies] = useState<Hobby[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!authToken) {
			setFetchedHobbies([]);
			setIsLoading(false);
			setError("No auth token provided.");
			return;
		}

		let isStale = false;

		async function fetchHobbies() {
			setIsLoading(true);
			setError(null);

			try {
				const response = await fetch(`/api/hobbies?createdBy=${userId}`, {
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
				});

				if (!response.ok) {
					throw new Error("Failed to fetch hobbies");
				}

				const data = await response.json();

				if (!isStale) {
					setFetchedHobbies(data);
				}
			} catch (err) {
				if (!isStale) {
					if (err instanceof Error) {
						setError(err.message);
					} else {
						setError("An unknown error occurred");
					}
				}
			} finally {
				if (!isStale) {
					setIsLoading(false);
				}
			}
		}

		fetchHobbies();

		return () => {
			isStale = true;
		};
	}, [userId, authToken, delay]);

	return { isLoading, fetchedHobbies, error };
}
