import { jwtDecode } from "jwt-decode";

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const ID_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

export const getRole = () => {
	const token = localStorage.getItem("accessToken")

	if (token) {
		const decoded = jwtDecode(token);
		return decoded[ROLE_CLAIM];

	}

	return null;
}

const getId = () => {
	const token = localStorage.getItem("accessToken")

	if (token) {
		const decoded = jwtDecode(token);
		return decoded[ID_CLAIM];

	}

	return null;
}


export default getRole;
