pipeline {
    agent any

    stages {
        stage('Build Jenkins Image') {
            steps{
            dir('./jenkins-image'){
                sh "docker build . --tag deweiliu/jenkins:latest"
            }
            }
        }
        stage('Publish Jenkins Image') {
            steps{

            dir('./jenkins-image'){
                withCredentials([usernamePassword(
                    credentialsId: 'docker',
                    usernameVariable: 'USERNAME',
                    passwordVariable: 'PASSWORD'
                )]) {
                sh '''
                docker login --username $USERNAME --password $PASSWORD
                docker push
                docker logout
                '''
  }
            }
            }
        }        
    }
}