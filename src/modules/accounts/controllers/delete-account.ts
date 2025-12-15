import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { response } from "../../../utils/response";
import { env } from "../../../config/env";
import { dynamoClient } from "../../../lib/dynamoClient";

export async function deleteAccount(accountId?: string) {
  if (!accountId) {
    return response(400, { error: "Account ID is required" });
  }

  // TODO: Se tiver comunidades ou outros recursos atrelados, impedir a deleção

  const command = new DeleteCommand({
    TableName: env.MIVO_TABLE!,
    Key: {
      PK: `ACCOUNT#${accountId}`,
      SK: `ACCOUNT#${accountId}`,
    },
  });

  await dynamoClient.send(command);

  return response(204);
}
