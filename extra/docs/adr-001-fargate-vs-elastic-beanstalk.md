# ADR-001: Fargate como alvo, Elastic Beanstalk Single Instance como implementação de laboratório

[← Índice da camada extra](../README.md) · [Arquitetura](architecture.md)

## Status

Aceito.

## Contexto

O plano original para a camada extra era um front-end em Next.js rodando em container no Amazon ECS Fargate, atrás de um Application Load Balancer, em uma VPC com subnets públicas e privadas.

Esta conta AWS é compartilhada por uma turma de laboratório (`Alunos` IAM group, políticas `recursos-alunos` / `restricoes-alunos`, usuário `dev21.0036`). Uma verificação com `iam:SimulatePrincipalPolicy` mostrou que um **SCP de Organization** nega, para este usuário:

- `ecs:*` (ex.: `CreateCluster`, `CreateService`, `RegisterTaskDefinition`, `DescribeClusters`)
- `ecr:*` (ex.: `CreateRepository`, `GetAuthorizationToken`)
- `elasticloadbalancing:*` (ex.: `CreateLoadBalancer`, `CreateTargetGroup`, `DescribeLoadBalancers`)
- `apprunner:*`, `amplify:CreateApp`, `cloudfront:*`, `lightsail:*` (alternativas gerenciadas também bloqueadas)

E permite, entre outros:

- `ec2:RunInstances`, `ec2:DescribeInstances`
- `elasticbeanstalk:CreateApplication`, `elasticbeanstalk:CreateEnvironment`
- `iam:CreateRole`, `iam:AttachRolePolicy`, `iam:PassRole`
- `s3:CreateBucket`, `s3:PutBucketWebsite`, `logs:CreateLogGroup`, `ec2:CreateSecurityGroup`

Ou seja: **Fargate não pode ser provisionado nesta conta**, por política organizacional, não por falta de conhecimento ou configuração.

## Decisão

1. Documentar e manter a arquitetura em Fargate como **arquitetura-alvo** (`architecture.md`), para fins de portfólio — é o desenho correto para um ambiente de produção.
2. Implementar de fato, nesta conta, usando **AWS Elastic Beanstalk, plataforma Docker, ambiente do tipo "Single Instance"**.

O ambiente Single Instance do Elastic Beanstalk **não cria Application Load Balancer nem Auto Scaling Group** — ele provisiona uma única instância EC2 com um Elastic IP. Como a chamada a `elasticloadbalancing:*` nunca ocorre nesse modo, o deploy funciona dentro da política do lab sem precisar de nenhuma permissão adicional.

## Alternativas consideradas

| Alternativa | Por que não |
| --- | --- |
| ECS Fargate + ALB | Bloqueado por SCP (`ecs:*`, `ecr:*`, `elasticloadbalancing:*`) |
| AWS App Runner | Bloqueado por SCP (`apprunner:*`) |
| AWS Amplify Hosting | Bloqueado por SCP (`amplify:CreateApp`); também não serve bem um BFF com SSR + SDK AWS no servidor |
| Amazon Lightsail Containers | Bloqueado por SCP (`lightsail:*`) |
| Elastic Beanstalk — ambiente "Load balanced" (padrão) | Permitido no papel, mas provisiona ALB internamente — provavelmente falharia ao tentar `elasticloadbalancing:CreateLoadBalancer` com as credenciais do aluno |
| EC2 puro (sem Elastic Beanstalk), gerenciado manualmente | Funcionaria, mas perde o build/deploy gerenciado do EB (upload do bundle, versionamento de releases, health checks) sem ganhar nada em troca |

## Consequências

- **Positivo**: deploy funciona dentro das restrições reais do lab; a decisão e o motivo ficam documentados (bom sinal de maturidade de engenharia para o portfólio); nenhuma alteração no backend serverless existente.
- **Negativo**: sem alta disponibilidade (uma única instância) e sem auto scaling nesta implementação; sem HTTPS customizado (seria necessário ACM + domínio próprio, não verificado nesta etapa).
- **Reversível**: se a conta de produção/pessoal não tiver essa restrição, a migração para o alvo (Fargate) é direta — o código do front-end (Next.js + Dockerfile) é o mesmo; só a camada de infraestrutura (`extra/infra`) muda.
