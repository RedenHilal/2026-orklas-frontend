import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: 'http://localhost:8080',
	withCredentials: true,
	headers: {
    	'Content-Type': 'application/json',
    	'Accept': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
	const token = localStorage.getItem('accessToken');

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	else {
		delete config.headers.Authorization;
	}

	return config;
})

axiosInstance.interceptors.response.use(
    function (response) {
        return response;
    },
    (error: unknown) => {
		if (axios.isAxiosError(error) && error.response?.status === 401){
			localStorage.removeItem("accessToken");
			window.location.href = '/login';
		}

        return Promise.reject(error);
    }
);

export default axiosInstance;


