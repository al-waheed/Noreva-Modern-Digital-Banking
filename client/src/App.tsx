import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import SendMoney from "./pages/SendMoney";
import Transactions from "./pages/Transactions";
import TransactionReceipt from "./pages/TransactionReceipt";
import Cards from "./pages/Cards";
import ScheduledPayments from "./pages/ScheduledPayments";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/send-money" element={<SendMoney />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/cards" element={<Cards />} />
        <Route
          path="/transactions/:reference"
          element={<TransactionReceipt />}
        />
        <Route path="/scheduled-payments" element={<ScheduledPayments />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
