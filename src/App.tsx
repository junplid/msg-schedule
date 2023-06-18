import { Route, Routes } from "react-router-dom";
import PageLogin from "./pages/login";
import PagePanel from "./pages/panel";
import Page404 from "./pages/404";
import LayoutDashboard from "./layout/dashboard";
import PageMySectionWhatsApp from "./pages/my-section";
import PageMessageWhatsApp from "./pages/message";
import PageShotsWhatsApp from "./pages/shots";
import PageRegister from "./pages/register";
import PageProductsPlans from "./pages/products-plans";

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Page404 />} />
      <Route path="/" element={<PageLogin />} />
      <Route path="/register" element={<PageRegister />} />
      <Route path="/" element={<LayoutDashboard />}>
        <Route path="/panel" element={<PagePanel />} />
        <Route path="/panel/products-plans" element={<PageProductsPlans />} />
        <Route
          path="/panel/whatsapp/my-section"
          element={<PageMySectionWhatsApp />}
        />
        <Route
          path="/panel/whatsapp/message"
          element={<PageMessageWhatsApp />}
        />
        <Route path="/panel/whatsapp/shots" element={<PageShotsWhatsApp />} />
      </Route>
    </Routes>
  );
}
