import { useNavigate } from "react-router-dom";

function BackButton() {
    const navigate = useNavigate();

    return (
        <button style={{ marginBottom: "20px", padding: "10px 20px", backgroundColor: "#000", color: "#fff", border: "2px solid #fff", borderRadius: "5px" }} onClick={() => navigate(-1)}> ← Back</button>
    );
}
export default BackButton;