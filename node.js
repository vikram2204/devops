pipeline {
 agent any
 environment {
 IMAGE_NAME = "myapp"
 REGISTRY = "myregistry.example.com"
 }
 stages {
 stage('Checkout') {
 steps {
 git branch: 'main', url: 'https://github.com/yourorg/yourapp.git'
 }
 }
 stage('Install Dependencies') {
 steps {
 sh 'npm install'
 }
 }
 stage('Run Tests') {
 steps {
 sh 'npm test'
 }
 }
 stage('Build') {
 steps {
 sh 'npm run build'
 }
 }
 stage('Build Docker Image') {
 steps {
 sh "docker build -t ${REGISTRY}/${IMAGE_NAME}:${env.BUILD_NUMBER} ."
 }
 }
 stage('Push Image') {
 steps {
 withCredentials([usernamePassword(credentialsId: 'registry-creds',
 usernameVariable: 'USER', passwordVariable: 'PASS')]) {
 sh "docker login -u $USER -p $PASS ${REGISTRY}"
 sh "docker push ${REGISTRY}/${IMAGE_NAME}:${env.BUILD_NUMBER}"
 }
 }
 }
 stage('Deploy') {
 steps {
 sh "kubectl set image deployment/myapp
myapp=${REGISTRY}/${IMAGE_NAME}:${env.BUILD_NUMBER}"
 }
 }
 }
 post {
 success {
 echo 'Pipeline completed successfully!'
 }
 failure {
 echo 'Pipeline failed — check logs.'
 }
 }
}