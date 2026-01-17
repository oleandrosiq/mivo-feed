import z from "zod";
import { DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

import { env } from "../../../config/env";
import { dynamoClient } from "../../../lib/dynamoClient";
import { response } from "../../../utils/response";
import { itemToCommunity } from "../../../utils/mappers/community";

const leaveCommunitySchema = z.object({
  communitySlug: z.string(),
  userId: z.string(),
});

export async function leaveCommunity(body?: string) {
  const { data, success, error } = leaveCommunitySchema.safeParse(
    body ? JSON.parse(body) : {},
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

  const { communitySlug, userId } = data;

  const getCommand = new GetCommand({
    TableName: env.MIVO_TABLE!,
    Key: {
      PK: `COMMUNITY#${communitySlug}`,
      SK: `COMMUNITY#${communitySlug}`,
    },
  });

  const { Item: communityItem } = await dynamoClient.send(getCommand);

  if (!communityItem) {
    return response(404, { error: "Community not found" });
  }

  const community = itemToCommunity(communityItem);

  if (community.ownerId === userId) {
    return response(403, {
      error: "Community owner cannot leave their own community",
    });
  }

  const command = new DeleteCommand({
    TableName: env.MIVO_TABLE!,
    Key: {
      PK: `COMMUNITY#${communitySlug}`,
      SK: `MEMBER#${userId}`,
    },
  });

  await dynamoClient.send(command);

  return response(204);
}
