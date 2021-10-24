FROM jenkins/jenkins:latest

USER root
RUN apt-get update
RUN apt install python3-pip -y
RUN pip3 install awscli --upgrade
USER jenkins