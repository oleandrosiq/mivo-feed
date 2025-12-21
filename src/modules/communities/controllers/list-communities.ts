import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "../../../lib/dynamoClient";
import { itemToCommunity } from "../../../utils/mappers/community";
import type { ICommunity } from "../../../interfaces/entities/Community";
import { response } from "../../../utils/response";

export async function listCommunities() {
  const command = new QueryCommand({
    TableName: process.env.MIVO_TABLE!,
    IndexName: "GSI1",
    KeyConditionExpression: "#GSI1PK = :gsi1pk",
    ExpressionAttributeNames: {
      "#GSI1PK": "GSI1PK",
    },
    ExpressionAttributeValues: {
      ":gsi1pk": "COMMUNITYS",
    },
  });

  const { Items = [] } = await dynamoClient.send(command);

  const communities: Array<ICommunity> = Items.map(itemToCommunity);

  return response(200, {
    data: {
      communities,
    },
  });
}
