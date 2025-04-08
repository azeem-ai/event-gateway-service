resource "aws_sqs_queue" "event_queue" {
  name = "event-relay-queue-${var.environment}"
}

resource "aws_iam_role" "lambda_exec" {
  name = "lambda-exec-role-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "receiver" {
  function_name = "event-receiver-${var.environment}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "handler.handler"
  runtime       = "nodejs20.x"
  filename      = var.lambda_receiver_zip
  source_code_hash = filebase64sha256(var.lambda_receiver_zip)

  environment {
    variables = {
      SQS_QUEUE_URL = aws_sqs_queue.event_queue.id
    }
  }
}

resource "aws_lambda_function" "dispatcher" {
  function_name = "event-dispatcher-${var.environment}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "handler.handler"
  runtime       = "nodejs20.x"
  filename      = var.lambda_dispatcher_zip
  source_code_hash = filebase64sha256(var.lambda_dispatcher_zip)

  environment {
    variables = {
      GRAPHQL_ENDPOINT = var.graphql_endpoint
      AUTH_TOKEN       = var.auth_token
    }
  }
}

resource "aws_lambda_event_source_mapping" "queue_to_dispatcher" {
  event_source_arn = aws_sqs_queue.event_queue.arn
  function_name    = aws_lambda_function.dispatcher.arn
  batch_size       = 10
}

output "receiver_lambda_arn" {
  value = aws_lambda_function.receiver.arn
}

output "dispatcher_lambda_arn" {
  value = aws_lambda_function.dispatcher.arn
}