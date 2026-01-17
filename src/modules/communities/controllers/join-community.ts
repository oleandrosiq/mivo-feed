import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import z from "zod";
import { env } from "../../../config/env";
import { dynamoClient } from "../../../lib/dynamoClient";
import { response } from "../../../utils/response";
import { itemToCommunity } from "../../../utils/mappers/community";
import { EEntityType } from "../../../interfaces/entityType";
import { itemToAccount } from "../../../utils/mappers/account";

const joinCommunitySchema = z.object({
  communitySlug: z.string(),
  userId: z.string(),
});

export async function joinCommunity(body?: string) {
  const { data, success, error } = joinCommunitySchema.safeParse(
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

  const { communitySlug, userId } = data;

  const getCommunityCommand = new GetCommand({
    TableName: env.MIVO_TABLE!,
    Key: {
      PK: `COMMUNITY#${communitySlug}`,
      SK: `COMMUNITY#${communitySlug}`,
    },
  });

  const { Item: communityItem } = await dynamoClient.send(getCommunityCommand);

  if (!communityItem) {
    return response(404, { error: "Community not found" });
  }

  const getMemberCommand = new GetCommand({
    TableName: env.MIVO_TABLE!,
    Key: {
      PK: `COMMUNITY#${communitySlug}`,
      SK: `MEMBER#${userId}`,
    },
  });

  const { Item: alreadyMember } = await dynamoClient.send(getMemberCommand);

  if (alreadyMember) {
    return response(409, {
      error: "User is already a member of this community",
    });
  }

  const getAccountCommand = new GetCommand({
    TableName: env.MIVO_TABLE!,
    Key: {
      PK: `ACCOUNT#${userId}`,
      SK: `ACCOUNT#${userId}`,
    },
  });

  const { Item: accountItem } = await dynamoClient.send(getAccountCommand);

  if (!accountItem) {
    return response(404, { error: "Account not found" });
  }

  const account = itemToAccount(accountItem);
  const community = itemToCommunity(communityItem);

  const memberId = crypto.randomUUID();
  const now = new Date().toISOString();

  const command = new PutCommand({
    TableName: env.MIVO_TABLE!,
    Item: {
      PK: `COMMUNITY#${communitySlug}`,
      SK: `MEMBER#${userId}`,
      GSI1PK: `MEMBER#${userId}`,
      GSI1SK: `COMMUNITY#${communitySlug}`,
      id: memberId,
      accountId: userId,
      memberName: account.name,
      memberPicture: account.picture,
      type: EEntityType.MEMBER,

      communityId: community.id,
      communityName: community.name,
      communityBanner: community.banner,
      communitySlug: communitySlug,

      createdAt: now,
    },
  });

  await dynamoClient.send(command);

  return response(204);
}
