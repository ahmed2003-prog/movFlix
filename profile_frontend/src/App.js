import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import backgroundImage from './images/wp.jpg';

import SignUp from './components/user_auth/signUp';
import Login from './components/user_auth/login';
import VerifyEmail from './components/utility_functions/verifyEmail';
import Home from './components/home/home';
import Navbar from './components/page_layout/navbar';
import Footer from './components/page_layout/footer';
import Profile from './components/user_auth/profile';
import Movies from './components/titles_listing/movies';
import Sequels from './components/titles_listing/sequels';
import MovieTrailer from './components/title_info_page/movieTrailer';
import SearchResults from './components/titles_listing/searchResults';
import WatchHistory from './components/user_auth/watchHistory';
import SearchHistory from './components/user_auth/searchHistory';
import MovieChatbot from './components/chatbot/ChatBot';
import 'react-chatbot-kit/build/main.css';

const App = () => {
  return (
    <Router>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          background: `url(${backgroundImage}) no-repeat center center fixed`,
          backgroundSize: 'cover'
        }}
      >
        <Navbar />
        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/signUp" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/sequels" element={<Sequels />} />
            <Route
              path="/title-info/movieTrailer"
              element={<MovieTrailer />}
            />
             <Route
              path="/searchResults"
              element={<SearchResults />}
            />
            <Route
              path="/verifyEmail/:uidb64/:token"
              element={<VerifyEmail />}
            />
            <Route
            path="/watchHistory"
            element={<WatchHistory/>} />
            <Route
            path="/searchHistory"
            element={<SearchHistory/>} />
          </Routes>
        </div>
        <MovieChatbot />
        <Footer />
      </div>
    </Router>
  );
};

export default App;
