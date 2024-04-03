require("dotenv").config();
const AWS = require("aws-sdk");
const requestSchema = require("./validation");

const SES_config = {
  accessKeyId: process.env.SES_ACCESS_KEY,
  secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
  region: process.env.SES_REGION,
};

const ses = new AWS.SES(SES_config);

exports.handler = async (event) => {
    const data = JSON.parse(event.body);
    const userParams = {
        Source: process.env.AWS_SES_SENDER,
        Destination: {
            ToAddresses: [data.email],
        },
        Message: {
            Body: {
                Text: {
                    Data: `Hi,${data.name}. Thank you for reaching out to us! We received your message and will get back to you as soon as possible.`
                },
            },
            Subject: {
                Data: 'Feedback on contact form.'
            },
        },
    };
    const adminParams = {
        Source: process.env.AWS_SES_SENDER,
        Destination: {
            ToAddresses: [process.env.ADMIN_EMAIL]
        },
        Message: {
            Body: {
                Text: {
                    Data: `New message from contact form. ${data.name} with email ${data.email} left question: ${data.question}`
                },
            },
            Subject: {
                Data: 'New message from contact form.'
            }
        }
    }
  try {  
    const { error } = requestSchema.validate(data);
    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify(error.message),
      };
    }
    await ses.sendEmail(userParams).promise()
    await ses.sendEmail(adminParams).promise()
    return {
      statusCode: 200,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
