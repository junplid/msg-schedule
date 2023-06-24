import "./styles.scss";
import { LoadComponent } from "../../components/load";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/authLogin.hook";
import { useDispatch } from "react-redux";
import { Dispatch, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { propsAuthActions } from "../../reducers/auth.reducer";
import mainAPI from "../../providers/api.provider";

export default function PageLogin() {
  const { error, handleValues, load, onSubmit } = useLogin();
  const [loadPage, setLoadPage] = useState<boolean>(false as boolean);
  const [cookies, _setCookies, removeCookie] = useCookies(["auth"]);
  const dispatch: Dispatch<propsAuthActions> = useDispatch();
  const navigate = useNavigate();

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
          navigate("/panel");
        } catch (error) {
          dispatch({ type: "LOGOUT" });
          removeCookie("auth");
          setTimeout(() => setLoadPage(true), 1200);
        }
      })();
      return;
    }
    setTimeout(() => setLoadPage(true), 400);
  }, []);

  return (
    <div className="min-h-screen py-5 px-4 flex items-center justify-center">
      {!loadPage ? (
        <div className="p-4 bg-3 flex items-center flex-col gap-3">
          <span className="text-slate-50 font-medium text-lg">Aguarde</span>
          <LoadComponent />
        </div>
      ) : (
        <div className="flex bg-2 shadow-md">
          <img
            src={"/mobile_message.png"}
            alt="svg"
            className="md:block hidden img_message p-10"
          />
          <div className="bg-5 p-10 py-8 flex flex-col justify-between gap-4 min-h-full">
            <div>
              <h1 className="font-medium text-2xl text-center text-slate-700">
                Faça login na sua conta
              </h1>
            </div>
            <form
              className="flex flex-col gap-7 items-baseline justify-between flex-1"
              onSubmit={onSubmit}
            >
              <div className="grid gap-y-3">
                <label className="flex flex-col gap-y-2">
                  <span className="text-base font-medium text-slate-800">
                    E-mail
                  </span>
                  <div
                    style={{ maxWidth: 280 }}
                    className="gap-y-1 flex flex-col"
                  >
                    <input
                      placeholder="xxx@xxx.xxx"
                      className="py-3 px-4 shadow-sm w-full outline-none"
                      disabled={load}
                      type="text"
                      name="email"
                      onChange={handleValues}
                      autoComplete="off"
                    />
                    {error?.path.includes("email") && (
                      <p className="text-red-600 bg-red-200 max-w-xs px-1">
                        {error.message}
                      </p>
                    )}
                  </div>
                </label>
                <div className="flex flex-col items-end">
                  <label className="flex flex-col gap-y-2">
                    <span className="text-base font-medium text-slate-800">
                      Senha
                    </span>
                    <div
                      style={{ maxWidth: 280 }}
                      className="gap-y-1 flex flex-col"
                    >
                      <input
                        disabled={load}
                        className="py-3 px-4 shadow-sm w-full outline-none"
                        type="password"
                        placeholder="*****"
                        name="password"
                        onChange={handleValues}
                      />
                      {error?.path.includes("password") && (
                        <p className="text-red-600 bg-red-200 px-1">
                          {error.message}
                        </p>
                      )}
                    </div>
                  </label>
                  <Link
                    to={"/change-password"}
                    className="text-base font-medium text-cyan-800 mt-1 block"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>
              <button
                disabled={load}
                type="submit"
                className="w-full flex justify-center items-center bg-3 text-slate-100 py-0 h-12 font-semibold hover:bg-2 duration-200"
              >
                {load ? <LoadComponent /> : "Entrar"}
              </button>
            </form>
            <div>
              <p className="text-slate-700 text-base text-center">
                Não tem conta?{" "}
                <Link className="text-cyan-800 font-medium" to={"/register"}>
                  registre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
