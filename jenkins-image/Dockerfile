FROM jenkins/jenkins:latest

USER root

# Install AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install
RUN rm -rf ./aws
RUN rm -rf ./awscliv2.zip

# Install Docker
RUN curl -fsSL "https://get.docker.com" -o "get-docker.sh"
RUN sh ./get-docker.sh
RUN rm -rf ./get-docker.sh

USER jenkins