
deploy-storage:
	aws cloudformation create-stack --region eu-west-2 --stack-name JenkinsStorage --template-body file://storage/cloudformation.yml --tags Key=service,Value=jenkins;
update-storage:
	aws cloudformation update-stack --region eu-west-2 --stack-name JenkinsStorage --template-body file://storage/cloudformation.yml --tags Key=service,Value=jenkins;
	