# Permitido pela política do lab (ec2:CreateSecurityGroup / AuthorizeSecurityGroupIngress).
# Sem referência a elasticloadbalancing:* — a instância recebe tráfego direto.
resource "aws_security_group" "frontend" {
  name        = "extra-frontend-sg-${var.name_suffix}"
  description = "Acesso HTTP/HTTPS a instancia do front-end Next.js (Elastic Beanstalk Single Instance)"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Projeto = "pedidos-frontend"
  })
}
