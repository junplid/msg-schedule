import { Dispatch } from "redux";
import mainAPI from "../providers/api.provider";
import { AxiosError } from "axios";
import { propsAuthActions } from "../reducers/auth.reducer";
import { useNavigate } from "react-router-dom";
import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import { useDispatch } from "react-redux";

interface propsFieldsRegister {
  full_name: string;
  whatsapp: string;
  email: string;
  password: string;
}

export function useRegister() {
  const navigate = useNavigate();
  const [load, setLoad] = useState<boolean>(false as boolean);
  const [error, setError] = useState<any>(null as any);
  const [sucess, setSucess] = useState<any>(null as any);
  const [fields, setFields] = useState<propsFieldsRegister>(
    {} as propsFieldsRegister
  );
  const dispatch: Dispatch<propsAuthActions> = useDispatch();

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      try {
        e.preventDefault();
        setError(null);
        setLoad(true);
        await mainAPI.post("/v1/public/create/register-user", fields);
        setLoad(false);
        setSucess(true);
        setTimeout(() => navigate("/"), 3000);
      } catch (error) {
        setLoad(false);
        if (error instanceof AxiosError) {
          console.log("Error axios", error.response);
          setError(error.response?.data?.body[0]);
          return;
        }
      }
    },
    [dispatch, fields, navigate]
  );

  const handleValues = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setFields({ ...fields, [e.target.name]: e.target.value });
    },
    [fields]
  );

  return { onSubmit, handleValues, error, load, sucess };
}
