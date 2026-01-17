import type { AttributeValue } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { DynamoDBRecord, DynamoDBStreamEvent } from "aws-lambda";

import { updateCommunityMembersCount } from "./update-community-members-count";
import { EEntityType } from "../interfaces/entityType";

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

        if (object.type == EEntityType.MEMBER) {
          const communitySlug = object.communitySlug;
          await updateCommunityMembersCount(communitySlug, true);
        }

        console.log("Upserted object:", object);
        return;
      } else if (record.eventName === "REMOVE" && record.dynamodb?.OldImage) {
        const oldObject = record.dynamodb.OldImage as Record<
          string,
          AttributeValue
        >;
        const object = unmarshall(oldObject);

        if (object.type == EEntityType.MEMBER) {
          const communitySlug = object.communitySlug;
          await updateCommunityMembersCount(communitySlug, false);
        }
      }
    }),
  );
}
