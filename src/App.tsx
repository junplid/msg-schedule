import { Route, Routes } from "react-router-dom";
import PageLogin from "./pages/login";
import PagePanel from "./pages/panel";

export default function App() {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <>
            <h2>Página não encontrada</h2>
          </>
        }
      />
      <Route path="/" element={<PageLogin />} />
      <Route>
        <Route path="/painel" element={<PagePanel />} />
      </Route>
    </Routes>
  );
}
