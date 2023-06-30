import { Route, Routes } from "react-router-dom";
import PageLogin from "./pages/login";
import PagePanel from "./pages/panel";
import Page404 from "./pages/404";
import LayoutDashboard from "./layout/dashboard";
import PageMySectionWhatsApp from "./pages/my-section";
import PageMessageWhatsApp from "./pages/message";
import PageRegister from "./pages/register";
import PageProductsPlans from "./pages/products-plans";
import PageCostumer from "./pages/customer";
import PageChangePassword from "./pages/change-password";
import PageUser from "./pages/user";
import PageFinance from "./pages/finance";

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Page404 />} />
      <Route path="/change-password" element={<PageChangePassword />} />
      <Route path="/" element={<PageLogin />} />
      <Route path="/register" element={<PageRegister />} />
      <Route path="/" element={<LayoutDashboard />}>
        <Route path="/panel/user" element={<PageUser />} />
        <Route path="/panel/finance" element={<PageFinance />} />
        <Route path="/panel" element={<PagePanel />} />
        <Route path="/panel/customer" element={<PageCostumer />} />
        <Route path="/panel/products-plans" element={<PageProductsPlans />} />
        <Route
          path="/panel/whatsapp/my-section"
          element={<PageMySectionWhatsApp />}
        />
        <Route
          path="/panel/whatsapp/message"
          element={<PageMessageWhatsApp />}
        />
      </Route>
    </Routes>
  );
}
