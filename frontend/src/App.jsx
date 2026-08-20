import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TopBar from './components/TopBar'
import Header from './components/Header'
import MenuBar from './components/MenuBar'
import Footer from './components/Footer'
import NewsTicker from './components/NewsTicker'
import HeroSlider from './components/HeroSlider'
import QuickLinks from './components/QuickLinks'
import MainContent from './components/MainContent'
import HomeCommittee from './components/HomeCommittee'
import HomeJournals from './components/HomeJournals'
import LatestEvents from './components/LatestEvents'
import MembershipEnrollment from './pages/MembershipEnrollment'
import MemberLogin from './pages/MemberLogin'
import Events from './pages/Events'
import NationalEvents from './pages/NationalEvents'
import EventRegister from './pages/EventRegister'
import Conferences from './pages/Conferences'
import Seminars from './pages/Seminars'
import Workshops from './pages/Workshops'
import UpcomingEvents from './pages/UpcomingEvents'
import Downloads from './pages/Downloads'
import BrainStormingSessions from './pages/BrainStormingSessions'
import CommitteePage from './pages/CommitteePage'
import ContactPage from './pages/ContactPage'
import ForgotPassword from './pages/ForgotPassword'
import MemberDashboard from './pages/MemberDashboard'
import VerifyCertificate from './pages/VerifyCertificate'
import DynamicPage from './pages/DynamicPage'
import UserRegister from './pages/UserRegister'
import UserLogin from './pages/UserLogin'
import UserDashboard from './pages/UserDashboard'
import Awards from './pages/Awards'
import AwardDetails from './pages/AwardDetails'
import SubmitManuscript from './pages/SubmitManuscript'
import EditorDashboard from './pages/EditorDashboard'
import ReviewerDashboard from './pages/ReviewerDashboard'


const Home = () => (
  <>
    <NewsTicker />
    <HeroSlider />
    <QuickLinks />
    <MainContent />
    <HomeCommittee />
    <LatestEvents />
    <HomeJournals />
  </>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <TopBar />
        <Header />
        <MenuBar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/membership" element={<MembershipEnrollment />} />
          <Route path="/membership/login" element={<MemberLogin />} />
          <Route path="/login" element={<MemberLogin />} />
          <Route path="/user/register" element={<UserRegister />} />
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/submit-manuscript" element={<SubmitManuscript />} />
          <Route path="/editor/dashboard" element={<EditorDashboard />} />
          <Route path="/reviewer/dashboard" element={<ReviewerDashboard />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/awards/:id" element={<AwardDetails />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/national" element={<NationalEvents />} />
          <Route path="/events/register/:id" element={<EventRegister />} />
          <Route path="/events/conferences" element={<Conferences />} />
          <Route path="/events/seminars" element={<Seminars />} />
          <Route path="/events/workshops" element={<Workshops />} />
          <Route path="/events/upcoming" element={<UpcomingEvents />} />
          <Route path="/events/brain-stroming-sessions" element={<BrainStormingSessions />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/committee/:type" element={<CommitteePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/member-dashboard" element={<MemberDashboard />} />
          <Route path="/verify-certificate" element={<VerifyCertificate />} />
          <Route path="/verify-certificate/:enrollmentId" element={<VerifyCertificate />} />
          <Route path="/page/*" element={<DynamicPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  )
}

export default App
