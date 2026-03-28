pipeline {
    agent any

    // Must match EXACTLY the name you set in Manage Jenkins → Tools → NodeJS installations
    tools {
        nodejs 'node24'        // ← Changed from 'NodeJS' to 'node24'
    }

    environment {
        CI = 'true'
        PROJECT_DIR = 'p_ifrontend2'   // If your frontend is in a subfolder
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                dir("${PROJECT_DIR}") {
                    sh 'npm ci'                    // More reliable than npm install in CI
                }
            }
        }

        stage('Lint') {
            steps {
                dir("${PROJECT_DIR}") {
                    sh 'npm run lint -- --max-warnings=0'   // Fail build if there are lint errors
                }
            }
        }

        stage('Test') {
            steps {
                dir("${PROJECT_DIR}") {
                    // Better command for Angular + Karma/Jasmine in CI
                    sh 'npm run test -- --watch=false --no-progress --browsers=ChromeHeadless'
                }
            }
            post {
                always {
                    junit '**/test-results/**/*.xml'      // Adjust if your reporter path is different
                    archiveArtifacts artifacts: '**/coverage/**', allowEmptyArchive: true
                }
            }
        }

        stage('Build') {
            steps {
                dir("${PROJECT_DIR}") {
                    sh 'npm run build -- --configuration production'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished'
            archiveArtifacts artifacts: "${PROJECT_DIR}/dist/**", allowEmptyArchive: true
        }
        success {
            echo '✅ Angular Frontend Pipeline Succeeded!'
        }
        failure {
            echo '❌ Angular Frontend Pipeline Failed!'
        }
    }
}
