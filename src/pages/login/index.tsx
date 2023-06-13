import { FormEvent, useCallback, useState } from "react";
import { LoadComponent } from "../../components/load";
import { useNavigate } from "react-router-dom";

export default function PageLogin() {
  const [load, setLoad] = useState<boolean>(false as boolean);

  const navigate = useNavigate();

  const submit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoad(!load);
      setTimeout(() => navigate("/painel"), 3000);
    },
    [load]
  );

  return (
    <div>
      <div>
        <form onSubmit={submit}>
          <div>
            <h1>logo</h1>
            <p>Faça login no painel utilizando suas credenciais de acesso.</p>
          </div>
          <div>
            <label>
              <span>Usuário</span>
              <input placeholder="joao123456" type="text" />
            </label>
            <label>
              <span>Senha</span>
              <input type="password" placeholder="*****" />
            </label>
          </div>
          <button disabled={load} type="submit">
            {load ? <LoadComponent /> : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
