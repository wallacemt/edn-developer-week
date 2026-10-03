# Infraestrutura — Terraform

[← Índice da camada extra](../README.md) · [Arquitetura](../docs/architecture.md) · [ADR-001](../docs/adr-001-fargate-vs-elastic-beanstalk.md)

Cria somente o que a política do lab permite: Security Group, IAM role/instance profile e um ambiente Elastic Beanstalk (Docker, **Single Instance** — sem ELB). Reaproveita a VPC default e os recursos dos Dias 1 a 4; não cria nada neles.

Todo recurso criado leva a tag `createdBy: "Wallace Santana"` (`local.common_tags` em `main.tf`), seguindo o padrão de autoria já usado na conta do lab.

**Nada foi aplicado ainda.** Esta etapa só deixa o código pronto, conforme pedido.

## Pré-requisitos antes de aplicar

1. Terraform >= 1.5 e um profile AWS (`aws configure`) com o usuário do laboratório.
2. A invoke URL do stage da `pedidos-api-wallacesantana` (Dia 1), para passar em `api_gateway_url`.
3. O código do front-end (`../frontend`) buildado ao menos uma vez localmente (`npm run build`) para confirmar que não há erro antes de depender do build do próprio Elastic Beanstalk.

## Uso

```bash
cd extra/infra
terraform init
terraform validate
terraform plan -var="api_gateway_url=https://SEU_API_ID.execute-api.us-west-1.amazonaws.com/dev"
# só quando estiver pronto para publicar de fato:
# terraform apply -var="api_gateway_url=..."
```

O deploy da imagem/código em si (upload do bundle do front-end para o Elastic Beanstalk) é um passo separado do `terraform apply` — normalmente via `eb deploy` (EB CLI) ou subindo um `.zip`/`Dockerrun.aws.json` pelo console, depois que o ambiente já existir.

## Limitações conhecidas (documentadas, não bugs)

- Sem Application Load Balancer e sem Auto Scaling — uma única instância (`EnvironmentType = SingleInstance`), porque `elasticloadbalancing:*` é bloqueado nesta conta (ver ADR-001).
- Sem HTTPS customizado — exigiria ACM + domínio próprio, fora do escopo do lab.
- `aws_iam_role_policy_attachment.eb_web_tier` usa uma managed policy da AWS só para o agente do Elastic Beanstalk reportar health; não concede nada em ECS/ECR/ELB.
- `var.api_gateway_url` não tem default: precisa ser passada explicitamente, pois depende do que o console gerou no Dia 1.
