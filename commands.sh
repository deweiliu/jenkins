aws cloudformation create-stack --stack-name JenkinsEFS --template-body file://cloudformation/storage.yml --tags Key=service,Value=jenkins;
aws s3 cp ./cloudformation s3://dewei-artifacts/ --recursive;
aws cloudformation update-stack --stack-name Jenkins --capabilities CAPABILITY_NAMED_IAM --template-url https://dewei-jenkins.s3.eu-west-2.amazonaws.com/jenkins.yml --tags Key=service,Value=jenkins;