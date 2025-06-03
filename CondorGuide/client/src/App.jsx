import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import AvailableClassrooms from './components/AvailableClassrooms';
import LoginPage from './components/LoginPage'; 
import SignUpPage from './components/SignUp'; 

import { ThemeContext } from './context/ThemeContext';

const App = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={theme === 'dark' ? 'bg-dark text-light min-vh-100 d-flex flex-column' : 'bg-light text-dark min-vh-100 d-flex flex-column'}>
      <Router>
        <Header />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/classrooms" element={<AvailableClassrooms />} />
             <Route path="/login" element={<LoginPage />} />       
            <Route path="/signup" element={<SignUpPage />} /> 
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
};

export default App;
