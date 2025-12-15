import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { createAccount } from "./controllers/create-account";
import { listAccounts } from "./controllers/list-accounts";
import { getAccount } from "./controllers/get-account";
import { updateAccount } from "./controllers/update-account";
import { deleteAccount } from "./controllers/delete-account";

export async function handler(event: APIGatewayProxyEventV2) {
  const { requestContext, body, pathParameters } = event;
  const { http } = requestContext;
  const method = http.method;
  const path = http.path;

  try {
    if (method === "POST" && path === "/accounts") {
      return await createAccount(body);
    }

    if (method === "GET" && path === "/accounts") {
      return await listAccounts();
    }

    if (method === "GET" && path.match(/^\/accounts\/[^\/]+$/)) {
      const accountId = pathParameters?.accountId;
      return await getAccount(accountId);
    }

    if (method === "PUT" && path.match(/^\/accounts\/[^\/]+$/)) {
      const accountId = pathParameters?.accountId;
      return await updateAccount(accountId, body);
    }

    if (method === "DELETE" && path.match(/^\/accounts\/[^\/]+$/)) {
      const accountId = pathParameters?.accountId;
      return await deleteAccount(accountId);
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Rota não encontrada" }),
    };
  } catch (error) {
    console.error("Erro no processamento da requisição:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro interno do servidor" }),
    };
  }
}
