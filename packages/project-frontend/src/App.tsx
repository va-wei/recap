import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import "./App.css";
import Header from "./components/Header";
import Currently from "./components/Currently";
import TabBar from "./components/TabBar";
import Profile from "./components/Profile";
import Friends from "./pages/Friends";
import Modal from "./components/Modal";
import { LoginPage } from "./auth/LoginPage";
import { RegisterPage } from "./auth/RegisterPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { nanoid } from "nanoid";

interface Hobby {
	id: string;
	title: string;
	date: string;
	hobbyType: string;
	image: string;
	rating: number;
	userId: string;
}

interface AppProps {
	hobbies: Hobby[];
}

const App: React.FC<AppProps> = ({ hobbies }) => {
	const [hobbiesList, setHobbiesList] = useState<Hobby[]>(hobbies);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [authToken, setAuthToken] = useState<string | null>(null);
	const [userId, setUserId] = useState<string | null>(
		localStorage.getItem("userId")
	);

	useEffect(() => {
		const storedAuthToken = localStorage.getItem("authToken");
		const storedUserId = localStorage.getItem("userId");

		if (storedAuthToken && storedUserId) {
			setAuthToken(storedAuthToken);
			setUserId(storedUserId);
		}
	}, []);

	const openModal = () => {
		if (!authToken) {
			alert("You must be logged in to add a hobby.");
			return;
		}
		setIsModalOpen(true);
	};

	const addHobby = (
		title: string,
		date: string,
		hobbyType: string,
		image: string,
		rating: number
	) => {
		if (!userId) {
			alert("User is not logged in");
			return;
		}

		const newHobby: Hobby = {
			id: nanoid(),
			title,
			date,
			hobbyType,
			image,
			rating,
			userId,
		};

		setHobbiesList((prevHobbies) => {
			const updatedHobbies = [...prevHobbies, newHobby];
			console.log("Updated Hobbies List:", updatedHobbies);
			return updatedHobbies;
		});

		setIsModalOpen(false);
	};

	return (
		<Router>
			<div className="app-container">
				<Header setAuthToken={setAuthToken} setUserId={setUserId} />
				<div className="main-content">
					<Routes>
						<Route
							path="/"
							element={
								<ProtectedRoute authToken={authToken}>
									<Currently />
									<Profile authToken={authToken || ""} />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/friends"
							element={
								<ProtectedRoute authToken={authToken}>
									<Friends />{" "}
								</ProtectedRoute>
							}
						/>
						<Route path="/register" element={<RegisterPage />} />
						<Route
							path="/login"
							element={
								<LoginPage
									setAuthToken={setAuthToken}
									setUserId={setUserId}
								/>
							}
						/>
					</Routes>
				</div>
				<TabBar openModal={openModal} />
				<Modal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					addHobby={addHobby}
					userId={userId || ""}
				/>
			</div>
		</Router>
	);
};

export default App;
