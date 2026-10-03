output "environment_url" {
  description = "URL pública do ambiente Elastic Beanstalk (CNAME)"
  value       = aws_elastic_beanstalk_environment.frontend.cname
}

output "instance_role_arn" {
  description = "ARN da IAM role usada pela instância do front-end"
  value       = aws_iam_role.frontend_instance_role.arn
}

output "security_group_id" {
  description = "ID do Security Group da instância"
  value       = aws_security_group.frontend.id
}
