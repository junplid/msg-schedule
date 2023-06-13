import "./styles.scss";
import { FormEvent, useCallback, useState } from "react";
import { LoadComponent } from "../../components/load";
import { Link, useNavigate } from "react-router-dom";
import MessageSvg from "../../assets/mobile_message.svg";

export default function PageLogin() {
  const [load, setLoad] = useState<boolean>(false as boolean);

  const navigate = useNavigate();

  const submit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoad(!load);
      setTimeout(() => navigate("/painel"), 3000);
    },
    [load, navigate]
  );

  return (
    <div className="min-h-screen px-4 flex items-center justify-center bg-image">
      <div className="flex bg-2 shadow-md">
        <img
          src={MessageSvg}
          alt="svg"
          className="md:block hidden img_message p-10"
        />
        <div className="bg-5 p-10 py-8 flex flex-col justify-between gap-10 min-h-full">
          <div>
            <h1 className="font-bold text-2xl text-slate-700">
              Faça login na sua conta
            </h1>
          </div>
          <form
            className="flex flex-col gap-11 items-baseline justify-between flex-1"
            onSubmit={submit}
          >
            <div className="grid gap-y-3">
              <label className="flex flex-col gap-y-2">
                <span className="text-base font-medium text-slate-800">
                  E-mail
                </span>
                <input
                  placeholder="xxx@xxx.xxx"
                  className="py-3 px-4 shadow-sm w-full outline-none"
                  type="text"
                />
              </label>
              <label className="flex flex-col gap-y-2">
                <span className="text-base font-medium text-slate-800">
                  Senha
                </span>
                <input
                  className="py-3 px-4 shadow-sm w-full outline-none"
                  type="password"
                  placeholder="*****"
                />
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
              <Link className="text-cyan-800 font-medium" to={"/"}>
                registre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
