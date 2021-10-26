pipeline {
    agent {
        label 'amazon-linux'
    }
    stages{
        stage('Upload CloudFormation Templates'){
            steps{
                s3Upload(bucket:'dewei-artifacts/',path:'jenkins/',includePathPattern:"./cloudformation/**.yml")
            }
        }

        stage('Deploy Jenkins EFS'){
            steps{
                echo 'test'
            }
        }
    }
}