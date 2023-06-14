import { Link, Outlet, useNavigate } from "react-router-dom";
import LayoutDashboardComponentAside from "./components/aside";
import { FaUserCircle } from "react-icons/fa";
import "./styles.scss";
import useOnclickOutside from "react-cool-onclickoutside";
import { useState } from "react";

export default function LayoutDashboard() {
  const navigate = useNavigate();
  const [openMenuUser, setOpenMenuUser] = useState(false);
  const ref = useOnclickOutside(() => {
    setOpenMenuUser(false);
  });

  return (
    <div className="flex">
      <LayoutDashboardComponentAside />
      <div className="flex-1 overflow-x-hidden">
        <header className="shadow-md shadow-slate-400 relative gap-x-5 bg-3 flex items-center justify-end">
          <h3 className="text-slate-100">Olá, Thiago</h3>
          <div ref={ref} onClick={() => setOpenMenuUser(!openMenuUser)}>
            <button
              className={`p-4 icon hover:bg-6 text-sky-50 ${
                openMenuUser ? "bg-8 text-sky-700" : ""
              } hover:text-sky-700 duration-200`}
            >
              <FaUserCircle />
            </button>
            <div
              className={`absolute top-14 translate-y-3 ${
                openMenuUser ? "right-0" : "-right-48"
              } shadow-md bg-6 -translate-x-3 duration-300`}
            >
              <ul className="w-40">
                <li className="border-b duration-150 hover:bg-slate-50">
                  <Link to={"/panel/user"} className="p-3 block">
                    Perfil
                  </Link>
                </li>
                <li
                  onClick={() => navigate("/")}
                  className="p-3  duration-150 hover:bg-slate-50 cursor-pointer"
                >
                  Sair
                </li>
              </ul>
            </div>
          </div>
        </header>
        <div className="p-6 px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
