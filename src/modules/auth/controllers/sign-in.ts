import type { APIGatewayProxyEventV2 } from "aws-lambda";
import {
  InitiateAuthCommand,
  NotAuthorizedException,
  UserNotConfirmedException,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";
import z from "zod";
import { env } from "../../../config/env";
import { cognitoClient } from "../../../lib/cognitoClient";
import { response } from "../../../utils/response";

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export async function signInAccount(event: APIGatewayProxyEventV2) {
  try {
    const { data, success, error } = signInSchema.safeParse(
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

    const { email, password } = data;

    const command = new InitiateAuthCommand({
      ClientId: env.COGNITO_CLIENT_ID,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const { AuthenticationResult } = await cognitoClient.send(command);

    if (!AuthenticationResult) {
      return response(401, { message: "Invalid credentials" });
    }

    return response(200, {
      accessToken: AuthenticationResult.AccessToken,
      refreshToken: AuthenticationResult.RefreshToken,
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof UserNotFoundException ||
      error instanceof NotAuthorizedException
    ) {
      return response(401, { message: "Invalid credentials" });
    }

    if (error instanceof UserNotConfirmedException) {
      return response(403, {
        message: "Your need to confirm your account before signing in",
      });
    }

    return response(500, { message: "Internal server error" });
  }
}
