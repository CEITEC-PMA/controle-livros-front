"use client";
import SaveIcon from "@mui/icons-material/Check";
import {
  Autocomplete,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  TextField,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import InputMask from "react-input-mask";

import Unauthorized from "@/components/unauthorized";
import { useUserContext } from "@/userContext";
import { apiUrl } from "@/utils/api";
import { TUnidadeEscolar } from "@/utils/types/unidade.types";
import { TUser } from "@/utils/types/user.types";
// import { LatLngTuple } from "leaflet";
// import "leaflet-defaulticon-compatibility";
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css"; // Re-uses images from ~leaflet package
// import "leaflet/dist/leaflet.css";
// import {
//   MapContainer,
//   Marker,
//   Popup,
//   TileLayer,
//   useMapEvents,
// } from "react-leaflet";

interface Props {
  onSubmit: SubmitHandler<TUnidadeEscolar>;
}

const UnidadeRegistro: React.FC<Props> = ({ onSubmit }) => {
  const { user } = useUserContext();
  const { control, handleSubmit, setValue, watch, getValues } =
    useForm<TUnidadeEscolar>();
  const cep = watch("endereco.cep");
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [unidades, setUnidades] = useState<TUnidadeEscolar[]>([]);
  const [users, setUsers] = useState<TUser[]>([]);
  const unidadeParams = useSearchParams();
  const router = useRouter();
  // const [markerCoordinates, setMarkerCoordinates] = useState([0, 0]);
  // const [leaflet, setLeaflet] = useState<any>(null);
  const idUnidade = unidadeParams.get("id");

  // useEffect(() => {
  //   import("leaflet").then((L) => {
  //     setLeaflet(L);
  //   });
  // }, []);

  // const initialCoordinates: LatLngTuple = [
  //   -16.331728890115176, -48.94959155640654,
  // ] as LatLngTuple;

  // const centerCoordinates = idUnidade
  //   ? ([
  //       parseFloat(getValues("location.coordinates.0")),
  //       parseFloat(getValues("location.coordinates.1")),
  //     ] as LatLngTuple)
  //   : (initialCoordinates as LatLngTuple);

  const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": {
      padding: theme.spacing(2),
    },
    "& .MuiDialogActions-root": {
      padding: theme.spacing(1),
    },
  }));

  // const MapEventWrapper = () => {
  //   if (!leaflet) return null;

  //   // eslint-disable-next-line react-hooks/rules-of-hooks
  //   const map = useMapEvents({
  //     click: (e) => {
  //       const { lat, lng } = e.latlng;
  //       console.log("Clique no mapa. Coordenadas:", lat, lng);
  //       console.log("Antes de setMarkerCoordinates:", markerCoordinates);

  //       setMarkerCoordinates([lat, lng]);
  //       console.log("Depois de setMarkerCoordinates:", markerCoordinates);

  //       setValue("location.coordinates.0", lat.toString());
  //       setValue("location.coordinates.1", lng.toString());
  //     },
  //   });

  //   return null;
  // };

  const onSubmitHandler: SubmitHandler<TUnidadeEscolar> = async () => {
    const formData = getValues();
    const token = localStorage.getItem("token");
    const url = idUnidade
      ? `${apiUrl}/unidade/${idUnidade}`
      : `${apiUrl}/unidade`;
    const method = idUnidade ? "PATCH" : "POST";

    try {
      setIsLoading(true);
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        setIsLoading(false);
        throw new Error(`Failed to ${idUnidade ? "update" : "submit"} data`);
      }

      console.log(
        `Dados ${idUnidade ? "atualizados" : "enviados"} com sucesso:`,
        formData
      );
      setIsLoading(false);
      setOpenModal(true);

      await onSubmit(formData);
    } catch (error) {
      setIsLoading(false);
      console.error(
        `Erro ao ${idUnidade ? "atualizar" : "enviar"} os dados:`,
        error
      );
    }
  };

  const fetchData = async (url: string, setData: Function) => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const responseJson = await response.json();
      setData(responseJson.results);
      setIsLoading(false);
      return response;
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadUnidadeData = async () => {
      if (idUnidade) {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        try {
          const response = await fetch(`${apiUrl}/unidade/${idUnidade}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }

          const responseJson = await response.json();
          setUnidades([responseJson]);
          fetchData(`${apiUrl}/users?limit=200`, setUsers);

          setUnidades([responseJson]);

          setValue("nome", responseJson.nome || "");
          setValue("userId", responseJson.userId || "");
          setValue("inep", responseJson.inep || 0);
          setValue("fone", responseJson.fone || "");
          setValue("email", responseJson.email || "");

          setValue("endereco.cep", responseJson.endereco.cep || "");
          setValue(
            "endereco.logradouro",
            responseJson.endereco.logradouro || ""
          );
          setValue(
            "endereco.complemento",
            responseJson.endereco.complemento || ""
          );
          setValue("endereco.quadra", responseJson.endereco.quadra || "");
          setValue("endereco.lote", responseJson.endereco.lote || "");
          setValue("endereco.bairro", responseJson.endereco.bairro || "");
          setValue(
            "endereco.localidade",
            responseJson.endereco.localidade || ""
          );
          setValue("endereco.uf", responseJson.endereco.uf || "");

          // const hasCoordinates =
          //   responseJson.location?.coordinates?.[0] !== undefined &&
          //   responseJson.location?.coordinates?.[1] !== undefined &&
          //   !isNaN(parseFloat(responseJson.location.coordinates[0])) &&
          //   !isNaN(parseFloat(responseJson.location.coordinates[1]));

          // const initialCoordinates = hasCoordinates
          //   ? [
          //       parseFloat(
          //         responseJson.location.coordinates[0].replace(",", ".")
          //       ),
          //       parseFloat(
          //         responseJson.location.coordinates[1].replace(",", ".")
          //       ),
          //     ]
          //   : [-16.33034510894292, -48.94892561842292];

          // setMarkerCoordinates(initialCoordinates);

          // setValue(
          //   "location.coordinates.0",
          //   responseJson.location.coordinates[0] || 0
          // );
          // setValue(
          //   "location.coordinates.1",
          //   responseJson.location.coordinates[1] || 0
          // );
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        fetchData(`${apiUrl}/unidade?limit=200`, setUnidades);
        fetchData(`${apiUrl}/users?limit=200`, setUsers);
        setIsLoading(false);
      }
    };

    loadUnidadeData();
  }, [idUnidade, user.id]);

  const handleBuscaCep = async () => {
    if (cep?.length !== 8 || !isValidCEP(cep)) {
      alert("CEP inválido, digite novamente!");
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const resJson = await response.json();

      setValue("endereco.logradouro", resJson.logradouro?.toUpperCase() || "");
      setValue("endereco.bairro", resJson.bairro?.toUpperCase() || "");
      setValue("endereco.localidade", resJson.localidade?.toUpperCase() || "");
      setValue("endereco.uf", resJson.uf?.toUpperCase() || "");
    } catch (error) {
      alert("Falha ao receber os dados do CEP");
    }
  };

  const isValidCEP = (cep: string) => /^[0-9]{8}$/.test(cep);

  useEffect(() => {
    const handleAutoFetch = async () => {
      if (cep?.length === 8 && isValidCEP(cep)) {
        await handleBuscaCep();
        const logradouroInput = document.getElementById("endereco.logradouro");
        logradouroInput?.focus();
      }
    };

    handleAutoFetch();
  }, [cep]);

  const handleCloseModal = () => {
    setOpenModal(false);
    router.push("/dashboard/unidades");
  };

  if (!user.role || user.role !== "admin") return <Unauthorized />;

  return (
    <Box
      padding={smDown ? 2 : mdDown ? 3 : 4}
      sx={{ backgroundColor: "#ebebeb", borderRadius: "10px" }}
    >
      <Box padding={2} sx={{ backgroundColor: "#fff" }}>
        <Typography
          variant={smDown ? "h5" : mdDown ? "h4" : "h3"}
          align="center"
          marginBottom="8px"
          sx={{
            backgroundColor: "#dedede",
            borderRadius: "10px",
            padding: "4px",
            fontWeight: "bold",
            fontSize: "36px",
          }}
        >
          {idUnidade && unidades.length > 0
            ? `Editar Unidade de Ensino - ${unidades[0]?.nome || ""}`
            : "Cadastrar Unidade de Ensino"}
        </Typography>

        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <Grid container padding={2} spacing={2} alignItems="center">
            <Grid xs={12}>
              <Typography
                variant={smDown ? "h6" : "h5"}
                sx={{ backgroundColor: "#" }}
              >
                Dados Gerais
              </Typography>
            </Grid>
            <Grid xs={12}>
              <Controller
                name="nome"
                control={control}
                render={({ field }) => (
                  <>
                    <TextField
                      label="Nome da Unidade de Ensino"
                      fullWidth
                      value={
                        idUnidade
                          ? unidades && unidades.length > 0
                            ? unidades[0]?.nome || ""
                            : ""
                          : field.value
                      }
                      onChange={(e) => {
                        if (!idUnidade) {
                          field.onChange(e.target.value.toUpperCase());
                        }
                      }}
                      InputProps={{
                        readOnly: !!idUnidade,
                      }}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid xs={smDown ? 12 : 10}>
              <Controller
                name="userId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    id="userId"
                    options={users}
                    getOptionLabel={(user) => user.nome}
                    value={
                      users.find((user) =>
                        Array.isArray(field.value)
                          ? field.value.includes(user.id)
                          : user.id === field.value
                      ) || null
                    }
                    onChange={(_, newValue) => {
                      field.onChange(newValue ? newValue.id : "");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Administrador da Unidade de Ensino"
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid xs={smDown ? 12 : 2}>
              <Button
                onClick={() => router.push("/register/user")}
                variant="contained"
              >
                Adicionar Usuário
              </Button>
            </Grid>

            <Grid xs={smDown ? 12 : 3}>
              <Controller
                name="inep"
                control={control}
                defaultValue={0}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    type="number"
                    label="INEP"
                    InputProps={{ readOnly: !!idUnidade }}
                    value={
                      idUnidade && unidades.length > 0
                        ? unidades[0]?.inep
                        : field.value
                    }
                    onChange={(e) => {
                      if (!idUnidade) {
                        field.onChange(e);
                      }
                    }}
                    sx={{
                      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                        {
                          display: "none",
                        },
                      "& input[type=number]": {
                        MozAppearance: "textfield",
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid xs={mdDown ? 12 : 2.5}>
              <Controller
                name="fone"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <InputMask
                    mask="(62) 9999-9999"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    {
                      //@ts-ignore
                      () => (
                        <TextField
                          fullWidth
                          type="tel"
                          label="Telefone"
                          sx={{
                            "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                              {
                                display: "none",
                              },
                            "& input[type=number]": {
                              MozAppearance: "textfield",
                            },
                          }}
                        />
                      )
                    }
                  </InputMask>
                )}
              />
            </Grid>
            <Grid xs={12}>
              <Controller
                name="email"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    type="email"
                    fullWidth
                    label="Email"
                    InputProps={{ readOnly: !!idUnidade }}
                    value={
                      idUnidade && unidades.length > 0
                        ? unidades[0]?.email
                        : field.value
                    }
                    onChange={(e) => {
                      if (!idUnidade) {
                        field.onChange(e);
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid
              xs={12}
              justifyItems="center"
              alignItems="center"
              alignContent="center"
            >
              <Typography variant={smDown ? "h6" : "h5"}>Endereço</Typography>
            </Grid>
            <Grid container xs={12} display="flex" spacing={2}>
              <Grid xs={smDown ? 12 : mdDown ? 3 : 1.9}>
                <Controller
                  name="endereco.cep"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <InputMask
                      mask="99999999"
                      maskChar=""
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={handleBuscaCep}
                    >
                      {
                        // @ts-ignore
                        () => <TextField fullWidth type="text" label="CEP" />
                      }
                    </InputMask>
                  )}
                />
              </Grid>
              <Grid xs={smDown ? 12 : mdDown ? 12 : 5}>
                <Controller
                  name="endereco.logradouro"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      type="string"
                      label="Logradouro"
                      {...field}
                      value={field.value?.toUpperCase()}
                    />
                  )}
                />
              </Grid>
              <Grid xs={smDown ? 12 : mdDown ? 6 : 3}>
                <Controller
                  name="endereco.complemento"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      type="string"
                      label="Complemento"
                      {...field}
                      value={field.value?.toUpperCase()}
                    />
                  )}
                />
              </Grid>
              <Grid xs={mdDown ? 12 : 1.05}>
                <Controller
                  name="endereco.quadra"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      type="text"
                      label="Quadra"
                      {...field}
                    />
                  )}
                />
              </Grid>
              <Grid xs={mdDown ? 12 : 1.05}>
                <Controller
                  name="endereco.lote"
                  control={control}
                  render={({ field }) => (
                    <TextField fullWidth type="text" label="Lote" {...field} />
                  )}
                />
              </Grid>
              <Grid xs={mdDown ? 12 : 3}>
                <Controller
                  name="endereco.bairro"
                  control={control}
                  defaultValue={""}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      type="string"
                      label="Bairro"
                      InputProps={{ readOnly: true }}
                      {...field}
                      value={field.value?.toUpperCase()}
                    />
                  )}
                />
              </Grid>
              <Grid xs={mdDown ? 12 : 4}>
                <Controller
                  name="endereco.localidade"
                  control={control}
                  defaultValue={""}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      type="string"
                      label="Localidade"
                      InputProps={{ readOnly: true }}
                      {...field}
                      value={field.value?.toUpperCase()}
                    />
                  )}
                />
              </Grid>
              <Grid xs={mdDown ? 6 : 1}>
                <Controller
                  name="endereco.uf"
                  control={control}
                  defaultValue={""}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      type="string"
                      label="UF"
                      InputProps={{ readOnly: true }}
                      {...field}
                      value={field.value?.toUpperCase()}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid xs={mdDown ? 12 : 6}>
              <InputLabel id="userId">Coordenada X</InputLabel>
              <Controller
                name="location.coordinates.0"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    type="string"
                    value={field.value}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                )}
              />
            </Grid>
            <Grid xs={mdDown ? 12 : 6}>
              <InputLabel id="userId">Coordenada Y</InputLabel>
              <Controller
                name="location.coordinates.1"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    type="string"
                    value={field.value}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                )}
              />
            </Grid>
            {/* <Grid xs={12} padding="20px 16px">
              <MapContainer
                center={
                  idUnidade
                    ? (centerCoordinates as LatLngTuple)
                    : initialCoordinates
                }
                zoom={!!idUnidade ? 16 : 12}
                style={{ height: "400px", width: "100%" }}
              >
                <MapEventWrapper />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {leaflet && markerCoordinates[0] && markerCoordinates[1] && (
                  <Marker position={markerCoordinates as LatLngTuple}>
                    <Popup>Marcador</Popup>
                  </Marker>
                )}
              </MapContainer>
            </Grid> */}
            <Grid
              xs={12}
              margin="0 4px"
              alignItems="center"
              justifyItems="center"
              display="flex"
              flexDirection="column"
            >
              <Button
                endIcon={<SaveIcon />}
                size="large"
                type="submit"
                variant="contained"
                color="primary"
                onClick={handleSubmit(onSubmitHandler)}
              >
                SALVAR DADOS
              </Button>
            </Grid>
            <BootstrapDialog
              onClose={handleCloseModal}
              aria-labelledby="customized-dialog-title"
              open={openModal}
            >
              <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                Sucesso!
              </DialogTitle>
              <DialogContent>
                <Typography gutterBottom>
                  Dados {idUnidade ? "atualizados" : "enviados"} com sucesso!
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button
                  autoFocus
                  onClick={handleCloseModal}
                  variant="contained"
                >
                  OK
                </Button>
              </DialogActions>
            </BootstrapDialog>
          </Grid>
        </form>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isLoading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>
    </Box>
  );
};

export default UnidadeRegistro;
