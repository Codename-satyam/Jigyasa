import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Settings from "./Components/Settings/Settings.jsx";

//Pages
import Landing from "./Components/LandingPage/Landing.jsx";
import HomePage from "./Components/HomePage/Page1/HomePage.jsx";
import Navbar from "./Components/Navbar/Navbar.jsx";
import Page2 from "./Components/HomePage/Page2/Page2.jsx";
import Page3 from "./Components/HomePage/Page3/Page3.jsx";
import Page4 from "./Components/HomePage/Page4/Page4.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import Contact from "./Components/ContactUs/Contact.jsx";
import About from "./Components/About/About.jsx";
import Dashboard from "./Components/Dashboard/Dashboard.jsx";
//Pages


//The page is responsible for routing the Quiz, Games and Courses
import PlayLanding from "./Components/Play/PlayLanding/PlayLanding.jsx";



//Login and Register
import Login from "./Components/Login/Login.jsx";
import Register from "./Components/Login/Register.jsx";
import ProtectedRoute from "./Components/Auth/ProtectedRoute.jsx";
//Login and Register

import Notes from "./Components/Play/Notes/Notes.jsx";

//Quiz
import QuizPage from "./Components/Play/QuizPage/QuizPage.jsx";
import SelectQuiz from "./Components/Play/QuizPage/SelectQuiz.jsx";
//Quiz

//Games
import Games from "./Components/Play/Games/Games.jsx";
import MemoryGame from "./Components/Play/Games/g1/game1.jsx";
import Guessgame from "./Components/Play/Games/g2/g2.jsx";
import Monumentgame from "./Components/Play/Games/g3/g3.jsx";
import MathGame from "./Components/Play/Games/g4/g4.jsx";
import Game2048 from "./Components/Play/Games/g5/g5.jsx";
import Game6 from "./Components/Play/Games/g6/g6.jsx";
//Games


//Videos
import SubjectSelector from "./Components/Play/Videos/Selector/SubjectCards.jsx";
import TopicSelector from "./Components/Play/Videos/Selector/TopicSelector.jsx";
import VideoPlayer from "./Components/Play/Videos/VideoPlayer.jsx";
import Courses from "./Components/Play/Courses/Courses.jsx";
//Videos

//leaderboard
import LeaderBoard from "./Components/LeaderBoard/LeaderBoard.jsx";
// import ThreeScene from "./Components/ThreeScene.jsx";


//transitions
import PageTransition from "./Components/PageTransition.jsx";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
        <Route
          path="/home"
          element={
            <PageTransition>
              <Navbar />
              <HomePage />
              <Page2 />
              <Page3 />
              <Page4 />
              <Footer />
            </PageTransition>
          }
        />
        <Route
          path="/play/quiz-select"
          element={
            <PageTransition>
              <SelectQuiz />
            </PageTransition>
          }
        />
        <Route
          path="/play/quiz"
          element={
            <PageTransition>
              <Navbar />
              <QuizPage />
            </PageTransition>
          }
        />
        <Route
          path="/play"
          element={
            <PageTransition>
              <Navbar />
              <PlayLanding />
            </PageTransition>
          }
        />
        <Route
          path="/courses"
          element={
            <PageTransition>
              <Navbar />
              <Courses />
            </PageTransition>
          }
        />
        <Route
          path="/contact"
          element={
            <PageTransition>
              <Navbar />
              <Contact />
            </PageTransition>
          }
        />
        <Route
          path="/videos"
          element={
            <PageTransition>
              <Navbar />
              <SubjectSelector />
            </PageTransition>
          }
        />
        <Route
          path="/videos/subject/:subject"
          element={
            <PageTransition>
              <Navbar />
              <TopicSelector />
            </PageTransition>
          }
        />
        <Route
          path="/videos/subject/:subject/topic/:topicIndex"
          element={
            <PageTransition>
              <Navbar />
              <VideoPlayer />
            </PageTransition>
          }
        />
        <Route
          path="/games"
          element={
            <PageTransition>
              <Navbar />
              <Games />
            </PageTransition>
          }
        />
        <Route
          path="/play/games/g1"
          element={
            <PageTransition>
              <Navbar />
              <MemoryGame />
            </PageTransition>
          }
        />
        <Route path="/play/games/g2" element={
          <PageTransition>
            <Navbar />
            <Guessgame />
          </PageTransition>
        } />
        <Route path="/play/games/g3" element={
          <PageTransition>
            <Navbar />
            <Monumentgame />
          </PageTransition>
        } />
        <Route path="/play/games/g4" element={
          <PageTransition>
            <Navbar />
            <MathGame />
          </PageTransition>
        } />
        <Route path="/play/games/g5" element={
          <PageTransition>
            <Navbar />
            <Game2048 />
          </PageTransition>
        } />
        <Route path="/play/games/g6" element={
          <PageTransition>
            <Navbar />
            <Game6 />
          </PageTransition>
        } />
        <Route
          path="/notes"
          element={
            <PageTransition>
              <Navbar />
              <Notes />
            </PageTransition>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <PageTransition>
              <Navbar />
              <LeaderBoard />
            </PageTransition>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition>
                <Navbar />
                <Dashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route
          path="/about"
          element={
            <PageTransition>
              <Navbar />
              <About />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="App">
      <Router>
        <AnimatedRoutes />
      </Router>
    </div>
  );
}
export default App;
