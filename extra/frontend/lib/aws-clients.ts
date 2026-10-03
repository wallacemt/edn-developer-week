import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { EventBridgeClient } from "@aws-sdk/client-eventbridge";

// Credenciais resolvidas automaticamente pelo SDK: IAM instance role em produção
// (Elastic Beanstalk / EC2), ou o profile local (`aws configure`) em desenvolvimento.
const region = process.env.AWS_REGION ?? "us-west-1";

export const dynamoClient = new DynamoDBClient({ region });
export const eventBridgeClient = new EventBridgeClient({ region });
