import "./styles.scss";
import { FormEvent, useCallback, useState } from "react";
import { LoadComponent } from "../../components/load";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/auth.hook";
import { useDispatch } from "react-redux";

interface propsFields {
  email: string;
  password: string;
}

export default function PageLogin() {
  const { login } = useAuth({ dispatch: useDispatch() });

  const [load, setLoad] = useState<boolean>(false as boolean);
  const [fields, setFields] = useState<propsFields>({} as propsFields);

  const submit = useCallback(
    async (e: FormEvent<HTMLFormElement>, data: propsFields) => {
      setLoad(true);
      e.preventDefault();
      await login(data);
      setLoad(false);
    },
    [login]
  );

  return (
    <div className="min-h-screen px-4 flex items-center justify-center bg-image">
      <div className="flex bg-2 shadow-md">
        <img
          src={"/mobile_message.png"}
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
            onSubmit={(e) => submit(e, fields)}
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
                  name="email"
                  onChange={(e) =>
                    setFields({ ...fields, [e.target.name]: e.target.value })
                  }
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
                  name="password"
                  onChange={(e) =>
                    setFields({ ...fields, [e.target.name]: e.target.value })
                  }
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
