#
# variables defined in `terraform.tfvars`
#

variable github_token {}
variable github_owner {}
variable github_repository_name {}
variable slack_path {}

locals {
  project_name = "github-flow-codesuite-${random_id.random.hex}"
  region       = "eu-west-3"
}

provider aws {
  region = local.region
}

resource random_id random {
  byte_length = 3
}

#
# modules
#

module pipeline {
  source                 = "./pipeline"
  project_name           = local.project_name
  github_token           = var.github_token
  github_owner           = var.github_owner
  github_repository_name = var.github_repository_name
  sns_topic_arn = module.notification.sns_topic_arn
}

module notification {
  source       = "./notification"
  project_name = local.project_name
  slack_path   = var.slack_path
}

#
# outputs
#

output project_name {
  value = local.project_name
}