import React, {
	useRef,
	useState,
	ChangeEvent,
	FormEvent,
	MouseEvent,
} from "react";

interface FormResult {
	type: "success" | "error";
	message: string;
}

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	addHobby: (
		title: string,
		date: string,
		hobbyType: string,
		image: string,
		rating: number
	) => void;
	userId: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, addHobby, userId }) => {
	if (!isOpen) return null;

	const modalRef = useRef<HTMLDivElement | null>(null);
	const [selectedImage, setSelectedImage] = useState<File | null>(null); 
	const [rating, setRating] = useState<number>(0);
	const [hobbyType, setHobbyType] = useState<string>("");
	const [title, setTitle] = useState<string>("");
	const [date, setDate] = useState<string>("");
	const [result, setResult] = useState<FormResult | null>(null);
	const [isPending, setIsPending] = useState(false);

	// reset form when the modal is closed
	const resetForm = () => {
		setTitle("");
		setDate("");
		setHobbyType("");
		setSelectedImage(null);
		setRating(0); // reset rating to default (0)
	};

	// close handler with reset
	const handleClickOutside = (event: MouseEvent) => {
		if (
			modalRef.current &&
			!modalRef.current.contains(event.target as Node)
		) {
			resetForm();
			onClose();
		}
	};

	// image selection
	const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedImage(file); // Store the file object instead of URL
		}
	};

	// form submission
	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
	
		if (!selectedImage) {
			alert("Please select an image.");
			return;
		}
	
		if (rating === 0) {
			alert("Please select a valid rating.");
			return;
		}
	
		setIsPending(true);
	
		try {
			const formData = new FormData();
			formData.append("title", title);
			formData.append("date", date);
			formData.append("hobbyType", hobbyType);
			formData.append("rating", String(rating));
			formData.append("userId", userId);
	
			if (selectedImage) {
				formData.append("image", selectedImage);
			}
	
			const response = await fetch("/api/hobbies", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("authToken")}`,
				},
				body: formData,
			});
	
			if (!response.ok) {
				throw new Error("Failed to add hobby");
			}
	
			const data = await response.json();
	
			// update the state immediately with the new hobby
			addHobby(title, date, hobbyType, data.imageUrl, rating);
	
			setResult({ type: "success", message: "Hobby added successfully" });
			resetForm();
			onClose();
		} catch (error) {
			setResult({ type: "error", message: "Failed to add hobby" });
		} finally {
			setIsPending(false);
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
							<img
								src={URL.createObjectURL(selectedImage)}
								alt="Selected preview"
							/>
						</div>
					)}
					<label>
						Rating:
						<select
							value={rating}
							onChange={(e) => {
								const newRating = Number(e.target.value);
								setRating(newRating);
								console.log("Selected Rating:", newRating); 
							  }}
							className="modal-input"
						>
							<option value="0">Select Rating</option>
							<option value="1">⭐</option>
							<option value="2">⭐⭐</option>
							<option value="3">⭐⭐⭐</option>
							<option value="4">⭐⭐⭐⭐</option>
							<option value="5">⭐⭐⭐⭐⭐</option>
						</select>
					</label>
					<button type="submit" disabled={isPending}>
						Submit
					</button>
				</form>
				<button onClick={onClose}>Close</button>
				{result && (
					<div className={`result-message ${result.type}`}>
						{result.message}
					</div>
				)}
			</div>
		</div>
	);
};

export default Modal;
