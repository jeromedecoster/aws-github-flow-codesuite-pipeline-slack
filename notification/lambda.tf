data archive_file lambda_zip {
  type        = "zip"
  source_file = "${path.module}/index.js"
  output_path = "/tmp/lambda_zip.zip"
}

resource aws_lambda_function lambda {
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  function_name    = var.project_name
  handler          = "index.handler"
  runtime          = "nodejs12.x"
  role             = aws_iam_role.lambda_role.arn

  environment {
    variables = {
      SLACK_PATH = var.slack_path
    }
  }
}

resource aws_lambda_permission lambda_permission {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.topic.arn
}

resource aws_cloudwatch_log_group lambda_log_group {
  name = "/aws/lambda/${aws_lambda_function.lambda.function_name}"
}

#
# lambda assume role policy
#

data aws_iam_policy_document assume_role_policy {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource aws_iam_role lambda_role {
  name               = "${var.project_name}-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

#
# lambda policy
#

data aws_iam_policy_document lambda_policy {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["*"]
  }
}

resource aws_iam_policy lambda_policy {
  name   = "${var.project_name}-lambda-policy"
  policy = data.aws_iam_policy_document.lambda_policy.json
}

resource aws_iam_role_policy_attachment lambda_role_attached_policy {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}