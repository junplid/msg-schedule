import { Route, Routes } from "react-router-dom";
import PageLogin from "./pages/login";
import PagePanel from "./pages/panel";
import Page404 from "./pages/404";
import LayoutDashboard from "./layout/dashboard";

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Page404 />} />
      <Route path="/" element={<PageLogin />} />
      <Route path="/" element={<LayoutDashboard />}>
        <Route path="/painel" element={<PagePanel />} />
      </Route>
    </Routes>
  );
}
