import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Details } from './pages/Details';
import { Watchlist } from './pages/Watchlist';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/:mediaType/:id" element={<Details />} />
          <Route path="/watchlist" element={<Watchlist />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;