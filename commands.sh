# Set up storage for Jenkins (EFS) and build artifacts (s3: dewei-artifacts)
# aws cloudformation update-stack --stack-name JenkinsStorage --template-body file://cloudformation/storage.yml --tags Key=service,Value=jenkins;

# Upload the cloudformation templates onto the build artifact S3 bucket
aws s3 cp ./cloudformation s3://dewei-artifacts/ --recursive;

# Create the Jenkins environment
aws cloudformation create-stack --stack-name Jenkins --capabilities CAPABILITY_NAMED_IAM --template-url https://dewei-artifacts.s3.eu-west-2.amazonaws.com/jenkins.yml --tags Key=service,Value=jenkins;

# From now on, all jobs (building artifacts, deploy CDK/CloudFormation resources) can be done on Jenkins

# To delete stack
# aws cloudformation delete-stack --region eu-west-2 --stack-name Jenkins