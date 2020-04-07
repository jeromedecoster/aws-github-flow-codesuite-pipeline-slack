resource aws_sns_topic topic {
  name = var.project_name
}

resource aws_sns_topic_policy topic_policy {
  arn    = aws_sns_topic.topic.arn
  policy = data.aws_iam_policy_document.sns_topic_policy.json
}

data aws_iam_policy_document sns_topic_policy {
  statement {
    actions = ["SNS:Publish"]

    principals {
      type        = "Service"
      identifiers = ["codestar-notifications.amazonaws.com"]
    }

    resources = [aws_sns_topic.topic.arn]
  }
}

resource aws_sns_topic_subscription topic_subscription {
  topic_arn = aws_sns_topic.topic.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.lambda.arn
}

#
# output
#

output sns_topic_arn {
  value = aws_sns_topic.topic.arn
}