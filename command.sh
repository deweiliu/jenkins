aws s3 cp ./cloudformation/ s3://dewei-jenkins/ --recursive;
aws cloudformation update-stack --stack-name Jenkins --capabilities CAPABILITY_NAMED_IAM --template-body file://cloudformation/main.yml;