# Set up storage for Jenkins (EFS) and build artifacts (s3: dewei-artifacts-copy)
aws cloudformation update-stack --profile=old --region=eu-west-2 --stack-name JenkinsEFS --template-body file://cloudformation/storage.yml --tags Key=service,Value=jenkins;

# Upload the cloudformation templates onto the build artifact S3 bucket
aws s3 cp ./cloudformation s3://dewei-artifacts-copy/ --recursive --profile=old --region=eu-west-2;

# Create the Jenkins environment
aws cloudformation create-stack --profile=old --region=eu-west-2 --stack-name Jenkins --capabilities CAPABILITY_NAMED_IAM --template-url https://dewei-artifacts-copy.s3.eu-west-2.amazonaws.com/jenkins/jenkins.yml --tags Key=service,Value=jenkins;

# From now on, all jobs (building artifacts, deploy CDK/CloudFormation resources) can be done on Jenkins