pipeline {
    agent {
        label 'amazon-linux'
    }
  
        stage('Upload CloudFormation Templates'){
            steps{
                s3Upload(bucket:'dewei-artifacts/',path:'jenkins/',includePathPattern:"./cloudformation/**.yml")
            }
        }

        stage('Deploy Jenkins EFS'){
            steps{
            
            }
        }
    }
}