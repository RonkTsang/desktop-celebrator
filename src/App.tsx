import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ConfettiOverlay from './pages/ConfettiOverlay';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ConfettiOverlay />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
