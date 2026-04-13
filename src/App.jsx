import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import EditDump from "./pages/EditDump";
import Chat from "./pages/Chat";
import Hives from "./pages/Hives";
import HiveFeed from "./pages/HiveFeed";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import { useContext } from "react";    
import { Toaster } from "react-hot-toast";
import GlobalLoader from "./components/GlobalLoader";
import "./app.css";
const PrivateRoute = ({ children }) => {
    const { token, loading } = useContext(AuthContext);
    if (loading) return <GlobalLoader fullScreen={true} message="Authenticating Cortex..." />;
    return token ? children : <Navigate to="/login" />;
};
function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#292524', // stone-800
            color: '#fff',
            borderRadius: '12px',
          },
        }} 
      />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/dump/edit/:id" element={
              <PrivateRoute>
                  <EditDump />
              </PrivateRoute>
          } />
          <Route path="/chat" element={
            <PrivateRoute>
                <Chat />
            </PrivateRoute>
          } />
          <Route path="/hives" element={
              <PrivateRoute>
                  <Hives />
              </PrivateRoute>
          } />
          <Route path="/hive/:id" element={
              <PrivateRoute>
                  <HiveFeed />
              </PrivateRoute>
          } />
          <Route path="/profile" element={
              <PrivateRoute>
                  <Profile />
              </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;