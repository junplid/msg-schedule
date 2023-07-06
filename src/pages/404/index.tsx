import { Link } from "react-router-dom";

export default function Page404() {
  return (
    <div className="flex justify-center bg-2 items-center min-h-screen w-full">
      <h2 className="text-slate-300">
        Página não existe!{" "}
        <Link className="text-slate-100 font-bold ml-1 underline" to={"/"}>
          Voltar
        </Link>
      </h2>
    </div>
  );
}
