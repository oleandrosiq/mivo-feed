import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { dynamoClient } from "../lib/dynamoClient";
import { env } from "../config/env";

export async function updateCommunityMembersCount(
  communitySlug: string,
  increment: boolean,
) {
  try {
    const getCommunityCommand = new GetCommand({
      TableName: env.MIVO_TABLE!,
      Key: {
        PK: `COMMUNITY#${communitySlug}`,
        SK: `COMMUNITY#${communitySlug}`,
      },
    });

    const { Item: communityItem } =
      await dynamoClient.send(getCommunityCommand);

    if (!communityItem) {
      console.warn(
        `Community with slug ${communitySlug} not found for member upsert.`,
      );
      throw new Error("Community not found");
    }

    const membersCount = communityItem.membersCount || 0;
    const newMembersCount = increment
      ? membersCount + 1
      : Math.max(0, membersCount - 1);

    console.log({ newMembersCount, communityItem });

    const updateCommand = new UpdateCommand({
      TableName: env.MIVO_TABLE!,
      Key: {
        PK: `COMMUNITY#${communitySlug}`,
        SK: `COMMUNITY#${communitySlug}`,
      },
      UpdateExpression: "SET membersCount = :membersCount",
      ExpressionAttributeValues: {
        ":membersCount": newMembersCount,
      },
    });

    await dynamoClient.send(updateCommand);
  } catch (error) {
    console.error("Error updating community members count:", error);
  }
}
