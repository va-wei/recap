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
				<p
					style={{
						color: result.type === "error" ? "red" : "green",
						fontWeight: "bold",
					}}
				>
					{result.message}
				</p>
			)}
			{isPending && <p className="message loading">Loading ...</p>}
			<form action={submitAction}>
				<label>
					<span>Username</span>
					<input name="username" type="text" disabled={isPending} />
				</label>
				<label>
					<span>Password</span>
					<input name="password" type="password" disabled={isPending} />
				</label>
				<button type="submit" disabled={isPending}>
					Submit
				</button>
			</form>
		</>
	);
};

export default UsernamePasswordForm;
