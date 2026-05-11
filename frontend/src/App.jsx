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
import CommitteePage from './pages/CommitteePage'
import ContactPage from './pages/ContactPage'
import ForgotPassword from './pages/ForgotPassword'
import MemberDashboard from './pages/MemberDashboard'
import DynamicPage from './pages/DynamicPage'

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
          <Route path="/events" element={<Events />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/committee/:type" element={<CommitteePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/member-dashboard" element={<MemberDashboard />} />
          <Route path="/page/:slug" element={<DynamicPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  )
}

export default App
