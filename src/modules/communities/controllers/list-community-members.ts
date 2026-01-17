import z from "zod";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import { dynamoClient } from "../../../lib/dynamoClient";
import { env } from "../../../config/env";
import { itemToMember } from "../../../utils/mappers/member";
import { response } from "../../../utils/response";

const listCommunityMembersSchema = z.object({
  communitySlug: z.string(),
});

export async function listCommunityMembers(body?: string) {
  const { data, success, error } = listCommunityMembersSchema.safeParse(
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

  const { communitySlug } = data;

  const command = new QueryCommand({
    TableName: env.MIVO_TABLE!,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
    ExpressionAttributeValues: {
      ":pk": `COMMUNITY#${communitySlug}`,
      ":sk": `MEMBER#`,
    },
  });

  const { Items = [] } = await dynamoClient.send(command);

  const members = Items.map(itemToMember);

  return response(200, {
    data: {
      members,
    },
  });
}
