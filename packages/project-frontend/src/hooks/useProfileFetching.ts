import { useEffect, useState } from "react";

interface Friend {
    id: string;
    name: string;
    recentHobby: string;
}

interface ProfileData {
    userId: string;
    name: string;
    username: string;
    bio: string;
    avatar: string | null; 
    friends: Friend[];
}

/**
 * Fetches the logged-in user's profile data.
 * @param authToken {string} The user's authentication token
 * @returns {{isLoading: boolean, profile: ProfileData | null, error: string | null}}
 */
export function useProfileFetching(authToken: string) {
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authToken) {
            setProfile(null);
            setIsLoading(false);
            setError("No auth token provided.");
            return;
        }

        let isStale = false;

        async function fetchProfile() {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/profiles`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch profile data");
                }

                const data = await response.json();
                console.log("Fetched profile:", data);

                if (!isStale) {
                    setProfile(data);
                }
            } catch (err) {
                if (!isStale) {
                    setError(err instanceof Error ? err.message : "An unknown error occurred");
                }
            } finally {
                if (!isStale) {
                    setIsLoading(false);
                }
            }
        }

        fetchProfile();

        return () => {
            isStale = true;
        };
    }, [authToken]);

    return { isLoading, profile, error };
}
