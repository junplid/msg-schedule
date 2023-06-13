import { Outlet } from "react-router-dom";

export default function LayoutDashboard() {
  return (
    <div>
      <aside>ASIDE</aside>
      <Outlet />
    </div>
  );
}
