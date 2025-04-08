provider "aws" {
  region = var.aws_region
}

module "event_relay" {
  source = "../../modules/event_relay"

  lambda_receiver_zip     = "${path.module}/../../lambda/receiver.zip"
  lambda_dispatcher_zip   = "${path.module}/../../lambda/dispatcher.zip"

  graphql_endpoint        = var.graphql_endpoint
  auth_token              = var.auth_token
  environment             = "dev"
}