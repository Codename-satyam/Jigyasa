import { useNavigate } from "react-router-dom";
import "./BackButton.css"; 

function BackButton() {
    const navigate = useNavigate();

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/");
        }
    };

    return (
        <button
            type="button"
            className="retro-back-btn"
            onClick={handleBack}
            aria-label="Go back"
        >
            <span className="btn-icon">←</span>
            <span className="btn-text">BACK</span>
        </button>
    );
}

export default BackButton;