import "./styles.scss";
import { LoadComponent } from "../../components/load";
import { Link } from "react-router-dom";
import { useLogin } from "../../hooks/authLogin.hook";
import { useSelector } from "react-redux";
import { propsRootReducer } from "../../reducers";
import { useEffect, useState } from "react";

export default function PageLogin() {
  const { error, handleValues, load, onSubmit } = useLogin();
  const [loadPage, setLoadPage] = useState<boolean>(false as boolean);
  const { auth } = useSelector((state: propsRootReducer) => state);

  useEffect(() => {
    if (auth.isAuthenticated) {
      // verificar o token
      // manda para o painel
    } else {
      // buscar o token no cookie
    }
    setLoadPage(true);
  }, []);

  return (
    <div className="min-h-screen py-5 px-4 flex items-center justify-center bg-image">
      <div className="flex bg-2 shadow-md">
        <img
          src={"/mobile_message.png"}
          alt="svg"
          className="md:block hidden img_message p-10"
        />
        {!loadPage ? (
          <div>Carregando</div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
