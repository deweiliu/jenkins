
synth:
	cd cdk && npm run synth
deploy: synth
	cd cdk-corrected && npm run deploy
install:
	cd cdk && npm install
	cd cdk-corrected && npm install
deploy-storage:
	aws cloudformation create-stack --region eu-west-2 --stack-name JenkinsStorage --template-body file://storage/cloudformation.yml --tags Key=service,Value=jenkins;
update-storage:
	aws cloudformation update-stack --region eu-west-2 --stack-name JenkinsStorage --template-body file://storage/cloudformation.yml --tags Key=service,Value=jenkins;
	