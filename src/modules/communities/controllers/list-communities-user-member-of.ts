import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import { response } from "../../../utils/response";
import { dynamoClient } from "../../../lib/dynamoClient";
import type { ICommunity } from "../../../interfaces/entities/Community";
import { itemToCommunity } from "../../../utils/mappers/community";

export async function listCommunitiesByUserMemberOf(userId: string) {
  if (!userId) {
    return response(400, { error: "User ID is required" });
  }

  const command = new QueryCommand({
    TableName: process.env.MIVO_TABLE!,
    IndexName: "GSI1",
    KeyConditionExpression:
      "#GSI1PK = :gsi1pk AND begins_with(#GSI1SK, :gsi1sk)",
    ExpressionAttributeNames: {
      "#GSI1PK": "GSI1PK",
      "#GSI1SK": "GSI1SK",
    },
    ExpressionAttributeValues: {
      ":gsi1pk": `MEMBER#${userId}`,
      ":gsi1sk": `COMMUNITY#`,
    },
  });

  const { Items = [] } = await dynamoClient.send(command);

  console.log("DynamoDB Items:", Items);

  const communities: Array<ICommunity> = Items.map(itemToCommunity);

  return response(200, {
    data: {
      communities,
    },
  });
}
