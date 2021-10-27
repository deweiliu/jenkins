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
                sh "aws s3 cp ./cloudformation s3://dewei-artifacts/ --recursive;"
            }
        }

        stage('Deploy Jenkins EFS') {
            steps {
                catchError(buildResult:'SUCCESS', stageResult:'SUCCESS') {
                    sh """
                        aws cloudformation update-stack --region eu-west-2 --stack-name JenkinsEFS --template-url ${pathUrl}/storage.yml --tags Key=service,Value=jenkins;
                        aws cloudformation wait stack-update-complete --stack-name JenkinsEFS;
                    """
                }
            }
        }
        stage('Deploy Jenkins Service') {
            steps {
                    sh """
                        aws cloudformation update-stack --region eu-west-2 --stack-name Jenkins --template-url ${pathUrl}/jenkins.yml --tags Key=service,Value=jenkins;
                        aws cloudformation wait stack-update-complete --stack-name Jenkins
                    """
            }
        }
    }
}
