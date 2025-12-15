import { GetCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
import { env } from "../../../config/env";
import { dynamoClient } from "../../../lib/dynamoClient";
import { response } from "../../../utils/response";
import { itemToAccount } from "../../../utils/mappers/account";

const updateAccountSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
});

export async function updateAccount(accountId?: string, body?: string) {
  const { success, data, error } = updateAccountSchema.safeParse(
    body ? JSON.parse(body) : {}
  );

  if (!accountId) {
    return response(400, { error: "Account ID is required" });
  }

  if (!success) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Dados inválidos",
        details: error.issues,
      }),
    };
  }

  const { name, email } = data;

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

  if (Items && Items.length > 0 && !Items.find((x) => x?.id === accountId)) {
    return response(409, { error: "E-mail already exists" });
  }

  const command = new GetCommand({
    TableName: env.MIVO_TABLE!,
    Key: {
      PK: `ACCOUNT#${accountId}`,
      SK: `ACCOUNT#${accountId}`,
    },
  });

  const { Item } = await dynamoClient.send(command);

  if (!Item) {
    return response(404, { error: "Account not found" });
  }

  const now = new Date().toISOString();
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  const account = itemToAccount(Item);

  if (account.email !== email) {
    updateExpressions.push("#email = :email");
    expressionAttributeNames["#email"] = "email";
    expressionAttributeValues[":email"] = data.email;
  }

  if (account.name != name) {
    updateExpressions.push("#name = :name");
    expressionAttributeNames["#name"] = "name";
    expressionAttributeValues[":name"] = data.name;
  }

  updateExpressions.push("updatedAt = :updatedAt");
  expressionAttributeValues[":updatedAt"] = now;

  const updateCommand = new UpdateCommand({
    TableName: env.MIVO_TABLE!,
    Key: {
      PK: `ACCOUNT#${accountId}`,
      SK: `ACCOUNT#${accountId}`,
    },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames:
      Object.keys(expressionAttributeNames).length > 0
        ? expressionAttributeNames
        : undefined,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
  });

  const { Attributes: ItemUpdated } = await dynamoClient.send(updateCommand);

  const accountUpdated = itemToAccount(ItemUpdated!);

  return response(200, {
    data: { account: accountUpdated },
  });
}
