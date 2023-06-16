import "./styles.scss";
import { LoadComponent } from "../../components/load";
import { Link } from "react-router-dom";
import { useRegister } from "../../hooks/authRegister.hook";
import { InputHTMLAttributes } from "react";

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

  return (
    <div className="min-h-screen px-4 flex items-center justify-center bg-image">
      <div className="w-full flex justify-center fixed bottom-0 left-0">
        <div
          className={`bg-3 duration-200 ${
            sucess ? "" : "translate-y-16"
          } text-slate-100 p-4 inline-block text-lg`}
        >
          <span>Conta criada com sucesso</span>
        </div>
      </div>
      <div className="flex bg-2 shadow-md">
        <img
          src={"/mobile_message.png"}
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
              className="w-full flex justify-center items-center bg-3 text-slate-100 py-0 h-12 font-semibold hover:bg-2 duration-200"
            >
              {load ? <LoadComponent /> : "Criar conta"}
            </button>
          </form>
          <div>
            <p className="text-slate-700 text-base text-center">
              Possui conta?{" "}
              <Link className="text-cyan-800 font-medium" to={"/"}>
                login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
