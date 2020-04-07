.SILENT:

help:
	grep --extended-regexp '^[a-zA-Z]+:.*#[[:space:]].*$$' $(MAKEFILE_LIST) \
	| awk 'BEGIN { FS = ":.*#[[:space:]]*" } { printf "\033[1;32m%-12s\033[0m%s\n", $$1, $$2 }'

init: # terraform init
	bin/init.sh

validate: # terraform format then validate
	terraform fmt -recursive
	terraform validate

apply: # terraform plan then apply with auto approve
	bin/apply.sh

destroy: # destroy everything with auto approve
	terraform destroy -auto-approve