import { useActionState } from "react";

const UsernamePasswordForm = ({ onSubmit, errorMessage }) => {
	const [result, submitAction, isPending] = useActionState(
		async (previousState, formData) => {
			const username = formData.get("username");
			const password = formData.get("password");

			if (!username || !password) {
				return {
					type: "error",
					message: `Please fill in your username and password.`,
				};
			}

			const submitResult = await onSubmit(username, password);

			return {
				type: "success",
				message: `Form submitted successfully!`,
			};
		},
		null
	);

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
					<input
						name="password"
						type="password"
						disabled={isPending}
					/>
				</label>
				<button type="submit" disabled={isPending}>
					Submit
				</button>
			</form>
		</>
	);
};

export default UsernamePasswordForm;
