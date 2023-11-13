"use client";
import ConfirmaCandidato from "@/components/votacao/ConfirmaCandidato";
import EscolhaCandidato from "@/components/votacao/EscolhaCandidato";
import FinalizarVotacao from "@/components/votacao/FinalizarVotacao";
import { apiUrl } from "@/utils/api";
import { Candidato } from "@/utils/types/candidato.types";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";

export default function Votacao() {
  const [etapa, setEtapa] = useState(0);
  const searchParams = useSearchParams();
  const [candidatoEscolhido, setCandidatoEscolhido] =
    useState<Candidato | null>(null);

  const tipo = searchParams.get("tipo") ?? "";
  const id = searchParams.get("id") ?? "";

  const avancarEtapa = () => {
    setEtapa((prev) => prev + 1);
  };

  const voltarEtapa = () => {
    setEtapa((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const dadosParaEnviar = {
      candidato: candidatoEscolhido?._id,
      idVotante: id,
      tipoVoto: tipo,
    };
    const token = localStorage.getItem("token");
    const response = await fetch(`${apiUrl}/api/v1/voto/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dadosParaEnviar),
    });
    console.log(response);
    avancarEtapa();
  };

  const renderVotacao = (etapa: number) => {
    switch (etapa) {
      case 0:
        return (
          <EscolhaCandidato
            avancarEtapa={avancarEtapa}
            voltarEtapa={voltarEtapa}
            setCandidatoEscolhido={setCandidatoEscolhido}
          />
        );
      case 1:
        return (
          <ConfirmaCandidato
            avancarEtapa={handleSubmit}
            voltarEtapa={voltarEtapa}
            candidatoEscolhido={candidatoEscolhido}
            handleSubmit={handleSubmit}
          />
        );
      case 2:
        return <FinalizarVotacao />;
      default:
        return "Etapa desconhecida";
    }
  };
  return <div>{renderVotacao(etapa)}</div>;
}