terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

data "aws_caller_identity" "current" {}

# Tag aplicada em todo recurso deste módulo, seguindo o padrão já usado
# na conta (ex.: policies do lab marcadas com "Criador").
locals {
  common_tags = {
    createdBy = "Wallace Santana"
  }
}
