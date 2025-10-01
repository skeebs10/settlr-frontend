import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { StaffFooterBar } from './components/StaffFooterBar';
import { HomePage } from './pages/HomePage';
import { JoinPage } from './pages/JoinPage';
import { SplitBillPage } from './pages/SplitBillPage';
import ReviewPage from './pages/ReviewPage';
import { SuccessPage } from './pages/SuccessPage';
import { StaffPage } from './pages/StaffPage';
import { StaffTabDetailsPage } from './pages/StaffTabDetailsPage';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-black">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/split" element={<SplitBillPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/staff/dashboard" element={<StaffPage />} />
          <Route path="/staff/tab/:id" element={<StaffTabDetailsPage />} />
        </Routes>
        <StaffFooterBar />
        <Toaster position="top-center" />
      </div>
    </Router>
  );
}

export default App;