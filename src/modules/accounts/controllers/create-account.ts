import z from "zod";

import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { env } from "../../../config/env";
import { dynamoClient } from "../../../lib/dynamoClient";
import { EEntityType } from "../../../interfaces/entityType";
import { response } from "../../../utils/response";

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

  const accountId = crypto.randomUUID();
  const dateNow = new Date().toISOString();

  const { name, email, password } = data;

  const queryCommand = new QueryCommand({
    TableName: env.MIVO_TABLE!,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :gsi1pk AND GSI1SK = :gsi1sk",
    ExpressionAttributeValues: {
      ":gsi1pk": "ACCOUNTS",
      ":gsi1sk": `ACCOUNT#${email}`,
    },
  });

  const { Items } = await dynamoClient.send(queryCommand);

  if (Items && Items.length > 0) {
    return response(409, { error: "E-mail already exists" });
  }

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
