#!/bin/bash

# the project root directory, parent directory of this script file
dir="$(cd "$(dirname "$0")/.."; pwd)"
cd "$dir"

# echo $1 in underline magenta then $2 in cyan
err() {
    echo -e "\033[1;4;35m$1\033[0m \033[1;36m$2\033[0m" >&2
}

if [[ ! -f terraform.tfvars ]]
then
    err fail 'terraform.tfvars is missing'
    exit
fi

if [[ -z $(grep --extended-regexp '^github_token.*=.*"[a-z0-9]+"$' terraform.tfvars) ]]
then
    err fail 'terraform.tfvars must be defined'
    exit
fi

terraform plan -var-file terraform.tfvars -out=terraform.plan
terraform apply -auto-approve terraform.plan