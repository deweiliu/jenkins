pipeline {
    agent any

    stages {
        stage('Build Jenkins Image') {
            dir('./jenkins-image'){
                sh "docker-compose build"
            }
        }
        stage('Publish Jenkins Image') {
            dir('./jenkins-image'){
                withCredentials([usernamePassword(
                    credentialsId: 'docker',
                    usernameVariable: 'USERNAME',
                    passwordVariable: 'PASSWORD'
                )]) {
                sh '''
                docker login --username $USERNAME --password $PASSWORD
                docker-compose push
                docker logout
                '''
  }
            }
        }        
    }
}