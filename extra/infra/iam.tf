# IAM role mínima para a instância do Elastic Beanstalk: só lê a tabela de pedidos
# e publica nos dois detail-types de operação que o BFF usa (ver docs/event-contracts.md).
# Permitido pela política do lab: iam:CreateRole / AttachRolePolicy / PassRole.

data "aws_iam_policy_document" "frontend_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "frontend_instance_role" {
  name               = "extra-frontend-instance-role-${var.name_suffix}"
  assume_role_policy = data.aws_iam_policy_document.frontend_assume_role.json
  tags               = local.common_tags
}

data "aws_iam_policy_document" "frontend_permissions" {
  statement {
    sid       = "LerPedidos"
    actions   = ["dynamodb:GetItem", "dynamodb:Query", "dynamodb:Scan"]
    resources = ["arn:aws:dynamodb:${var.region}:${data.aws_caller_identity.current.account_id}:table/${var.dynamodb_table_name}"]
  }

  statement {
    sid       = "PublicarOperacoes"
    actions   = ["events:PutEvents"]
    resources = ["arn:aws:events:${var.region}:${data.aws_caller_identity.current.account_id}:event-bus/${var.event_bus_name}"]
  }

  statement {
    sid       = "Logs"
    actions   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/elasticbeanstalk/*"]
  }
}

resource "aws_iam_role_policy" "frontend_permissions" {
  name   = "extra-frontend-permissions-${var.name_suffix}"
  role   = aws_iam_role.frontend_instance_role.id
  policy = data.aws_iam_policy_document.frontend_permissions.json
}

# Permissão gerenciada pela AWS, necessária para o agente do Elastic Beanstalk
# reportar health/logs da instância — não concede nada em ECS/ECR/ELB.
resource "aws_iam_role_policy_attachment" "eb_web_tier" {
  role       = aws_iam_role.frontend_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_instance_profile" "frontend" {
  name = "extra-frontend-instance-profile-${var.name_suffix}"
  role = aws_iam_role.frontend_instance_role.name
  tags = local.common_tags
}
