import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Prompt from './Prompt';
import Checklist from './Checklist';
 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Prompt" element={<Prompt />} />
        <Route path="/Checklist" element={<Checklist />} />
      </Routes>
    </BrowserRouter>
  );
}
 
export default App;