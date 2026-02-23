import './Settings.css';
import { useNavigate } from 'react-router-dom';
function Settings(){
    const navigate = useNavigate();
    function Admin(){
        navigate('/admin/login');
    }

    return(
        <div className="settings-page">
            <div className="settings-container">
                <h2>Settings</h2>
                <p className="settings-note">This section will hold application settings. Coming soon.</p>
                <button onClick={Admin} className='settings-button'>Admin Login</button>
            </div>
        </div>
    )
}
export default Settings;