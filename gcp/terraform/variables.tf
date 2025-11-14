# Variáveis do Terraform
# Copie este arquivo para terraform.tfvars e preencha com seus valores

variable "project_id" {
  description = "ID do projeto GCP"
  type        = string
}

variable "region" {
  description = "Região do GCP"
  type        = string
  default     = "us-central1"
}

variable "database_tier" {
  description = "Tier da instância Cloud SQL (db-f1-micro, db-g1-small, db-n1-standard-1, etc)"
  type        = string
  default     = "db-f1-micro"
}

variable "db_password" {
  description = "Senha do usuário do banco de dados"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret para JWT"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
}

variable "smtp_user" {
  description = "Usuário SMTP"
  type        = string
  sensitive   = true
}

variable "smtp_pass" {
  description = "Senha SMTP"
  type        = string
  sensitive   = true
}

