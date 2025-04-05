import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import FAQ from "./pages/faq";
import Contact from "./pages/contact";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/faq"
          element={<FAQ />}
        />
        <Route
          path="/contact"
          element={<Contact />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;