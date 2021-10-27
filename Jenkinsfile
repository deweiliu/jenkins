def bucket = 'dewei-artifacts'
def bucketPath = 'jenkins'
def pathUrl = "https://${bucket}.s3.eu-west-2.amazonaws.com/${bucketPath}"

pipeline {
    agent {
        label 'amazon-linux'
    }
    stages {
        stage('Upload CloudFormation Templates') {
            steps {
                s3Upload(bucket:bucket, path:bucketPath, file:'cloudformation/')
            }
        }

        stage('Deploy Jenkins EFS') {
            steps {
                sh "aws cloudformation update-stack --stack-name JenkinsEFS --template-body file://cloudformation/storage.yml --tags Key=service,Value=jenkins;"
                // cfnUpdate(stack:'JenkinsEFS', template:"${pathUrl}/storage.yml")
            }
        }
    }
}
