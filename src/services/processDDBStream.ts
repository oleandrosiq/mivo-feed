import type { AttributeValue } from "@aws-sdk/client-dynamodb";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { DynamoDBRecord, DynamoDBStreamEvent } from "aws-lambda";
import { env } from "../config/env";
import { dynamoClient } from "../lib/dynamoClient";
import { itemToCommunity } from "../utils/mappers/community";

export async function handler(event: DynamoDBStreamEvent) {
  await Promise.all(
    event.Records.map(async (record) => {
      const upsertEvents: DynamoDBRecord["eventName"][] = ["INSERT", "MODIFY"];

      if (
        upsertEvents.includes(record.eventName) &&
        record.dynamodb?.NewImage
      ) {
        const newObject = record.dynamodb.NewImage as Record<
          string,
          AttributeValue
        >;
        const object = unmarshall(newObject);

        if (object.type == "Member") {
          const communitySlug = object.communitySlug;

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
            return;
          }

          const community = itemToCommunity(communityItem);
          const newMembersCount = community.membersCount + 1;

          console.log({ newMembersCount, community });

          const command = new UpdateCommand({
            TableName: env.MIVO_TABLE!,
            Key: {
              PK: `COMMUNITY#${communitySlug}`,
              SK: `COMMUNITY#${communitySlug}`,
            },
            UpdateExpression: `SET #membersCount = :membersCount`,
            ExpressionAttributeNames: {
              "#membersCount": "membersCount",
            },
            ExpressionAttributeValues: {
              ":membersCount": newMembersCount,
            },
          });

          await dynamoClient.send(command);
        }

        console.log("Upserted object:", object);
        return;
      }

      const objectId = record.dynamodb?.OldImage?.id?.S;

      if (record.eventName === "REMOVE" && objectId) {
        console.log("Removed object with ID:", objectId);
      }
    }),
  );
}
