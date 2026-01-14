import type { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

import { signInAccount } from "./controllers/sign-in";
import { accountConfirmation } from "./controllers/account-confirmation";
import { signUp } from "./controllers/sign-up";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const { requestContext } = event;
  const { http } = requestContext;
  const method = http.method;
  const path = http.path;

  try {
    if (method === "POST" && path === "/auth/sign-up") {
      return await signUp(event);
    }

    if (method === "POST" && path === "/auth/sign-in") {
      return await signInAccount(event);
    }

    if (method === "POST" && path === "/auth/confirm") {
      return await accountConfirmation(event);
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
