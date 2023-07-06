import "./styles.scss";
import { LoadComponent } from "../../components/load";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../../hooks/authRegister.hook";
import { Dispatch, InputHTMLAttributes, useEffect, useState } from "react";
import mainAPI from "../../providers/api.provider";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { propsAuthActions } from "../../reducers/auth.reducer";

interface propsField {
  label: string;
  data: InputHTMLAttributes<HTMLInputElement>;
  error: any;
}

const FieldComponent = (props: propsField): JSX.Element => {
  return (
    <label className="flex flex-col gap-y-2">
      <span className="text-base font-medium text-slate-800">
        {props.label}
      </span>
      <div style={{ maxWidth: 280 }} className="gap-y-1 flex flex-col">
        <input
          type="text"
          autoComplete="off"
          className="py-3 px-4 shadow-sm w-full outline-none"
          {...props.data}
        />
        {props.error?.path.includes(props.data.name) && (
          <p className="text-red-600 bg-red-200 max-w-xs px-1">
            {props.error.message}
          </p>
        )}
      </div>
    </label>
  );
};

export default function PageRegister() {
  const { error, handleValues, load, sucess, onSubmit } = useRegister();
  const [loadPage, setLoadPage] = useState<boolean>(false as boolean);
  const [cookies, _setCookies, removeCookie] = useCookies(["auth"]);
  const dispatch: Dispatch<propsAuthActions> = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (cookies.auth) {
        try {
          const { data } = await mainAPI.get(
            `/v1/public/get/verify-token/${cookies.auth}`
          );
          dispatch({
            type: "LOGIN",
            payload: {
              token: cookies.auth,
              full_name: data.data.full_name,
              type: data.data.type,
              id: data.data.key,
              due_date: data.data.due_date,
            },
          });
          navigate("/panel");
        } catch (error) {
          dispatch({ type: "LOGOUT" });
          removeCookie("auth");
          setTimeout(() => setLoadPage(true), 1200);
        }
        return;
      }
      setTimeout(() => setLoadPage(true), 400);
    })();
  }, []);

  return (
    <div className="min-h-screen py-5 px-4 flex items-center justify-center">
      <div className="w-full flex justify-center fixed bottom-0 left-0">
        <div
          className={`bg-primary duration-200 ${
            sucess ? "" : "translate-y-16"
          } text-slate-100 p-4 inline-block text-lg`}
        >
          <span>Conta criada com sucesso</span>
        </div>
      </div>
      {!loadPage ? (
        <div className="p-4 bg-primary flex items-center flex-col gap-3">
          <span className="text-slate-50 font-medium text-lg">Aguarde</span>
          <LoadComponent />
        </div>
      ) : (
        <div className="flex bg-primary shadow-md">
          <img
            src={"/logo-horizontal-white.png"}
            alt="svg"
            className="md:block hidden img_message p-10"
          />
          <div className="bg-5 p-10 py-8 flex flex-col justify-between gap-4 min-h-full">
            <div>
              <h1
                style={{ maxWidth: 280 }}
                className="font-medium text-xl text-center text-slate-700"
              >
                Cadastre-se e seja um de nós
              </h1>
            </div>
            <form
              className="flex flex-col gap-7 items-baseline justify-between flex-1"
              onSubmit={onSubmit}
            >
              <div className="grid gap-y-3">
                <FieldComponent
                  error={error}
                  label="Nome completo"
                  data={{
                    disabled: load,
                    name: "full_name",
                    onChange: handleValues,
                  }}
                />
                <FieldComponent
                  error={error}
                  label="E-mail"
                  data={{
                    disabled: load,
                    name: "email",
                    onChange: handleValues,
                  }}
                />
                <FieldComponent
                  error={error}
                  label="WhatsApp"
                  data={{
                    disabled: load,
                    name: "whatsapp",
                    onChange: handleValues,
                  }}
                />
                <FieldComponent
                  error={error}
                  label="Senha"
                  data={{
                    type: "password",
                    disabled: load,
                    name: "password",
                    onChange: handleValues,
                  }}
                />
              </div>
              <button
                disabled={load}
                type="submit"
                className="w-full flex justify-center items-center bg-primary text-slate-100 py-0 h-12 font-semibold hover:bg-secundary duration-200"
              >
                {load ? <LoadComponent /> : "Criar conta"}
              </button>
            </form>
            <div>
              <p className="text-slate-700 text-base text-center">
                Possui conta?{" "}
                <Link className="text-primary font-medium" to={"/"}>
                  login
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
