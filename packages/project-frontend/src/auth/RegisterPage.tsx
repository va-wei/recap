import React, { useState } from "react";
import UsernamePasswordForm from "./UsernamePasswordForm";
import { sendPostRequest } from "../sendPostRequest";

export function RegisterPage() {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleFormSubmit = async (username: string, password: string): Promise<void> => {
		console.log("Username:", username);
		console.log("Password:", password);

		try {
			const result = await sendPostRequest("http://localhost:3000/auth/register", {
				username,
				password,
			});

			console.log(`Registration successful:`, result);
			setErrorMessage(null);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("400")) {
					setErrorMessage("User already exists. Please choose a different username.");
				} else if (error.message.includes("500")) {
					setErrorMessage("Server error. Please try again later.");
				} else {
					setErrorMessage("An unknown error occurred. Please try again.");
				}
			}
		}
	};

	return (
		<div>
			<h1>Register a New Account</h1>
			{errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
			<UsernamePasswordForm onSubmit={handleFormSubmit} />
		</div>
	);
}

export default RegisterPage;
