import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { response } from "../../../utils/response";
import { env } from "../../../config/env";
import { dynamoClient } from "../../../lib/dynamoClient";
import { itemToAccount } from "../../../utils/mappers/account";

export async function getAccount(accountId?: string) {
  if (!accountId) {
    return response(400, { error: "Account ID is required" });
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

  const account = itemToAccount(Item);

  return response(200, {
    data: { account },
  });
}
