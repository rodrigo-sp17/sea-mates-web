import { useHistory, useLocation } from "react-router";

// Used to load authentication details from URL into session
export default function LoginSuccess() {
    const location = useLocation();
    const history = useHistory();

    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const username = params.get('user');
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("loggedUsername", username);

    history.push("/");
    return null;
}