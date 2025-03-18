export async function sendPostRequest<T>(url: string, payload: Record<string, unknown>): Promise<T> {
	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			throw new Error(`Request failed with status: ${response.status}`);
		}

		const responseData = await response.json();
		return responseData;
	} catch (err) {
		console.error("Error sending POST request:", err);
		throw err;
	}
}
