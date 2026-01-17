import type { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { createCommunity } from "./controllers/create-community";
import { listCommunities } from "./controllers/list-communities";
import { getCommunity } from "./controllers/get-community";
import { listCommunitiesByUserOwned } from "./controllers/list-communities-user-owned";
import { listCommunitiesByUserMemberOf } from "./controllers/list-communities-user-member-of";
import { joinCommunity } from "./controllers/join-community";
import { leaveCommunity } from "./controllers/leave-community";

export async function handler(event: APIGatewayProxyEventV2WithJWTAuthorizer) {
  const { requestContext, body, pathParameters } = event;
  const { http } = requestContext;
  const method = http.method;
  const path = http.path;
  const userId = requestContext?.authorizer?.jwt?.claims?.sub;

  try {
    if (method === "POST" && path === "/communities") {
      const parsedBody = JSON.parse(body ?? "{}");
      parsedBody["authenticatedUserId"] = userId;
      return await createCommunity(JSON.stringify(parsedBody));
    }

    if (method === "GET" && path === "/communities") {
      return await listCommunities();
    }

    if (method === "GET" && path.match(/^\/communities\/[^\/]+$/)) {
      const slug = pathParameters?.slug;
      return await getCommunity(slug);
    }

    if (method === "GET" && path === "/accounts/communities/owned") {
      return await listCommunitiesByUserOwned(userId as string);
    }

    if (method === "GET" && path === "/accounts/communities/member-of") {
      return await listCommunitiesByUserMemberOf(userId as string);
    }

    if (method === "POST" && path.match(/^\/communities\/[^\/]+\/join$/)) {
      const parsedBody = JSON.parse(body ?? "{}");
      parsedBody["userId"] = userId;
      parsedBody["communitySlug"] = pathParameters?.slug;

      return await joinCommunity(JSON.stringify(parsedBody));
    }

    if (method === "POST" && path.match(/^\/communities\/[^\/]+\/leave$/)) {
      const parsedBody = JSON.parse(body ?? "{}");
      parsedBody["userId"] = userId;
      parsedBody["communitySlug"] = pathParameters?.slug;

      return await leaveCommunity(JSON.stringify(parsedBody));
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
