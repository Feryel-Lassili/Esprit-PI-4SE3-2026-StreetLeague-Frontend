pipeline {
    agent any

    tools {
        nodejs 'node24'
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                echo '⚠️ Tests skipped (Chrome not installed on Jenkins)'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build -- --configuration production'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: true
            echo 'Pipeline finished'
        }
        success {
            echo '✅ Angular Frontend Pipeline Succeeded!'
        }
        failure {
            echo '❌ Angular Frontend Pipeline Failed!'
        }
    }
}