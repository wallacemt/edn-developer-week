variable "region" {
  description = "Região AWS (mesma usada nos Dias 1 a 4)"
  type        = string
  default     = "us-west-1"
}

variable "name_suffix" {
  description = "Sufixo de nome usado em todos os recursos do laboratório (ex.: wallacesantana)"
  type        = string
  default     = "wallacesantana"
}

variable "dynamodb_table_name" {
  description = "Tabela DynamoDB já existente (Dias 3/4) que o front-end lê"
  type        = string
  default     = "pedidos-db-wallacesantana"
}

variable "event_bus_name" {
  description = "Event bus EventBridge já existente (Dia 1) em que o front-end publica eventos"
  type        = string
  default     = "pedidos-event-bus-wallacesantana"
}

variable "vpc_id" {
  description = "VPC default já existente na conta/região"
  type        = string
  default     = "vpc-02503d3297358cfbc"
}

variable "public_subnet_id" {
  description = "Subnet pública default usada pela instância do Elastic Beanstalk"
  type        = string
  default     = "subnet-03ce986299cccde6e"
}

variable "instance_type" {
  description = "Tipo de instância EC2 do ambiente Single Instance (free tier)"
  type        = string
  default     = "t3.micro"
}

variable "api_gateway_url" {
  description = "Invoke URL do stage da API Gateway existente (pedidos-api-wallacesantana), sem barra final"
  type        = string
}
