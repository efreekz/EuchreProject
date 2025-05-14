pipeline {
    agent any
    options {
        skipStagesAfterUnstable()
        disableRestartFromStage()
    }

    tools {
        nodejs "nodejs" 
    }

    stages {
        stage('Install Dependencies') {
            when {
                branch 'main'
            }
            steps {
                sh 'npm install'
            }
        }
				
        stage('Create .env file') {
            when {
                branch 'main'
            }
            environment {
                EURPA_API_QA_PORT = credentials("EURPA_API_QA_PORT")
                EURPA_API_QA_NODE_ENV = credentials("EURPA_API_QA_NODE_ENV")
                EURPA_API_QA_FRONTEND_URL = credentials("EURPA_API_QA_FRONTEND_URL")
                EURPA_API_QA_MONGODB_URL = credentials("EURPA_API_QA_MONGODB_URL")
                EURPA_API_QA_DB_NAME = credentials("EURPA_API_QA_DB_NAME")
                EURPA_API_QA_DESCOPEP_PROJECT_ID = credentials("EURPA_API_QA_DESCOPEP_PROJECT_ID")
                EURPA_API_QA_DESCOPE_MANAGEMENT_KEY = credentials("EURPA_API_QA_DESCOPE_MANAGEMENT_KEY")
                EURPA_API_QA_JWT_SECRET = credentials("EURPA_API_QA_JWT_SECRET")
                EURPA_API_QA_JWT_ACCESS_EXPIRATION_MINUTES = credentials("EURPA_API_QA_JWT_ACCESS_EXPIRATION_MINUTES")
                EURPA_API_QA_JWT_REFRESH_EXPIRATION_MINUTES = credentials("EURPA_API_QA_JWT_REFRESH_EXPIRATION_MINUTES")
                EURPA_API_QA_JWT_RESET_PASSWORD_EXPIRATION_MINUTES = credentials("EURPA_API_QA_JWT_RESET_PASSWORD_EXPIRATION_MINUTES")
                EURPA_API_QA_JWT_VERIFY_EMAIL_EXPIRATION_MINUTES = credentials("EURPA_API_QA_JWT_VERIFY_EMAIL_EXPIRATION_MINUTES")
                EURPA_API_QA_S3_ACCESS_KEY = credentials("EURPA_API_QA_S3_ACCESS_KEY")
                EURPA_API_QA_S3_SECRET_KEY = credentials("EURPA_API_QA_S3_SECRET_KEY")
                EURPA_API_QA_S3_REGION = credentials("EURPA_API_QA_S3_REGION")
                EURPA_API_QA_SE_BUKETNAME =  credentials("EURPA_API_QA_SE_BUKETNAME")
                EURPA_API_QA_EMAIL_HOST = credentials("EURPA_API_QA_EMAIL_HOST")
                EURPA_API_QA_EMAIL_PORT = credentials("EURPA_API_QA_EMAIL_PORT")
                EURPA_API_QA_EMAIL_SECURE = credentials("EURPA_API_QA_EMAIL_SECURE")
                EURPA_API_QA_EMAIL_USER = credentials("EURPA_API_QA_EMAIL_USER")
		EURPA_API_QA_EMAIL_PASS = credentials("EURPA_API_QA_EMAIL_PASS")
            }
            steps {
                sh '''#!/bin/bash
                echo 'Creating .env file...'
                touch .env
                echo PORT=$EURPA_API_QA_PORT >> .env
                echo NODE_ENV=$EURPA_API_QA_NODE_ENV >> .env
                echo FRONTEND_URL=$EURPA_API_QA_FRONTEND_URL >> .env
                echo MONGODB_URL=$EURPA_API_QA_MONGODB_URL >> .env
                echo DB_NAME=$EURPA_API_QA_DB_NAME >> .env
                echo DESCOPEP_PROJECT_ID=$EURPA_API_QA_DESCOPEP_PROJECT_ID >> .env
                echo DESCOPE_MANAGEMENT_KEY=$EURPA_API_QA_DESCOPE_MANAGEMENT_KEY >> .env
                echo JWT_SECRET=$EURPA_API_QA_JWT_SECRET >> .env
                echo JWT_ACCESS_EXPIRATION_MINUTES=$EURPA_API_QA_JWT_ACCESS_EXPIRATION_MINUTES >> .env
                echo JWT_REFRESH_EXPIRATION_MINUTES=$EURPA_API_QA_JWT_REFRESH_EXPIRATION_MINUTES >> .env
                echo JWT_RESET_PASSWORD_EXPIRATION_MINUTES=$EURPA_API_QA_JWT_RESET_PASSWORD_EXPIRATION_MINUTES >> .env
                echo JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=$EURPA_API_QA_JWT_VERIFY_EMAIL_EXPIRATION_MINUTES >> .env
                echo S3_ACCESS_KEY=$EURPA_API_QA_S3_ACCESS_KEY >> .env
                echo S3_SECRET_KEY=$EURPA_API_QA_S3_SECRET_KEY >> .env
                echo S3_REGION=$EURPA_API_QA_S3_REGION >> .env
                echo SE_BUKETNAME=$EURPA_API_QA_SE_BUKETNAME >> .env
                echo EMAIL_HOST=$EURPA_API_QA_EMAIL_HOST >> .env
                echo EMAIL_PORT=$EURPA_API_QA_EMAIL_PORT >> .env
                echo EMAIL_SECURE=$EURPA_API_QA_EMAIL_SECURE >> .env
		echo EMAIL_USER=$EURPA_API_QA_EMAIL_USER >> .env
		echo EMAIL_PASS=$EURPA_API_QA_EMAIL_PASS >> .env


                    
                '''
            }
        }

        stage('deploy-dev') {
            when {
                branch 'main'
            }
            steps {
                sh '''#!/bin/bash
                cd /var/lib/jenkins/workspace/euchre-game-api-Backend_main
                pm2 restart ecosystem.config.json && pm2 save
                '''
            }
        }
    } 
} 
