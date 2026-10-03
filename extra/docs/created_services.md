# Inventário — camada extra (front-end)

[← Índice da camada extra](../README.md)

> Status: **implantado em 03/10/2026**. Criado via `terraform apply` em `extra/infra` + deploy do código (`extra/frontend`) como versão `v2` do Elastic Beanstalk.

## Convenção de tags

Todo recurso criado pelo Terraform desta camada recebe a tag `createdBy: "Wallace Santana"` (definida em `local.common_tags`, em `extra/infra/main.tf`), seguindo o mesmo padrão de identificação de autoria já usado na conta do lab (ex.: as policies `recursos-alunos`/`restricoes-alunos` marcadas com a tag `Criador`).

## Criado por `extra/infra` (Terraform)

- IAM Role — `extra-frontend-instance-role-wallacesantana`
  - ARN: `arn:aws:iam::006952505713:role/extra-frontend-instance-role-wallacesantana`
  - Permissões: `dynamodb:GetItem`/`Query`/`Scan` no ARN de `pedidos-db-wallacesantana`; `events:PutEvents` no ARN de `pedidos-event-bus-wallacesantana`; `logs:CreateLogGroup`/`PutLogEvents`; managed policy `AWSElasticBeanstalkWebTier` (agente de health do EB).
- IAM Instance Profile — `extra-frontend-instance-profile-wallacesantana`.
- Security Group — `extra-frontend-sg-wallacesantana`
  - ID: `sg-02f8e74f3a6b6930e` (80/443 de entrada, saída livre).
- Elastic Beanstalk Application — `extra-frontend-app-wallacesantana`.
- Elastic Beanstalk Environment — `extra-frontend-env-wallacesantana`
  - Environment Id: `e-4dbdtbzdjf`
  - Plataforma: `64bit Amazon Linux 2023 v4.13.9 running Docker`, `EnvironmentType = SingleInstance` (sem ELB)
  - URL: http://extra-frontend-env-wallacesantana.eba-jczemvu2.us-west-1.elasticbeanstalk.com
  - Elastic IP: `54.215.45.250`

## Deploy do código (fora do `terraform apply`)

O bundle do front-end (`extra/frontend`, com `Dockerfile`) foi enviado como versão da aplicação Elastic Beanstalk:

1. `aws s3 cp` do zip para o bucket que o próprio EB gerencia na região (`elasticbeanstalk-us-west-1-006952505713`, obtido via `elasticbeanstalk:CreateStorageLocation`).
2. `aws elasticbeanstalk create-application-version` referenciando esse objeto.
3. `aws elasticbeanstalk update-environment --version-label ...` para apontar o ambiente para a versão.

- `v1`: falhou — `Dockerfile` copiava `./public`, mas o diretório não existia no scaffold (corrigido adicionando `extra/frontend/public/.gitkeep`).
- `v2`: publicada com sucesso (`Ready` / `Green`) — design inicial, sem Tailwind.
- `v3`: **travou a instância.** O redesign (Tailwind + lucide-react) tornou `npm run build` pesado demais para a `t3.micro`; sem crédito de CPU de sobra (burstable), o build no `docker build` consumiu a CPU a ponto da instância parar de responder a health check e HTTP. `aws elasticbeanstalk abort-environment-update` foi chamado, mas a instância (`i-045c2965d1e96fa01`) nunca voltou a enviar dados de health (travada por mais de 30 minutos no total) — indício de que o daemon Docker/host ficou em estado inconsistente, não só lento.
- Correção de estratégia: o `Dockerfile` deixou de rodar `npm install`/`npm run build` dentro do container — agora só empacota um build já pronto (`.next/standalone`), feito localmente antes do zip. Ver [`frontend/README.md`](../frontend/README.md#build-de-produção--imagem-docker).
- Primeira tentativa da `v4` (bundle já leve) *ainda* travou na mesma instância corrompida — confirmando que o problema era o host, não o tamanho do build. Resolvido com `ec2:TerminateInstances` na instância travada; o Auto Scaling Group do ambiente (`SingleInstance`, capacidade 1) detectou e lançou uma substituta (`i-0dad413b45a6cbcca`) automaticamente.
- `v4` reimplantada na instância nova — **publicada com sucesso** (`Ready`/`Green`/`v4`). É a versão em produção.

## Recursos já existentes reaproveitados (sem alteração)

- API Gateway: `pedidos-api-wallacesantana` (invoke URL do stage `dev`: `https://ko20e3ys6k.execute-api.us-west-1.amazonaws.com/dev`)
- DynamoDB: `pedidos-db-wallacesantana`
- EventBridge bus: `pedidos-event-bus-wallacesantana` (rules `altera-pedido-rule-wallacesantana`, `cancela-pedido-rule-wallacesantana`)
- VPC default: `vpc-02503d3297358cfbc` (subnet pública `subnet-03ce986299cccde6e`, AZ `us-west-1a`)

## Evidência de teste (03/10/2026)

- `GET /` → `200`, dashboard com o redesign (Tailwind, gradientes, imagens dinâmicas) renderizando e listando pedidos reais lidos do DynamoDB — confirma a IAM role da instância lendo a tabela via SDK.
- `GET /pedidos/novo` → `200`.
- Criar/alterar/cancelar um pedido pelo formulário ainda não foi testado manualmente (ficaria registrado aqui com print, como nos outros `day_N`).

## Incidente: instância travada durante o redesign visual

Ao adicionar Tailwind CSS + lucide-react e rodar o build dentro do `docker build` na instância do lab (`t3.micro`, CPU *burstable*), a instância ficou sem créditos de CPU de sobra e parou de responder (health check e HTTP) por mais de 30 minutos, mesmo após `abort-environment-update`. A causa raiz não era só "build pesado": mesmo depois de mudar a estratégia para empacotar um build já pronto (artefato leve, sem compilar nada na instância), a mesma instância continuou travada — sinal de que o host ficou em estado inconsistente, não apenas sobrecarregado.

Resolução: terminar a instância manualmente (`ec2:TerminateInstances`); o Auto Scaling Group do ambiente (`EnvironmentType = SingleInstance`, capacidade desejada 1) detectou a perda e lançou uma instância nova automaticamente, na qual a versão `v4` foi reimplantada com sucesso.

Lição registrada: para instâncias pequenas e burstable, builds de front-end modernos (Tailwind JIT, bundlers) não devem rodar no próprio host de produção — build local ou em CI, deploy só do artefato.

## Custo e desligamento

Ambiente `SingleInstance` com uma `t3.micro` + 1 Elastic IP associado — dentro do free tier por 12 meses, mas gera custo depois disso ou se o IP ficar sem instância associada. Para desligar tudo:

```bash
cd extra/infra
terraform destroy -var="api_gateway_url=https://ko20e3ys6k.execute-api.us-west-1.amazonaws.com/dev"
```
