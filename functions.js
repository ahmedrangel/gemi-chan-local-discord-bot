import { MONTHS } from "./constants.js";

export const diasFaltantes = (año, mes, dia) => {
  const fechaActual = new Date(new Date() -300 * 60000); // GMT -5
  const fechaObjetivo = new Date(año, mes - 1, dia);
  const diferenciaMilisegundos = fechaObjetivo - fechaActual;
  return Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
}

export const birthdaysList = async () => {
  let lista = []
  const birthdaysR = await fetch(process.env["GEMIDOR_WORKER"] + "/birthdays");
  const birthdays = await birthdaysR.json();
  const año = new Date().getFullYear();
  birthdays.forEach(el => {
    let añoCumple;
    añoCumple = diasFaltantes(año, el.mes, el.dia) < 0 ? añoCumple = año + 1 : añoCumple = año;
    const faltan = diasFaltantes(añoCumple, el.mes, el.dia);
    lista.push({id: el.id, username: el.username, timestamp: new Date(añoCumple, el.mes - 1, el.dia).getTime() + 18000000, status: el.estado, day: `${añoCumple}-${el.mes}-${el.dia}`});
  });
  lista = lista.sort((a, b) => a.timestamp - b.timestamp);
  return lista;
}