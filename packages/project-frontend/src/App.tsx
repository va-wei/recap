import React, { useState } from "react";
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
import { nanoid } from "nanoid";

interface Hobby {
    id: string;
    title: string;
    date: string;
    hobbyType: string;
    image: string;
    rating: number;
}

interface AppProps {
    hobbies: Hobby[];
}

const App: React.FC<AppProps> = ({ hobbies }) => {
	const [hobbiesList, setHobbiesList] = useState<Hobby[]>(hobbies);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [authToken, setAuthToken] = useState(null);

	const openModal = () => setIsModalOpen(true);

	function addHobby(title: string, date: string, hobbyType: string, image: string, rating: number) {
		const newHobby: Hobby = {
			id: nanoid(),
			title,
			date,
			hobbyType,
			image,
			rating,
		};
		setHobbiesList([...hobbiesList, newHobby]);
		setIsModalOpen(false);
	}

	return (
		<Router>
			<div className="app-container">
				<Header />
				<div className="main-content">
					<Routes>
						<Route
							path="/"
							element={
								<>
									<Currently hobbies={hobbiesList} />
									<Profile />
								</>
							}
						/>
						<Route path="/friends" element={<Friends />} />
						<Route path="/register" element={<RegisterPage />} />
						<Route
							path="/login"
							element={<LoginPage setAuthToken={setAuthToken} />}
						/>
					</Routes>
				</div>
				<TabBar openModal={openModal} />
				<Modal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					addHobby={addHobby}
				/>
			</div>
		</Router>
	);
};

export default App;
