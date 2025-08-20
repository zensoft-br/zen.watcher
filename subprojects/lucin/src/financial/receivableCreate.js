// Lógica personalizada para criação de recebíveis
export async function receivableCreate(zenReq) {
  const bean = zenReq.body.args.bean;

  // Ajusta a data de vencimento para a próxima segunda-feira se cair no fim de semana
  if (bean.dueDate) {
    bean.dueDate = nextMondayIfWeekend(bean.dueDate);
  }

  return {
    body: {
      args: zenReq.body.args,
    },
  };
}

function nextMondayIfWeekend(dateStr) {
  // quebra a string em partes e cria Date sem shift de timezone
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d); // cria no fuso local
  const day = date.getDay(); // 0=domingo, 6=sábado

  if (day === 6) {
    // Saturday → +2
    date.setDate(date.getDate() + 2);
  } else if (day === 0) {
    // Sunday → +1
    date.setDate(date.getDate() + 1);
  }

  // monta manualmente YYYY-MM-DD
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
