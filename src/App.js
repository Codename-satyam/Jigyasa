import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Navbar from "./Components/Navbar/Navbar.jsx";
import PageTransition from "./Components/PageTransition.jsx";
import LoadingPage from "./Components/LoadingPage/LoadingPage.jsx";
import BackButton from "./Assets/BackButton/BackButton.jsx";
import ProtectedRoute from "./Components/Auth/ProtectedRoute.jsx";
import RoleProtectedRoute from "./Components/Auth/RoleProtectedRoute.jsx";
import AdminProtectedRoute from "./Components/Auth/AdminProtectedRoute.jsx";

// Lazy imports
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
const Dashboard = lazy(() => import("./Components/Dashboard/User/Dashboard.jsx"));
const TeacherDashboard = lazy(() => import("./Components/Dashboard/Teacher/TeacherDashboard.jsx"));
const CreateQuiz = lazy(() => import("./Components/Dashboard/Quiz/CreateQuiz.jsx"));
const Admin = lazy(() => import("./Components/Dashboard/Admin/Admin.jsx"));

const PlayLanding = lazy(() => import("./Components/Play/PlayLanding/PlayLanding.jsx"));

const Login = lazy(() => import("./Components/Login/Login.jsx"));
const Register = lazy(() => import("./Components/Login/Register.jsx"));
const AdminLogin = lazy(() => import("./Components/Login/AdminLogin.jsx"));
const BlockedUser = lazy(() => import("./Components/Login/BlockedUser.jsx"));

const Notes = lazy(() => import("./Components/Play/Notes/Notes.jsx"));

const QuizPage = lazy(() => import("./Components/Play/QuizPage/QuizPage.jsx"));
const SelectQuiz = lazy(() => import("./Components/Play/QuizPage/SelectQuiz.jsx"));
const TeacherQuizAttempt = lazy(() => import("./Components/Play/QuizPage/TeacherQuizAttempt.jsx"));

const Games = lazy(() => import("./Components/Play/Games/Games.jsx"));
const MemoryGame = lazy(() => import("./Components/Play/Games/g1/game1.jsx"));
const Guessgame = lazy(() => import("./Components/Play/Games/g2/g2.jsx"));
const Monumentgame = lazy(() => import("./Components/Play/Games/g3/g3.jsx"));
const MathGame = lazy(() => import("./Components/Play/Games/g4/g4.jsx"));
const Game2048 = lazy(() => import("./Components/Play/Games/g5/g5.jsx"));
const Game6 = lazy(() => import("./Components/Play/Games/g6/g6.jsx"));

const SubjectSelector = lazy(() => import("./Components/Play/Videos/Selector/SubjectCards/SubjectCards.jsx"));
const TopicSelector = lazy(() => import("./Components/Play/Videos/Selector/TopicSelector/TopicSelector.jsx"));
const VideoPlayer = lazy(() => import("./Components/Play/Videos/VideoPlayer.jsx"));
const Courses = lazy(() => import("./Components/Play/Courses/Courses.jsx"));

const LeaderBoard = lazy(() => import("./Components/LeaderBoard/LeaderBoard.jsx"));
const NotFound = lazy(() => import("./Components/Error/Error404.jsx"));

function AnimatedRoutes() {
  const location = useLocation();
  const isHomePage = location.pathname === "/home";
  const isLandingPage = location.pathname === "/";

  return (
    <>
      <Navbar />
      {!isHomePage && !isLandingPage && <BackButton />}

      <AnimatePresence mode="wait">
        <Suspense
          fallback={
            <div className="global-loader">
              <LoadingPage />
            </div>
          }
        >
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Landing /></PageTransition>} />

            <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />

            <Route path="/home" element={
              <PageTransition>
                <HomePage />
                <Page2 />
                <Page3 />
                <Page4 />
                <Page5 />
                <Page6 />
                <Footer />
              </PageTransition>
            } />

            <Route path="/play" element={<PageTransition><PlayLanding /></PageTransition>} />
            <Route path="/play/quiz-select" element={<PageTransition><SelectQuiz /></PageTransition>} />
            <Route path="/play/quiz" element={<PageTransition><QuizPage /></PageTransition>} />
            <Route path="/play/teacher-quiz/:quizId" element={<PageTransition><TeacherQuizAttempt /></PageTransition>} />

            <Route path="/courses" element={<PageTransition><Courses /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />

            <Route path="/videos" element={<PageTransition><SubjectSelector /></PageTransition>} />
            <Route path="/videos/subject/:subject" element={<PageTransition><TopicSelector /></PageTransition>} />
            <Route path="/videos/subject/:subject/topic/:topicIndex" element={<PageTransition><VideoPlayer /></PageTransition>} />

            <Route path="/games" element={<PageTransition><Games /></PageTransition>} />
            <Route path="/play/games/g1" element={<PageTransition><MemoryGame /></PageTransition>} />
            <Route path="/play/games/g2" element={<PageTransition><Guessgame /></PageTransition>} />
            <Route path="/play/games/g3" element={<PageTransition><Monumentgame /></PageTransition>} />
            <Route path="/play/games/g4" element={<PageTransition><MathGame /></PageTransition>} />
            <Route path="/play/games/g5" element={<PageTransition><Game2048 /></PageTransition>} />
            <Route path="/play/games/g6" element={<PageTransition><Game6 /></PageTransition>} />

            <Route path="/notes" element={<PageTransition><Notes /></PageTransition>} />
            <Route path="/leaderboard" element={<PageTransition><LeaderBoard /></PageTransition>} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <PageTransition><Dashboard /></PageTransition>
              </ProtectedRoute>
            } />

            <Route path="/teacher-dashboard" element={
              <RoleProtectedRoute requiredRoles={['teacher']}>
                <PageTransition><TeacherDashboard /></PageTransition>
              </RoleProtectedRoute>
            } />

            <Route path="/create-quiz" element={
              <RoleProtectedRoute requiredRoles={['teacher']}>
                <PageTransition><CreateQuiz /></PageTransition>
              </RoleProtectedRoute>
            } />

            <Route path="/admin" element={
              <AdminProtectedRoute>
                <PageTransition><Admin /></PageTransition>
              </AdminProtectedRoute>
            } />

            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
            <Route path="/blocked" element={<PageTransition><BlockedUser /></PageTransition>} />

            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
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