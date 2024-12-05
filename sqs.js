import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { Consumer } from "sqs-consumer";

const STANDARD_QUEUE =
  "https://sqs.ap-south-2.amazonaws.com/<queue-id>/<queue-name>";

const FIFO_QUEUE =
  "https://sqs.ap-south-2.amazonaws.com/<queue-id>/<queue-name>.fifo";

const credentials = {
  region: "<region-id>",
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
};

const SQS_CLIENT = new SQSClient(credentials);

const sendMessageToQueue = async (type, queue_url, body, details) => {
  try {
    const request = new SendMessageCommand({
      MessageBody: body,
      QueueUrl: queue_url,
      MessageAttributes: {
        id: {
          DataType: "String",
          StringValue: "4421x",
        },
      },
      ...(type === "STANDARD"
        ? {}
        : {
            MessageGroupId: details.MessageGroupId,
            MessageDeduplicationId: details.MessageDeduplicationId,
          }),
    });
    const result = await SQS_CLIENT.send(request);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

const pollMessageFromQueue = async (queue_url) => {
  try {
    const request = new ReceiveMessageCommand({
      MaxNumberOfMessages: 1,
      QueueUrl: queue_url,
      WaitTimeSeconds: 5,
      MessageAttributes: ["ALL"],
    });
    const result = await SQS_CLIENT.send(request);
    console.log(result);
    await deleteMessageFromQueue(queue_url, result.Messages[0].ReceiptHandle);
    console.log("Removed from queue");
  } catch (error) {
    console.error(error);
  }
};

const deleteMessageFromQueue = async (queue_url, receipt_handle) => {
  try {
    const result = await SQS_CLIENT.send(
      new DeleteMessageCommand({
        QueueUrl: queue_url,
        ReceiptHandle: receipt_handle,
      })
    );
    return result;
  } catch (error) {
    console.error(error);
  }
};

/* sendMessageToQueue("STANDARD", STANDARD_QUEUE, "Hello from standard 1");
sendMessageToQueue("STANDARD", STANDARD_QUEUE, "Hello from standard 2");
sendMessageToQueue("STANDARD", STANDARD_QUEUE, "Hello from standard 3");

sendMessageToQueue("FIFO", FIFO_QUEUE, "Hello from fifo 1", {
  MessageGroupId: "1",
  MessageDeduplicationId: "1",
});
sendMessageToQueue("FIFO", FIFO_QUEUE, "Hello from fifo 2", {
  MessageGroupId: "1",
  MessageDeduplicationId: "2",
});
sendMessageToQueue("FIFO", FIFO_QUEUE, "Hello from fifo 3", {
  MessageGroupId: "1",
  MessageDeduplicationId: "3",
}); */

// pollMessageFromQueue(FIFO_QUEUE);

// Automatically removes from the queue once successfully received
const consumer = Consumer.create({
  queueUrl: FIFO_QUEUE,
  sqs: SQS_CLIENT,
  handleMessage: async (message) => {
    console.log(message);
  },
});

consumer.on("started", () => console.log("Consumer listening...."));

consumer.on("processing_error", (err) => {
  console.error(err);
});

consumer.start();
