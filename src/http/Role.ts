import { jwtDecode } from "jwt-decode";

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const getRole = () => {
	const token = localStorage.getItem("accessToken")

	if (token) {
		const decoded = jwtDecode(token);
		return decoded[ROLE_CLAIM];

	}

	return null;
}

export default getRole;
