output "receiver_lambda_arn" {
  value = module.event_relay.receiver_lambda_arn
}

output "dispatcher_lambda_arn" {
  value = module.event_relay.dispatcher_lambda_arn
}