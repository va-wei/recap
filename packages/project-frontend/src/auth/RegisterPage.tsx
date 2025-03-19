import React, { useState } from "react";
import UsernamePasswordForm from "./UsernamePasswordForm";
import { sendPostRequest } from "../sendPostRequest";
import { useNavigate } from "react-router";

export function RegisterPage() {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleFormSubmit = async (username: string, password: string): Promise<void> => {
		console.log("Username:", username);
		console.log("Password:", password);

		try {
			const result = await sendPostRequest("/auth/register", {
				username,
				password,
			});

			console.log(`Registration successful:`, result);
			setErrorMessage(null);

			setTimeout(() => {
				navigate("/login");
			  }, 2000);
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
		<div className="login-container">
		  <h1 className="login-title">Register a New Account</h1> 
		  {errorMessage && <p className="error-message">{errorMessage}</p>} 
		  <UsernamePasswordForm onSubmit={handleFormSubmit} />
		</div>
	  );
}

export default RegisterPage;
