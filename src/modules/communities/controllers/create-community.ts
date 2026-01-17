import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import z from "zod";

import { env } from "../../../config/env";
import { EEntityType } from "../../../interfaces/entityType";
import { buildSlug } from "../../../utils/buildSlug";
import { dynamoClient } from "../../../lib/dynamoClient";
import { response } from "../../../utils/response";
import { itemToAccount } from "../../../utils/mappers/account";

const createCommunitySchema = z.object({
  name: z.string().min(3),
  authenticatedUserId: z.string(),
});

export async function createCommunity(body?: string) {
  const { data, success, error } = createCommunitySchema.safeParse(
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

  const communityId = crypto.randomUUID();
  const now = new Date().toISOString();

  const { name, authenticatedUserId: ownerId } = data;

  const slug = buildSlug(name);

  const getCommunityCommandBySlug = new GetCommand({
    TableName: env.MIVO_TABLE!,
    Key: {
      PK: `COMMUNITY#${slug}`,
      SK: `COMMUNITY#${slug}`,
    },
  });

  const { Item: existingCommunity } = await dynamoClient.send(
    getCommunityCommandBySlug
  );

  if (existingCommunity) {
    return response(409, { error: "Community with this slug already exists" });
  }

  const command = new PutCommand({
    TableName: env.MIVO_TABLE!,
    Item: {
      PK: `COMMUNITY#${slug}`,
      SK: `COMMUNITY#${slug}`,
      GSI1PK: "COMMUNITYS",
      GSI1SK: `OWNER#${ownerId}#COMMUNITY#${slug}`,
      id: communityId,
      name,
      ownerId,
      slug,
      type: EEntityType.COMMUNITY,
      membersCount: 1,
      createdAt: now,
    },
  });

  await dynamoClient.send(command);

  // Buscar Member
  const getAccountCommand = new GetCommand({
    TableName: env.MIVO_TABLE!,
    Key: {
      PK: `ACCOUNT#${ownerId}`,
      SK: `ACCOUNT#${ownerId}`,
    },
  });

  const { Item } = await dynamoClient.send(getAccountCommand);

  if (!Item) {
    return response(404, { error: "Account not found" });
  }

  const account = itemToAccount(Item);

  const createMemberCommand = new PutCommand({
    TableName: env.MIVO_TABLE!,
    Item: {
      PK: `COMMUNITY#${slug}`,
      SK: `MEMBER#${ownerId}`,
      GSI1PK: `MEMBER#${ownerId}`,
      GSI1SK: `COMMUNITY#${slug}`,

      accountId: ownerId,
      communityId: communityId,
      type: EEntityType.MEMBER,
      memberName: account.name,
      memberPicture: account.picture,
      communityName: name,
      communitySlug: slug,
      communityBanner: null,
      createdAt: now,
    },
  });

  await dynamoClient.send(createMemberCommand);

  return response(201, { data: { communityId } });
}
