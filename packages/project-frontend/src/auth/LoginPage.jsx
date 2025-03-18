import React, { useState } from "react";
import UsernamePasswordForm from "./UsernamePasswordForm";
import { Link, useNavigate } from "react-router";
import { sendPostRequest } from "../sendPostRequest";

export function LoginPage({ setAuthToken }) {
	const [loginError, setLoginError] = useState(null);
	const navigate = useNavigate();

	const handleLoginSubmit = async (username, password) => {
		try {
			const data = await sendPostRequest(
				"http://localhost:3000/auth/login",
				{ username, password }
			);

			console.log("Server response:", data);

			if (data.token) {
				setAuthToken(data.token);
				localStorage.setItem("authToken", data.token);
				console.log("Authenticated with token:", data.token);

				navigate("/"); // Redirect to homepage
			} else {
				setLoginError("Invalid response from server.");
			}
		} catch (err) {
			console.error("Error during login:", err);

			// Handling different errors based on the message
			if (err.message.includes("400")) {
				setLoginError(
					"Missing username or password. Please fill out both fields."
				);
			} else if (err.message.includes("401")) {
				setLoginError("Incorrect username or password.");
			} else if (err.message.includes("500")) {
				setLoginError(
					"Something went wrong on the server. Please try again later."
				);
			} else {
				setLoginError("Failed to communicate with the server.");
			}
		}
	};

	return (
		<div>
			<h1>Login</h1>
			{loginError && <p style={{ color: "red" }}>{loginError}</p>}
			<UsernamePasswordForm onSubmit={handleLoginSubmit} />
			<p>
				Don't have an account? <Link to="/register">Register here</Link>
			</p>
		</div>
	);
}
