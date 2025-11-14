# Configuração do Terraform para GCP
# Este arquivo cria toda a infraestrutura necessária no GCP

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Configuração do Provider
provider "google" {
  project = var.project_id
  region  = var.region
}

# Habilitar APIs necessárias
resource "google_project_service" "services" {
  for_each = toset([
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudresourcemanager.googleapis.com",
  ])
  
  service            = each.value
  disable_on_destroy = false
}

# Cloud SQL - PostgreSQL
resource "google_sql_database_instance" "bartab_db" {
  name             = "bartab-postgres"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier              = var.database_tier
    availability_type = "ZONAL"
    disk_size         = 10
    disk_type         = "PD_SSD"

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 7
      }
    }

    ip_configuration {
      ipv4_enabled    = true
      ssl_mode        = "ENCRYPTED_ONLY"
      private_network = null
    }

    database_flags {
      name  = "max_connections"
      value = "100"
    }
  }

  deletion_protection = true

  depends_on = [google_project_service.services]
}

# Database
resource "google_sql_database" "database" {
  name     = "bartab_production"
  instance = google_sql_database_instance.bartab_db.name
}

# Database User
resource "google_sql_user" "users" {
  name     = "bartab"
  instance = google_sql_database_instance.bartab_db.name
  password = var.db_password
}

# Secret Manager - DATABASE_URL
resource "google_secret_manager_secret" "database_url" {
  secret_id = "bartab-database-url"

  replication {
    auto {}
  }

  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "database_url" {
  secret = google_secret_manager_secret.database_url.id
  secret_data = "postgresql://${google_sql_user.users.name}:${var.db_password}@/${google_sql_database.database.name}?host=/cloudsql/${google_sql_database_instance.bartab_db.connection_name}"
}

# Secret Manager - JWT_SECRET
resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "bartab-jwt-secret"

  replication {
    auto {}
  }

  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "jwt_secret" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = var.jwt_secret
}

# Secret Manager - GOOGLE_CLIENT_ID
resource "google_secret_manager_secret" "google_client_id" {
  secret_id = "bartab-google-client-id"

  replication {
    auto {}
  }

  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "google_client_id" {
  secret      = google_secret_manager_secret.google_client_id.id
  secret_data = var.google_client_id
}

# Secret Manager - GOOGLE_CLIENT_SECRET
resource "google_secret_manager_secret" "google_client_secret" {
  secret_id = "bartab-google-client-secret"

  replication {
    auto {}
  }

  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "google_client_secret" {
  secret      = google_secret_manager_secret.google_client_secret.id
  secret_data = var.google_client_secret
}

# Secret Manager - SMTP
resource "google_secret_manager_secret" "smtp_user" {
  secret_id = "bartab-smtp-user"

  replication {
    auto {}
  }

  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "smtp_user" {
  secret      = google_secret_manager_secret.smtp_user.id
  secret_data = var.smtp_user
}

resource "google_secret_manager_secret" "smtp_pass" {
  secret_id = "bartab-smtp-pass"

  replication {
    auto {}
  }

  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "smtp_pass" {
  secret      = google_secret_manager_secret.smtp_pass.id
  secret_data = var.smtp_pass
}

# Service Account para Cloud Run
resource "google_service_account" "bartab_backend" {
  account_id   = "bartab-backend-sa"
  display_name = "BarTab Backend Service Account"
}

# Permissões para acessar secrets
resource "google_secret_manager_secret_iam_member" "backend_secrets" {
  for_each = toset([
    "bartab-database-url",
    "bartab-jwt-secret",
    "bartab-google-client-id",
    "bartab-google-client-secret",
    "bartab-smtp-user",
    "bartab-smtp-pass",
  ])

  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.bartab_backend.email}"
  
  depends_on = [
    google_secret_manager_secret.database_url,
    google_secret_manager_secret.jwt_secret,
    google_secret_manager_secret.google_client_id,
    google_secret_manager_secret.google_client_secret,
    google_secret_manager_secret.smtp_user,
    google_secret_manager_secret.smtp_pass,
  ]
}

# Permissões para acessar Cloud SQL
resource "google_project_iam_member" "backend_cloudsql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.bartab_backend.email}"
}

# Outputs
output "database_instance_name" {
  value       = google_sql_database_instance.bartab_db.name
  description = "Nome da instância Cloud SQL"
}

output "database_connection_name" {
  value       = google_sql_database_instance.bartab_db.connection_name
  description = "Connection name do Cloud SQL"
}

output "service_account_email" {
  value       = google_service_account.bartab_backend.email
  description = "Email da service account do backend"
}

output "database_public_ip" {
  value       = google_sql_database_instance.bartab_db.public_ip_address
  description = "IP público do banco de dados"
}

