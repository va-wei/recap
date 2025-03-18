import React, { useRef, useState, ChangeEvent, FormEvent, MouseEvent } from "react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	addHobby: (title: string, date: string, hobbyType: string, image: string, rating: number) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, addHobby }) => {
	if (!isOpen) return null; // prevent rendering when modal is closed

	const modalRef = useRef<HTMLDivElement | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [rating, setRating] = useState<string>("");
    const [hobbyType, setHobbyType] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [date, setDate] = useState<string>("");

	const handleClickOutside = (event: MouseEvent) => {
		if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
			onClose(); // trigger onClose when clicking outside the modal
		}
	};

	const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const imageUrl = URL.createObjectURL(file);
			setSelectedImage(imageUrl);
		}
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (selectedImage) {
			addHobby(title, date, hobbyType, selectedImage, parseInt(rating));
		} else {
			alert ("Please select an image.");
		}
	};

	return (
		<div className="modal-overlay" onClick={handleClickOutside}>
			<div className="modal-content" ref={modalRef}>
				<h2>Add Hobby</h2>
				<form onSubmit={handleSubmit}>
					<label>
						Title:
						<input
							type="text"
							name="titleName"
							className="modal-input"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
						/>
					</label>
					<label>
						Date:
						<input
							type="date"
							name="date"
							className="modal-input"
							value={date}
							onChange={(e) => setDate(e.target.value)}
							required
						/>
					</label>
					<label>
						Hobby Type:
						<select
							value={hobbyType}
							onChange={(e) => setHobbyType(e.target.value)}
							className="modal-input"
							required
						>
							<option value="">Select Type</option>
							<option value="Movie">Movie</option>
							<option value="Book">Book</option>
							<option value="TV Show">TV Show</option>
							<option value="Other">Other</option>
						</select>
					</label>
					<label className="image-label">
						Image:
						<input
							type="file"
							accept="image/*"
							onChange={handleImageChange}
							className="modal-input"
						/>
					</label>
					{selectedImage && (
						<div className="image-preview">
							<img src={selectedImage} alt="Selected preview" />
						</div>
					)}
					<label>
						Rating:
						<select
							value={rating}
							onChange={(e) => setRating(e.target.value)}
							className="modal-input"
						>
							<option value="">Select Rating</option>
							<option value="1">⭐</option>
							<option value="2">⭐⭐</option>
							<option value="3">⭐⭐⭐</option>
							<option value="4">⭐⭐⭐⭐</option>
							<option value="5">⭐⭐⭐⭐⭐</option>
						</select>
					</label>
					<button type="submit">Submit</button>
				</form>
				<button onClick={onClose}>Close</button>
			</div>
		</div>
	);
};

export default Modal;
