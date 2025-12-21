import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { response } from "../../../utils/response";
import { env } from "../../../config/env";
import { dynamoClient } from "../../../lib/dynamoClient";
import { itemToCommunity } from "../../../utils/mappers/community";

export async function getCommunity(communitySlug?: string) {
  if (!communitySlug) {
    return response(400, { error: "Community slug is required" });
  }

  const command = new GetCommand({
    TableName: env.MIVO_TABLE!,
    Key: {
      PK: `COMMUNITY#${communitySlug}`,
      SK: `COMMUNITY#${communitySlug}`,
    },
  });

  const { Item } = await dynamoClient.send(command);

  if (!Item) {
    return response(404, { error: "Community not found" });
  }

  const community = itemToCommunity(Item);

  return response(200, {
    data: { community },
  });
}
