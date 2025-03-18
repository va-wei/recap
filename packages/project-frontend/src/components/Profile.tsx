import React, { ChangeEvent, useState, FormEvent, useEffect } from "react";
import DarkModeSwitch from "./DarkMode.tsx";
import defaultProfilePic from "../assets/def-no-pfp.png";
import { useProfileFetching } from "../hooks/useProfileFetching.ts";

const Profile: React.FC<{ authToken: string }> = ({ authToken }) => {
	const { isLoading, profile, error } = useProfileFetching(authToken);
	const [isEditing, setIsEditing] = useState<boolean>(false);

	const [name, setName] = useState<string>("");
	const [username, setUsername] = useState<string>("");
	const [bio, setBio] = useState<string>("");
	const [profilePic, setProfilePic] = useState<File | null>(null); // Store file directly for upload
	const [imagePreview, setImagePreview] = useState<string | null>(null); // Store image preview URL

	// Set the state with fetched profile data when it's available
	useEffect(() => {
		if (profile && profile.avatar) {
			setName(profile.name);
			setUsername(profile.username);
			setBio(profile.bio);
			setImagePreview(profile.avatar); // Set the avatar image preview from the backend
		}
	}, [profile]);

	const toggleEdit = () => setIsEditing(!isEditing);

	const handleChange = (
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		setter: React.Dispatch<React.SetStateAction<string>>
	) => setter(event.target.value); // input changes

	// Handle profile picture file selection and preview
	const handleProfilePicChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setProfilePic(file); // Store the file object
			const previewUrl = URL.createObjectURL(file); // Create a URL for the image preview
			setImagePreview(previewUrl); // Set the preview URL
		}
	};

	// Handle form submissions (save changes)
	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const formData = new FormData();
		formData.append("name", name);
		formData.append("username", username);
		formData.append("bio", bio);

		if (profilePic) {
			formData.append("avatar", profilePic);
		}

		try {
			const response = await fetch("http://localhost:3000/api/profiles", {
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Failed to update profile");
			}

			const updatedProfile = await response.json();
			setIsEditing(false);

			// Immediately update image preview with new avatar URL
			if (updatedProfile.avatar) {
				setImagePreview(
					`http://localhost:3000${updatedProfile.avatar}`
				);
			}
		} catch (error) {
			console.error("Error updating profile:", error);
		}
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<div className="profile-container">
			<div className="profile-pic-wrapper">
				<img
					src={
						profilePic // Prioritize selected image preview
							? imagePreview || undefined
							: profile?.avatar
							? `http://localhost:3000${profile.avatar}` // Use updated profile avatar
							: defaultProfilePic
					}
					alt="Profile"
					className="profile-picture"
				/>
				{isEditing && (
					<label className="file-upload-label">
						<input
							type="file"
							accept="image/*"
							onChange={handleProfilePicChange}
							className="file-upload-input"
						/>
					</label>
				)}
			</div>
			{isEditing ? (
				<form onSubmit={handleSubmit} className="profile-form">
					<label className="profile-label">Name:</label>
					<input
						type="text"
						value={name}
						onChange={(e) => handleChange(e, setName)}
						className="profile-input"
						placeholder="Enter your name"
					/>
					<label className="profile-label">Username:</label>
					<input
						type="text"
						value={username}
						disabled
						className="profile-input"
						placeholder="Enter your username"
					/>
					<label className="profile-label">Bio:</label>
					<textarea
						value={bio}
						onChange={(e) => handleChange(e, setBio)}
						className="profile-input"
						placeholder="Write something about yourself..."
					/>
					<button type="submit">Save</button>
					<button type="button" onClick={toggleEdit}>
						Cancel
					</button>
				</form>
			) : (
				<div>
					<div className="username">
						{name} <span className="bold-username">{username}</span>
					</div>
					<div className="user-bio">
						{bio.split("\n").map((line, index) => (
							<p key={index}>{line}</p>
						))}
					</div>
					<button className="edit-prof-button" onClick={toggleEdit}>
						Edit Profile
					</button>
					<DarkModeSwitch />
				</div>
			)}
		</div>
	);
};

export default Profile;
