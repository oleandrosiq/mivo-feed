import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyEventV2WithJWTAuthorizer,
} from "aws-lambda";
import { createCommunity } from "./controllers/create-community";
import { listCommunities } from "./controllers/list-communities";
import { getCommunity } from "./controllers/get-community";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const { requestContext, body, pathParameters } = event;
  const { http } = requestContext;
  const method = http.method;
  const path = http.path;

  try {
    if (method === "POST" && path === "/communities") {
      const { requestContext } = event;

      const userId = requestContext.authorizer.jwt.claims.sub;

      const parsedBody = JSON.parse(body ?? "{}");
      parsedBody["ownerId"] = userId;

      return await createCommunity(JSON.stringify(parsedBody));
    }

    if (method === "GET" && path === "/communities") {
      return await listCommunities();
    }

    if (method === "GET" && path.match(/^\/communities\/[^\/]+$/)) {
      const slug = pathParameters?.slug;
      return await getCommunity(slug);
    }

    if (method === "PUT" && path.match(/^\/communities\/[^\/]+$/)) {
      const communityId = pathParameters?.communityId;
      // return await updateCommunity(communityId, body);
    }

    if (method === "DELETE" && path.match(/^\/communities\/[^\/]+$/)) {
      const communityId = pathParameters?.communityId;
      // return await deleteCommunity(communityId);
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
