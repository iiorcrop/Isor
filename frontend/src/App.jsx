import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import MembershipEnrollment from './pages/MembershipEnrollment'
import MemberLogin from './pages/MemberLogin'
import CommitteePage from './pages/CommitteePage'
import ContactPage from './pages/ContactPage'
import ForgotPassword from './pages/ForgotPassword'
import MemberDashboard from './pages/MemberDashboard'

const Home = () => (
  <>
    <NewsTicker />
    <HeroSlider />
    <QuickLinks />
    <MainContent />
    <HomeCommittee />
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
          <Route path="/login" element={<MemberLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/committee/:type" element={<CommitteePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/member-dashboard" element={<MemberDashboard />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  )
}

export default App
