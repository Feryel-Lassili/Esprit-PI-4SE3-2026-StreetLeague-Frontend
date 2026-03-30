pipeline {
    agent any

    tools {
        nodejs 'node24'
    }

    environment {
        CI = 'true'
        DOCKER_IMAGE = 'fadisaidi02/pi-frontend'   // Your username + image name
        IMAGE_TAG = "${BUILD_NUMBER}"
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

        stage('Build Angular') {
            steps {
                sh 'npm run build -- --configuration production'
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${IMAGE_TAG}")
                    
                    docker.withRegistry('', 'docker-hub-credentials') {
                        docker.image("${DOCKER_IMAGE}:${IMAGE_TAG}").push()
                        docker.image("${DOCKER_IMAGE}:${IMAGE_TAG}").push('latest')
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Frontend Docker Image Pushed Successfully → ${DOCKER_IMAGE}:${IMAGE_TAG}"
        }
        failure {
            echo '❌ Frontend Pipeline Failed!'
        }
    }
}