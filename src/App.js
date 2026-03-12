import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Eagerly loaded (used across many routes)
import Navbar from "./Components/Navbar/Navbar.jsx";
import PageTransition from "./Components/PageTransition.jsx";
import LoadingPage from "./Components/LoadingPage/LoadingPage.jsx";
import ProtectedRoute from "./Components/Auth/ProtectedRoute.jsx";
import RoleProtectedRoute from "./Components/Auth/RoleProtectedRoute.jsx";
import AdminProtectedRoute from "./Components/Auth/AdminProtectedRoute.jsx";

// Lazy loaded pages
const Settings = lazy(() => import("./Components/Settings/Settings.jsx"));
const Landing = lazy(() => import("./Components/LandingPage/Landing.jsx"));
const HomePage = lazy(() => import("./Components/HomePage/Page1/HomePage.jsx"));
const Page2 = lazy(() => import("./Components/HomePage/Page2/Page2.jsx"));
const Page3 = lazy(() => import("./Components/HomePage/Page3/Page3.jsx"));
const Page4 = lazy(() => import("./Components/HomePage/Page4/Page4.jsx"));
const Page5 = lazy(() => import("./Components/HomePage/Page5/Page5.jsx"));
const Page6 = lazy(() => import("./Components/HomePage/Page6/Page6.jsx"));
const Footer = lazy(() => import("./Components/HomePage/Footer/Footer.jsx"));
const Contact = lazy(() => import("./Components/ContactUs/Contact.jsx"));
const About = lazy(() => import("./Components/About/About.jsx"));
const Dashboard = lazy(() => import("./Components/Dashboard/Dashboard.jsx"));
const TeacherDashboard = lazy(() => import("./Components/Dashboard/TeacherDashboard.jsx"));
const CreateQuiz = lazy(() => import("./Components/Dashboard/CreateQuiz.jsx"));
const Admin = lazy(() => import("./Components/Dashboard/Admin.jsx"));

// Play
const PlayLanding = lazy(() => import("./Components/Play/PlayLanding/PlayLanding.jsx"));

// Login and Register
const Login = lazy(() => import("./Components/Login/Login.jsx"));
const Register = lazy(() => import("./Components/Login/Register.jsx"));
const AdminLogin = lazy(() => import("./Components/Login/AdminLogin.jsx"));
const BlockedUser = lazy(() => import("./Components/Login/BlockedUser.jsx"));

const Notes = lazy(() => import("./Components/Play/Notes/Notes.jsx"));

// Quiz
const QuizPage = lazy(() => import("./Components/Play/QuizPage/QuizPage.jsx"));
const SelectQuiz = lazy(() => import("./Components/Play/QuizPage/SelectQuiz.jsx"));

// Games
const Games = lazy(() => import("./Components/Play/Games/Games.jsx"));
const MemoryGame = lazy(() => import("./Components/Play/Games/g1/game1.jsx"));
const Guessgame = lazy(() => import("./Components/Play/Games/g2/g2.jsx"));
const Monumentgame = lazy(() => import("./Components/Play/Games/g3/g3.jsx"));
const MathGame = lazy(() => import("./Components/Play/Games/g4/g4.jsx"));
const Game2048 = lazy(() => import("./Components/Play/Games/g5/g5.jsx"));
const Game6 = lazy(() => import("./Components/Play/Games/g6/g6.jsx"));

// Videos
const SubjectSelector = lazy(() => import("./Components/Play/Videos/Selector/SubjectCards.jsx"));
const TopicSelector = lazy(() => import("./Components/Play/Videos/Selector/TopicSelector.jsx"));
const VideoPlayer = lazy(() => import("./Components/Play/Videos/VideoPlayer.jsx"));
const Courses = lazy(() => import("./Components/Play/Courses/Courses.jsx"));

// Leaderboard
const LeaderBoard = lazy(() => import("./Components/LeaderBoard/LeaderBoard.jsx"));

// 404
const NotFound = lazy(() => import("./Components/Error/Error404.jsx"));

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingPage />}>
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
              <Page5 />
              <Page6 />
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
        <Route
          path="/teacher-dashboard"
          element={
            <RoleProtectedRoute requiredRoles={['teacher']}>
              <PageTransition>
                <TeacherDashboard />
              </PageTransition>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/create-quiz"
          element={
            <RoleProtectedRoute requiredRoles={['teacher']}>
              <PageTransition>
                <CreateQuiz />
              </PageTransition>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <PageTransition>
                <Admin />
              </PageTransition>
            </AdminProtectedRoute>
          }
        />
        <Route path="/login" element={<PageTransition><Login/></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route path="/blocked" element={<PageTransition><BlockedUser /></PageTransition>} />
        <Route 
          path="/unauthorized" 
          element={
            <PageTransition>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                flexDirection: 'column',
                gap: '20px',
                textAlign: 'center',
                padding: '20px'
              }}>
                <h1 style={{ fontSize: '3rem', margin: '0 0 10px' }}>Access Denied</h1>
                <p style={{ fontSize: '1.2rem', margin: 0 }}>You don't have permission to access this page</p>
                <p style={{ fontSize: '0.95rem', opacity: 0.8 }}>Please contact an administrator if you believe this is an error.</p>
              </div>
            </PageTransition>
          } 
        />
        <Route
          path="/about"
          element={
            <PageTransition>
              <Navbar />
              <About />
            </PageTransition>
          }
        />        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
      </Suspense>
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
