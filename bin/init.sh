#!/bin/bash

# the project root directory, parent directory of this script file
dir="$(cd "$(dirname "$0")/.."; pwd)"
cd "$dir"

# log $1 in underline green then $2 in yellow
log() {
    echo -e "\033[1;4;32m$1\033[0m \033[1;33m$2\033[0m"
}

if [[ ! -f terraform.tfvars ]]
then
    log create terraform.tfvars file
    
    # copy `terraform.sample.tfvars` as `terraform.tfvars` without overwriting
    cp --no-clobber terraform.sample.tfvars terraform.tfvars
fi

terraform init