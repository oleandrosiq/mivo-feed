import z from "zod";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { env } from "../../../config/env";
import { cognitoClient } from "../../../lib/cognitoClient";
import { response } from "../../../utils/response";

const accountConfirmationSchema = z.object({
  email: z.email(),
  code: z.string(),
});

export async function accountConfirmation(event: APIGatewayProxyEventV2) {
  try {
    const { data, success, error } = accountConfirmationSchema.safeParse(
      event.body ? JSON.parse(event.body) : {}
    );

    if (!success) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Dados inválidos",
          details: error.issues,
        }),
      };
    }

    const command = new ConfirmSignUpCommand({
      ClientId: env.COGNITO_CLIENT_ID,
      ConfirmationCode: data.code,
      Username: data.email,
    });

    await cognitoClient.send(command);

    return response(204);
  } catch (error) {
    return response(500, { message: "Internal server error" });
  }
}
