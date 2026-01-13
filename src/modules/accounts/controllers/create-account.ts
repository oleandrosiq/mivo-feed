import z from "zod";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";

import { env } from "../../../config/env";
import { dynamoClient } from "../../../lib/dynamoClient";
import { EEntityType } from "../../../interfaces/entityType";
import { response } from "../../../utils/response";
import { cognitoClient } from "../../../lib/cognitoClient";

const createAccountSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export async function createAccount(body?: string) {
  const { data, success, error } = createAccountSchema.safeParse(
    body ? JSON.parse(body) : {}
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

  const signUpCommand = new SignUpCommand({
    ClientId: env.COGNITO_CLIENT_ID,
    Username: data.email,
    Password: data.password,
    UserAttributes: [{ Name: "name", Value: data.name }],
  });

  const { UserSub: accountId } = await cognitoClient.send(signUpCommand);

  const dateNow = new Date().toISOString();

  const { name, email, password } = data;

  const command = new PutCommand({
    TableName: env.MIVO_TABLE!,
    Item: {
      PK: `ACCOUNT#${accountId}`,
      SK: `ACCOUNT#${accountId}`,
      GSI1PK: "ACCOUNTS",
      GSI1SK: `ACCOUNT#${email}`,
      id: accountId,
      name: name,
      email: email,
      password: password,
      type: EEntityType.ACCOUNT,
      createdAt: dateNow,
    },
  });

  await dynamoClient.send(command);

  return response(201, { data: { accountId } });
}
