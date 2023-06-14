import { Outlet } from "react-router-dom";
import LayoutDashboardComponentAside from "./components/aside";

export default function LayoutDashboard() {
  return (
    <div className="flex">
      <LayoutDashboardComponentAside />
      <div className="flex-1 p-11">
        <Outlet />
      </div>
    </div>
  );
}
