# Plataforma Docker, ambiente "Single Instance": não cria Application Load Balancer
# nem Auto Scaling Group, só uma instância EC2 + Elastic IP. Ver docs/adr-001.
resource "aws_elastic_beanstalk_application" "frontend" {
  name        = "extra-frontend-app-${var.name_suffix}"
  description = "Front-end Next.js (BFF) do sistema de pedidos"
  tags        = local.common_tags
}

resource "aws_elastic_beanstalk_environment" "frontend" {
  name                = "extra-frontend-env-${var.name_suffix}"
  application         = aws_elastic_beanstalk_application.frontend.name
  solution_stack_name = "64bit Amazon Linux 2023 v4.13.9 running Docker"
  tier                = "WebServer"
  # Propaga para a instância EC2, volumes etc. criados pelo ambiente.
  tags = local.common_tags

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.frontend.name
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.instance_type
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = aws_security_group.frontend.id
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = var.vpc_id
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = var.public_subnet_id
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "AssociatePublicIpAddress"
    value     = "true"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DYNAMODB_TABLE_NAME"
    value     = var.dynamodb_table_name
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EVENT_BUS_NAME"
    value     = var.event_bus_name
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "AWS_REGION"
    value     = var.region
  }

  # API_GATEWAY_URL é passada no `terraform apply` (-var) ou em um .tfvars não versionado,
  # já que depende da invoke URL gerada no console para pedidos-api-wallacesantana.
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "API_GATEWAY_URL"
    value     = var.api_gateway_url
  }
}
