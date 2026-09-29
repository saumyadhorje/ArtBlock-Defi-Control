import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RoleSelection from './components/auth/RoleSelection';
import Landing from './components/Landing';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ArtistDashboard from './pages/ArtistDashboard';
import Auth from './pages/Auth';
import CuratorDashboard from './pages/CuratorDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import GalleryPage from './pages/gallery/GalleryPage';
import Galleries from './pages/Galleries';
import AINFTGenerator from './pages/AINFTGenerator';
import TransactionSuccess from './pages/TransactionSuccess';
import ScrollToTop from './components/ScrollToTop';


// basically what ive done till now is that when user arrives he signs up with wallet address and then he is redirected to role selection page
// then he selects his role and then he is redirected to his dashboard
// now even if user disconnects wallet and comes back we remember his wallet address and his role in local storage

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar/>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/dashboard/artist" element={
            <ProtectedRoute>
              <ArtistDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/curator" element={
            <ProtectedRoute>
              <CuratorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/investor" element={
            <ProtectedRoute>
              <InvestorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/auth" element={<Auth />} />
          <Route path="/gallery/:galleryId" element={<GalleryPage />} />
          <Route path="/galleries" element={<Galleries />} />
          <Route path="/ai-generator" element={<AINFTGenerator />} />
          <Route path="/transaction-success" element={<TransactionSuccess />} />
        </Routes>
        <Footer/>
      </Router>
    </AuthProvider>
  );
}

export default App;
