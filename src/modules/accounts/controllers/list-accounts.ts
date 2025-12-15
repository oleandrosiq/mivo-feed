import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { env } from "../../../config/env";
import { dynamoClient } from "../../../lib/dynamoClient";
import type { IAccount } from "../../../interfaces/entities/Accout";
import { response } from "../../../utils/response";

export async function listAccounts() {
  const command = new QueryCommand({
    TableName: env.MIVO_TABLE!,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :gsi1pk",
    ExpressionAttributeValues: {
      ":gsi1pk": "ACCOUNTS",
    },
  });

  const { Items = [] } = await dynamoClient.send(command);

  const accounts = Items.map(
    (item) =>
      ({
        id: item.id,
        name: item.name,
        email: item.email,
        type: item.type,
        createdAt: item.createdAt,
      } as IAccount)
  );

  return response(200, {
    data: {
      accounts,
    },
  });
}
