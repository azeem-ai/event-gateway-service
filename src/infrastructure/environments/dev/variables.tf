variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "graphql_endpoint" {
  description = "GraphQL endpoint for dispatch"
  type        = string
}

variable "auth_token" {
  description = "Authentication token for GraphQL"
  type        = string
}