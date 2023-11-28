"use client"
import React, { useEffect, useState } from 'react'
import { useUserContext } from "@/userContext";
import { apiUrl } from "@/utils/api";

import { useRef } from 'react';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Image from 'next/image'
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ReplyIcon from '@mui/icons-material/Reply';

import Paper from '@mui/material/Paper';

import generatePDF, { Resolution, Margin, Options } from 'react-to-pdf';
import { Box, Button, Container, Typography } from '@mui/material';
import { resultadoVoto } from '@/utils/resultado.eleicao.mock';
import Link from 'next/link';
import { resultadoVotoTypes } from '@/utils/types/result.eleicao.types';




export default function PsaCopy() {



    const [resultadoVoto, setResultadoVoto] = useState<resultadoVotoTypes>({} as resultadoVotoTypes)
    const [isLoading, setIsloading] = useState(true);
    const { user } = useUserContext();

    const options: Options = {
        // default is `save`
        // method: 'open',
        method: 'save',

        resolution: Resolution.HIGH,
        page: {
            // margin is in MM, default is Margin.NONE = 0
            margin: Margin.SMALL,
            // default is 'A4'
            format: 'A4',
            // default is 'portrait'
            orientation: 'portrait',
        },


        overrides: {
            pdf: {
                compress: true
            },

        },
    };

    useEffect(() => {
        //fetch
        const token = localStorage.getItem("token");
        if (user._id) {
            setIsloading(true);
            const getDadosVotos = async () => {
                try {

                    const response = await fetch(`${apiUrl}/api/v1/votacao`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (!response.ok) {
                        alert("Erro ao obter os resultados dos votos, tente novamente");
                        console.error("Erro ao obter resultados de votos");
                        return;
                    }

                    const responseJson = await response.json();
                    //console.log(responseJson)    
                    setResultadoVoto(responseJson);

                } catch (error) {
                    console.log("Erro na solicitação", error)
                }


            };
            setIsloading(false);
            getDadosVotos();
        }
    }, [user._id]);

    console.log(resultadoVoto)

    // console.log(resultadoVoto?.quantidadeFuncionarios)

    const qtdFuncionariosConstantes = resultadoVoto.quantidadeFuncionarios;
    const qtdFuncionarosCompareceram = resultadoVoto.funcionariosVotaram;
    const qtdFucionariosNaoCompareceram = qtdFuncionariosConstantes - qtdFuncionarosCompareceram








    const getTargetElement = () => document.getElementById('content-id');

    return (
        <>
            <Container maxWidth="lg" sx={{ marginTop: "30px" }} >
                {/* <Box display='flex' flexDirection='row-reverse' alignItems='flex-start'> */}

                <Box display='flex' alignItems='center' justifyContent='flex-end'>
                    <Button onClick={() => generatePDF(getTargetElement, options)}><PictureAsPdfIcon sx={{ color: "#b30b00", marginRight: '20px', fontSize: 48 }} /></Button>
                    <Link href={'/dashboard/atas'}  ><ReplyIcon sx={{ fontSize: 45, color: 'blue' }} /></Link>
                </Box>



                <div id="content-id">
                    <Box component={Paper}>
                        <Box display="flex" flexDirection="column" >

                            <Box bgcolor='gray' textAlign='center' mt={2} >
                                <Image
                                    width={320}
                                    height={55}
                                    src={
                                        "https://portaleducacao.anapolis.go.gov.br/portal/wp-content/uploads/2021/04/LOGO-SECRETARIA-EDUCACAO-1.png"
                                    }
                                    alt="Logo"
                                />

                            </Box>

                            <Box textAlign='center' mt={3}>
                                <Typography>
                                    Prefeitura Municipal de Anápolis
                                </Typography>
                                <Typography>
                                    Secretaria Municipal de Educação
                                </Typography>
                                <Typography>
                                    {user.nome}
                                </Typography>

                            </Box>

                            <Box display="flex" justifyContent="center" textAlign='center' flexDirection='column' alignItems='center' marginTop={4} gap={2} >
                                <Typography variant='h5'>
                                    ATA DA MESA COLETORA - PROFESSORES E SERVIDORES ADMINSTRATIVOS (PSA)
                                </Typography>

                                <Typography>
                                    Integram a mesa coletora de votos os seguintes membros
                                </Typography>

                                {resultadoVoto && (<table border={1} width="100%" suppressHydrationWarning >
                                    <tr>
                                        <th>Cargos</th>
                                        <th>Nome</th>
                                        <th>Assinatura</th>
                                    </tr>
                                    <tr>
                                        <th>Presidente</th>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th>1° Mesário</th>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th>2° Mesário</th>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </table>)}
                            </Box>

                            <Box mt={1} textAlign='center'>


                                {/* ________________________________________________________________________________ */}

                                <Box mt={2}>
                                    <Typography>Comparecimento de eleitores conforme lista de votantes</Typography>
                                </Box>






                            </Box>
                        </Box>
                    </Box>

                </div>



            </Container>


        </>

    )
}
