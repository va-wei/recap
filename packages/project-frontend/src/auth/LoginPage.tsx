import React, { useState } from "react";
import UsernamePasswordForm from "./UsernamePasswordForm";
import { Link, useNavigate } from "react-router";
import { sendPostRequest } from "../sendPostRequest";

interface LoginPageProps {
	setAuthToken: (token: string) => void;
	setUserId: (userId: string) => void;
}

export function LoginPage({ setAuthToken, setUserId }: LoginPageProps) {
	const [loginError, setLoginError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleLoginSubmit = async (username: string, password: string): Promise<void> => {
		try {
			const data: { token?: string; userId?: string } = await sendPostRequest("http://localhost:3000/auth/login", {
				username,
				password,
			});

			console.log("Server response:", data);

			if (data.token && data.userId) {
				setAuthToken(data.token);
				setUserId(data.userId);
				
				localStorage.setItem("authToken", data.token);
				localStorage.setItem("userId", data.userId);

				console.log("Authenticated with token:", data.token);

				navigate("/"); // Redirect to homepage
			} else {
				setLoginError("Invalid response from server.");
			}
		} catch (err) {
			console.error("Error during login:", err);

			if (err instanceof Error) {
				if (err.message.includes("400")) {
					setLoginError("Missing username or password. Please fill out both fields.");
				} else if (err.message.includes("401")) {
					setLoginError("Incorrect username or password.");
				} else if (err.message.includes("500")) {
					setLoginError("Something went wrong on the server. Please try again later.");
				} else {
					setLoginError("Failed to communicate with the server.");
				}
			}
		}
	};

	return (
		<div className="login-container">
			<h1 className="login-title">Login</h1>
			{loginError && <p className="login-error">{loginError}</p>}
			<UsernamePasswordForm onSubmit={handleLoginSubmit} />
			<p className="register-link">
				Don't have an account? <Link to="/register" className="register-link-text">Register here</Link>
			</p>
		</div>
	);
}

export default LoginPage;
