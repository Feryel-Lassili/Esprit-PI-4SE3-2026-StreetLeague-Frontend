pipeline {
    agent any

    tools {
        nodejs 'node24'          // Must match exactly what you configured in Jenkins Tools
    }

    environment {
        CI = 'true'
        PROJECT_DIR = 'p_ifrontend2'     // Change only if your Angular app is in a different folder
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
                    sh 'npm ci'
                }
            }
        }

        stage('Lint') {
            steps {
                dir("${PROJECT_DIR}") {
                    sh 'npm run lint -- --max-warnings=0'
                }
            }
        }

        stage('Test') {
            steps {
                dir("${PROJECT_DIR}") {
                    // Best command for Angular + Karma/Jasmine in CI
                    sh 'npm run test -- --watch=false --no-progress --browsers=ChromeHeadlessCI'
                }
            }
            post {
                always {
                    // Publish test results for Angular Karma
                    junit allowEmptyResults: true, 
                          testResults: '**/test-results/**/*.xml, **/junit.xml'
                    
                    // Archive coverage report
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
            archiveArtifacts artifacts: "${PROJECT_DIR}/dist/**", allowEmptyArchive: true
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
