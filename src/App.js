import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Components/LandingPage/Landing.jsx";
import HomePage from "./Components/HomePage/HomePage.jsx";
import Navbar from "./Components/Navbar/Navbar.jsx";
import Page2 from "./Components/Page2/Page2.jsx";
import Page3 from "./Components/Page3/Page3.jsx";
import Page4 from "./Components/Page4/Page4.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import QuizPage from "./Components/QuizPage/QuizPage.jsx";
import Contact from "./Components/ContactUs/Contact.jsx";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/home"
            element={
              <>
                <Navbar />
                <HomePage />
                <Page2 />
                <Page3 />
                <Page4 />
                <Footer />
              </>
            }
          />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
