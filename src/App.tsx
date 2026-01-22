import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './layouts/ProtectedRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import KYCVerification from './pages/Onboarding/KYCVerification';
import BankConnect from './pages/Onboarding/BankConnect';
import Dashboard from './pages/Dashboard/Dashboard';
import ApplyLoan from './pages/Loan/ApplyLoan';
import LoanDetails from './pages/Loan/LoanDetails';
import MyLoans from './pages/Loan/MyLoans';
import Transactions from './pages/Transactions/Transactions';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/kyc" element={<KYCVerification />} />
            <Route path="/bank-accounts" element={<BankConnect />} />
            <Route path="/loans/apply" element={<ApplyLoan />} />
            <Route path="/loans/:loanId" element={<LoanDetails />} />
            <Route path="/loans" element={<MyLoans />} />
            <Route path="/transactions" element={<Transactions />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
