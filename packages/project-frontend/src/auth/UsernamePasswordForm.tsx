import { useActionState } from "react";

interface FormResult {
	type: "success" | "error";
	message: string;
}

interface UsernamePasswordFormProps {
	onSubmit: (username: string, password: string) => Promise<void>;
	errorMessage?: string;
}

const UsernamePasswordForm: React.FC<UsernamePasswordFormProps> = ({
	onSubmit,
	errorMessage,
}) => {
	const [result, submitAction, isPending] = useActionState<
		FormResult | null,
		FormData
	>(async (_previousState, formData) => {
		const username = formData.get("username") as string;
		const password = formData.get("password") as string;

		if (!username || !password) {
			return {
				type: "error",
				message: "Please fill in your username and password.",
			};
		}

		await onSubmit(username, password);

		return {
			type: "success",
			message: "Form submitted successfully!",
		};
	}, null);

	return (
		<>
			{result && (
				<p className={`message ${result.type}`}>{result.message}</p>
			)}
			{isPending && <p className="message loading">Loading ...</p>}
			<form className="form-container" action={submitAction}>
				<label className="form-label">
					<span>Username</span>
					<input
						className="form-input"
						name="username"
						type="text"
						disabled={isPending}
					/>
				</label>
				<label className="form-label">
					<span>Password</span>
					<input
						className="form-input"
						name="password"
						type="password"
						disabled={isPending}
					/>
				</label>
				<button
					className="form-button"
					type="submit"
					disabled={isPending}
				>
					Submit
				</button>
			</form>
		</>
	);
};

export default UsernamePasswordForm;
