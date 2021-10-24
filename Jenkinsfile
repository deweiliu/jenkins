pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
            withAWS(region:'eu-west-1') {
                sh "aws --version"
                // do something
            }
                sh "bash commands.sh"
            }
        }

    }
}