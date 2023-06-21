import { Link, Outlet, useNavigate } from "react-router-dom";
import LayoutDashboardComponentAside from "./components/aside";
import { FaUserCircle } from "react-icons/fa";
import "./styles.scss";
import useOnclickOutside from "react-cool-onclickoutside";
import { Dispatch, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  propsAuthActions,
  propsInitialState,
} from "../../reducers/auth.reducer";
import { useCookies } from "react-cookie";
import mainAPI from "../../providers/api.provider";
import { LoadComponent } from "../../components/load";

export default function LayoutDashboard() {
  const auth = useSelector(
    (state: any): propsInitialState => state._root.entries[0][1]
  );

  const navigate = useNavigate();
  const [openMenuUser, setOpenMenuUser] = useState(false);
  const [cookies, _setCookies, removeCookie] = useCookies(["auth"]);
  const [loadPage, setLoadPage] = useState<boolean>(false as boolean);

  const dispatch: Dispatch<propsAuthActions> = useDispatch();
  const ref = useOnclickOutside(() => {
    setOpenMenuUser(false);
  });

  useEffect(() => {
    if (cookies.auth) {
      (async () => {
        try {
          const { data } = await mainAPI.get(
            `/v1/public/get/verify-token/${cookies.auth}`
          );
          dispatch({
            type: "LOGIN",
            payload: {
              token: cookies.auth,
              ...data.data,
            },
          });
          mainAPI.defaults.headers.common.authorization = `BEARER ${cookies.auth}`;
          setTimeout(() => setLoadPage(true), 1000);
        } catch (error) {
          dispatch({ type: "LOGOUT" });
          removeCookie("auth");
          navigate("/");
        }
      })();
      return;
    }
    setLoadPage(true);
  }, []);

  return (
    <div className="flex">
      <LayoutDashboardComponentAside />
      <div className="flex-1 overflow-x-hidden">
        {!loadPage ? (
          <div className="flex items-center gap-y-2 flex-col justify-center w-full h-full bg-3">
            <span className="text-slate-50 font-medium text-lg">
              Checando integridade
            </span>
            <LoadComponent />
          </div>
        ) : (
          <>
            <header className="shadow-md shadow-slate-400 relative gap-x-5 bg-3 flex items-center justify-end">
              <h3 className="text-slate-100">
                Olá, {auth.user?.full_name.split(" ")[0]}
              </h3>
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
                      onClick={() => {
                        dispatch({ type: "LOGOUT" });
                        removeCookie("auth", {
                          maxAge: 2147483647,
                          path: "/",
                        });
                        navigate("/");
                      }}
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
          </>
        )}
      </div>
    </div>
  );
}
