exports.hello = async (event) => {
  let message = "Default message";

  if (event.rawPath === "/hello") {
    message = "Go Serverless v4! Your function executed successfully!";
  } else if (event.rawPath === "/start") {
    message = "Start route triggered successfully!";
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  };
};

exports.bye = async (event) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Bye Serverless v4! Your function executed successfully!",
    }),
  };
};
