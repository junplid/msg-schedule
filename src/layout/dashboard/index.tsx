import { Outlet, useNavigate } from "react-router-dom";
import LayoutDashboardComponentAside from "./components/aside";
import { FaUserCircle } from "react-icons/fa";
import "./styles.scss";
import useOnclickOutside from "react-cool-onclickoutside";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  propsAuthActions,
  propsInitialState,
} from "../../reducers/auth.reducer";
import { useCookies } from "react-cookie";
import mainAPI from "../../providers/api.provider";
import { LoadComponent } from "../../components/load";
import { AxiosError } from "axios";
import QRCode from "react-qr-code";

export default function LayoutDashboard() {
  const auth = useSelector(
    (state: any): propsInitialState => state._root.entries[0][1]
  );

  const navigate = useNavigate();
  const [openMenuUser, setOpenMenuUser] = useState(false);
  const [cookies, _setCookies, removeCookie] = useCookies(["auth"]);
  const [loadPage, setLoadPage] = useState<boolean>(false as boolean);
  const [loadOrderRenew, setLoadOrderRenew] = useState<boolean>(
    false as boolean
  );
  const [dataQR, setdataQR] = useState<string | null>(null as string | null);

  const dispatch: Dispatch<propsAuthActions> = useDispatch();
  const ref = useOnclickOutside(() => {
    setOpenMenuUser(false);
  });
  const refQR = useOnclickOutside(() => {
    setdataQR(null);
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

  const onOrderRenewLicense = useCallback(async () => {
    try {
      setLoadOrderRenew(true);
      const { data } = await mainAPI.post(
        "/v1/user/create/order-renew-license"
      );
      setdataQR(data.data);
      setLoadOrderRenew(false);
    } catch (error) {
      setLoadOrderRenew(false);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          dispatch({ type: "LOGOUT" });
          removeCookie("auth", {
            maxAge: 2147483647,
            path: "/",
          });
          navigate("/");
          return;
        }
        return;
      }
    }
  }, []);

  return (
    <div className="flex">
      {dataQR && (
        <div className="z-20 fixed backdrop-blur-md bg-black/80 top-0 left-0 w-screen h-screen flex justify-center items-center">
          <div
            ref={refQR}
            className="bg-6 max-w-sm p-4 gap-y-4 shadow-xl flex flex-col"
          >
            <span className="text-lg text-center leading-tight font-medium text-slate-900">
              Leia o QR Code Pix com seu aplicativo bancario e recarregue a
              página após o pagamento.
            </span>
            <div className="bg-white max-w-sm">
              <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={dataQR}
                viewBox={`0 0 256 256`}
              />
            </div>
          </div>
        </div>
      )}
      <LayoutDashboardComponentAside />
      <div className="flex-1 overflow-x-hidden">
        {!loadPage ? (
          <div className="flex items-center gap-y-2 flex-col justify-center w-full h-full bg-secundary">
            <span className="text-slate-50 font-medium text-lg">
              Checando integridade
            </span>
            <LoadComponent />
          </div>
        ) : (
          <>
            <header
              className={`shadow-md shadow-slate-400 relative gap-x-5 bg-primary flex items-center ${
                auth.user?.type !== "root" ? "justify-between" : "justify-end"
              } pl-5`}
            >
              {auth.user?.type !== "root" && (
                <div className="flex gap-x-3 items-center">
                  {auth.user?.due_date && (
                    <span className="text-slate-100">
                      {new Date(auth.user.due_date) < new Date()
                        ? "Sua licença expirou dia:"
                        : "Sua licença expira:"}{" "}
                      {new Date(auth.user.due_date).toLocaleDateString("pt-br")}
                    </span>
                  )}
                  <button
                    disabled={loadOrderRenew}
                    onClick={() => {
                      if (!loadOrderRenew) {
                        onOrderRenewLicense();
                      }
                    }}
                    className="text-slate-100 hover:bg-1 duration-200 bg-2 px-4 py-1"
                  >
                    {loadOrderRenew ? (
                      <LoadComponent />
                    ) : (
                      "Renovar para +31 dias"
                    )}
                  </button>
                </div>
              )}
              <div className="flex items-center gap-x-4 justify-end">
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
                        <div
                          onClick={() => navigate("/panel/user")}
                          className="p-3 block"
                        >
                          Perfil
                        </div>
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
